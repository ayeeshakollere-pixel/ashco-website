import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Fuel,
  Droplets,
  Flame,
  ArrowRight,
  ArrowLeft,
  Check,
  MapPin,
  Phone,
  Building2,
  User,
  CalendarClock,
  BadgePercent,
  Truck,
  Sparkles,
  MessageCircle,
  Home,
  Mail,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { PRODUCTS, quote, type ProductId } from '@/lib/pricing';
import { formatNaira, formatLitres, formatNumber } from '@/lib/format';
import {
  findCustomer,
  isReturning,
  saveOrder,
  generateOrderId,
  normalisePhone,
  type Order as OrderRecord,
} from '@/lib/storage';
import { COMPANY } from '@/lib/company';
import { supabase, supabaseReady } from '@/lib/supabase';
import FaqBot from '@/components/FaqBot';

const PRESETS = [200, 500, 1000, 2000, 5000, 10000];

const ACCENT: Record<string, { ring: string; bg: string; text: string; icon: typeof Fuel }> = {
  green: { ring: 'ring-ashco-green', bg: 'bg-ashco-green', text: 'text-ashco-green', icon: Fuel },
  yellow: { ring: 'ring-ashco-yellow', bg: 'bg-ashco-yellow', text: 'text-ashco-yellow-dark', icon: Droplets },
  sky: { ring: 'ring-sky-500', bg: 'bg-sky-500', text: 'text-sky-600', icon: Flame },
};

type Step = 1 | 2 | 3 | 4;

// Paystack public key — set VITE_PAYSTACK_PUBLIC_KEY in Vercel to switch on
// online payment. While it's absent, ordering works exactly as before.
const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined;

function loadPaystack(): Promise<any> {
  return new Promise((resolve, reject) => {
    const w = window as any;
    if (w.PaystackPop) return resolve(w.PaystackPop);
    const s = document.createElement('script');
    s.src = 'https://js.paystack.co/v1/inline.js';
    s.onload = () => resolve(w.PaystackPop);
    s.onerror = () => reject(new Error('Could not load the payment window. Check your connection and try again.'));
    document.body.appendChild(s);
  });
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

const Order = () => {
  const [step, setStep] = useState<Step>(1);

  // Step 1
  const [productId, setProductId] = useState<ProductId>('diesel');
  const [litres, setLitres] = useState<number>(1000);

  // Live stock from the database, keyed by product id
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [stockLoaded, setStockLoaded] = useState(false);

  // Step 2
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [recognised, setRecognised] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // Step 3/4
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<OrderRecord | null>(null);
  const [serverRef, setServerRef] = useState<string>('');
  const [paid, setPaid] = useState(false);

  const product = PRODUCTS.find((p) => p.id === productId)!;
  const returning = phone ? isReturning(phone) : false;
  const payEnabled = Boolean(PAYSTACK_KEY);

  const q = useMemo(
    () => quote(productId, litres, returning),
    [productId, litres, returning]
  );

  // Stock helpers for the selected product
  const available: number | null =
    stockLoaded && productId in stockMap ? stockMap[productId] : null;
  const outOfStock = available !== null && available < product.minLitres;
  const overStock = available !== null && litres > available;
  const sliderMax =
    available === null
      ? product.maxLitres
      : Math.max(product.minLitres, Math.min(product.maxLitres, available));

  async function loadStock() {
    if (!supabaseReady) {
      setStockLoaded(true);
      return;
    }
    const { data } = await supabase.from('products').select('id, stock_litres');
    const map: Record<string, number> = {};
    (data ?? []).forEach((r: any) => {
      map[r.id] = Number(r.stock_litres);
    });
    setStockMap(map);
    setStockLoaded(true);
  }

  useEffect(() => {
    loadStock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If stock is lower than the current quantity, pull the quantity down
  useEffect(() => {
    if (available !== null && !outOfStock && litres > available) {
      setLitres(Math.max(product.minLitres, Math.min(litres, available)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [available]);

  function checkReturning() {
    const c = findCustomer(phone);
    if (c) {
      setName((n) => n || c.name);
      setCompany((v) => v || c.company || '');
      setAddress((v) => v || c.address);
      setCity((v) => v || c.city);
      setRecognised(c.name.split(' ')[0] || 'there');
    } else {
      setRecognised(null);
    }
  }

  const detailsValid =
    normalisePhone(phone).length >= 7 &&
    name.trim().length > 1 &&
    address.trim().length > 3 &&
    city.trim().length > 1 &&
    deliveryDate.length > 0 &&
    (!payEnabled || isValidEmail(email));

  // Make sure the fuel is really there right before we take money
  async function ensureStock() {
    if (!supabaseReady) return;
    const { data, error } = await supabase
      .from('products')
      .select('stock_litres')
      .eq('id', productId)
      .single();
    if (!error && data && litres > Number(data.stock_litres)) {
      throw new Error(
        `Only ${formatNumber(Number(data.stock_litres))} litres available right now. Please lower your quantity.`
      );
    }
  }

  function payWithPaystack(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const Paystack = await loadPaystack();
        const handler = Paystack.setup({
          key: PAYSTACK_KEY,
          email: email.trim(),
          amount: Math.round(q.total * 100), // Paystack works in kobo
          currency: 'NGN',
          metadata: {
            custom_fields: [
              { display_name: 'Product', variable_name: 'product', value: product.name },
              { display_name: 'Litres', variable_name: 'litres', value: String(litres) },
              { display_name: 'Phone', variable_name: 'phone', value: normalisePhone(phone) },
            ],
          },
          callback: (resp: any) => resolve(resp.reference as string),
          onClose: () => reject(new Error('Payment was cancelled — your order was not placed.')),
        });
        handler.openIframe();
      } catch (e) {
        reject(e);
      }
    });
  }

  async function finalizeOrder(paymentRef: string | null) {
    let ref: string;

    if (supabaseReady) {
      const { data, error } = await supabase.rpc('place_order', {
        p_product_id: productId,
        p_litres: litres,
        p_name: name.trim(),
        p_phone: normalisePhone(phone),
        p_company: company.trim() || null,
        p_address: address.trim(),
        p_city: city.trim(),
        p_delivery_date: deliveryDate,
        p_notes: notes.trim() || null,
        p_total: q.total,
        p_payment_ref: paymentRef,
      });

      if (error) {
        if (paymentRef) {
          throw new Error(
            `Your payment went through (ref ${paymentRef}) but we couldn't reserve the fuel: ${error.message} ` +
              `Please contact us with this reference and we'll sort it out right away.`
          );
        }
        throw new Error(error.message);
      }
      ref = data as string;
    } else {
      ref = generateOrderId();
    }

    const order: OrderRecord = {
      id: ref,
      phone: normalisePhone(phone),
      name: name.trim(),
      company: company.trim() || undefined,
      address: address.trim(),
      city: city.trim(),
      productId,
      productName: product.name,
      litres,
      total: q.total,
      deliveryDate,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    saveOrder(order);
    setPlacedOrder(order);
    setServerRef(ref);
    setPaid(Boolean(paymentRef));
    loadStock(); // refresh remaining stock
    setStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submitOrder() {
    setOrderError(null);
    if (overStock || outOfStock) {
      setOrderError('That quantity is more than we currently have in stock. Please lower it.');
      return;
    }
    setSubmitting(true);
    try {
      if (payEnabled) {
        await ensureStock();      // check before charging
        const ref = await payWithPaystack();
        await finalizeOrder(ref);
      } else {
        await finalizeOrder(null); // no online payment configured yet
      }
    } catch (e: any) {
      setOrderError(e?.message || 'Something went wrong placing your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function whatsappLink(order: OrderRecord) {
    const lines = [
      `*New order — ${COMPANY.name}*`,
      `Order ID: ${order.id}`,
      paid ? `Payment: PAID (online)` : `Payment: to arrange`,
      `Product: ${order.productName}`,
      `Quantity: ${formatNumber(order.litres)} litres`,
      `Total: ${formatNaira(order.total)}`,
      `Deliver to: ${order.address}, ${order.city}`,
      `Preferred date: ${order.deliveryDate}`,
      `Name: ${order.name}${order.company ? ` (${order.company})` : ''}`,
      `Phone: ${order.phone}`,
      order.notes ? `Notes: ${order.notes}` : '',
    ].filter(Boolean);
    return `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ashco-green via-ashco-green-dark to-black">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-ashco-green-dark/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white">
            <div className="w-9 h-9 bg-white rounded-lg p-1 shadow">
              <img src="/logo.png" alt="Ashco Energy" className="w-full h-full object-contain" />
            </div>
            <div className="leading-none">
              <div className="font-display font-extrabold tracking-tight text-lg">ASHCO ENERGY</div>
              <div className="text-[11px] text-ashco-yellow font-semibold">We keep you going</div>
            </div>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" /> Home
          </Link>
        </div>
      </header>

      {/* Progress */}
      {step < 4 && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
          <Stepper step={step} />
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28">
        {step === 1 && (
          <div className="grid lg:grid-cols-[1fr_360px] gap-6">
            <section>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-1">
                What do you need?
              </h1>
              <p className="text-white/70 mb-6">Pick a product, then set how many litres.</p>

              {/* Products */}
              <div className="grid sm:grid-cols-3 gap-3 mb-8">
                {PRODUCTS.map((p) => {
                  const a = ACCENT[p.accent];
                  const Icon = a.icon;
                  const selected = p.id === productId;
                  const stock = stockLoaded && p.id in stockMap ? stockMap[p.id] : null;
                  const soldOut = stock !== null && stock < p.minLitres;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setProductId(p.id);
                        const cap =
                          stockLoaded && p.id in stockMap
                            ? Math.min(p.maxLitres, stockMap[p.id])
                            : p.maxLitres;
                        setLitres((l) => Math.min(Math.max(l, p.minLitres), Math.max(p.minLitres, cap)));
                      }}
                      className={`text-left rounded-2xl p-4 bg-white transition-all duration-200 ring-2 ${
                        selected ? `${a.ring} shadow-xl -translate-y-0.5` : 'ring-transparent hover:ring-white/40'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl ${a.bg} flex items-center justify-center mb-3`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="font-display font-bold text-ashco-black">{p.name}</div>
                      <div className="text-xs text-gray-500 mb-2">{p.blurb}</div>
                      <div className={`text-sm font-bold ${a.text}`}>
                        {formatNaira(p.pricePerLitre)}<span className="text-gray-400 font-medium">/litre</span>
                      </div>
                      {stock !== null && (
                        <div className={`mt-2 text-xs font-semibold ${soldOut ? 'text-red-600' : 'text-gray-500'}`}>
                          {soldOut ? 'Out of stock' : `${formatNumber(stock)} L in stock`}
                        </div>
                      )}
                      {selected && !soldOut && (
                        <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-ashco-green">
                          <Check className="w-3.5 h-3.5" /> Selected
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quantity */}
              <div className="rounded-2xl bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-bold text-lg text-ashco-black">How many litres?</h2>
                  <span className="text-xs text-gray-500">
                    Min {formatNumber(product.minLitres)} • Max {formatNumber(product.maxLitres)}
                  </span>
                </div>

                {available !== null && !outOfStock && (
                  <div className="mb-4 text-sm font-semibold text-ashco-green bg-ashco-green/10 rounded-lg px-3 py-2">
                    {formatNumber(available)} litres available for {product.name}
                  </div>
                )}
                {outOfStock && (
                  <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-red-700 bg-red-50 rounded-lg px-3 py-2">
                    <AlertTriangle className="w-4 h-4" /> {product.name} is currently out of stock — please pick another product.
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-5">
                  {PRESETS.filter((v) => v >= product.minLitres && v <= sliderMax).map((v) => (
                    <button
                      key={v}
                      onClick={() => setLitres(v)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                        litres === v
                          ? 'bg-ashco-green text-white'
                          : 'bg-ashco-gray text-ashco-black hover:bg-ashco-green/10'
                      }`}
                    >
                      {formatNumber(v)}L
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min={product.minLitres}
                  max={sliderMax}
                  step={product.step}
                  value={Math.min(litres, sliderMax)}
                  disabled={outOfStock}
                  onChange={(e) => setLitres(Number(e.target.value))}
                  className="w-full accent-ashco-green h-2 mb-4 cursor-pointer disabled:opacity-40"
                />

                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={product.minLitres}
                      max={sliderMax}
                      value={litres}
                      onChange={(e) => setLitres(Number(e.target.value))}
                      onBlur={() =>
                        setLitres((l) =>
                          Math.min(Math.max(l || product.minLitres, product.minLitres), sliderMax)
                        )
                      }
                      className="w-full text-2xl font-display font-bold text-ashco-black border-2 border-gray-200 rounded-xl px-4 py-3 pr-16 focus:border-ashco-green outline-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                      litres
                    </span>
                  </div>
                </div>

                {overStock && !outOfStock && (
                  <p className="mt-3 text-sm font-semibold text-red-600">
                    Only {formatNumber(available!)} litres available — please lower your quantity.
                  </p>
                )}
              </div>
            </section>

            {/* Live pump summary */}
            <aside className="lg:sticky lg:top-24 h-fit">
              <PumpTotal
                litres={litres}
                total={q.total}
                unit={q.unitPrice}
                savings={q.totalSavings}
                tierLabel={q.volumeTier?.label ?? null}
              />
              <button
                onClick={() => setStep(2)}
                disabled={outOfStock || overStock}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-ashco-yellow text-ashco-black font-display font-bold text-lg px-6 py-4 rounded-2xl hover:bg-ashco-yellow-dark transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to delivery <ArrowRight className="w-5 h-5" />
              </button>
            </aside>
          </div>
        )}

        {step === 2 && (
          <div className="grid lg:grid-cols-[1fr_360px] gap-6">
            <section>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-1">
                Where should we deliver?
              </h1>
              <p className="text-white/70 mb-6">
                Enter your phone first — returning customers get a discount applied automatically.
              </p>

              <div className="rounded-2xl bg-white p-5 sm:p-6 space-y-4">
                {/* Phone + recognise */}
                <Field label="Phone number" icon={Phone}>
                  <div className="flex gap-2">
                    <input
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setRecognised(null);
                      }}
                      onBlur={checkReturning}
                      placeholder="0803 000 0000"
                      inputMode="tel"
                      className="flex-1 input-base"
                    />
                    <button
                      onClick={checkReturning}
                      className="px-4 rounded-xl bg-ashco-green text-white text-sm font-semibold hover:bg-ashco-green-dark transition-colors"
                    >
                      Check
                    </button>
                  </div>
                  {recognised && (
                    <div className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-ashco-green bg-ashco-green/10 rounded-full px-3 py-1.5">
                      <Sparkles className="w-4 h-4" /> Welcome back, {recognised}! Your 5% loyalty discount is applied.
                    </div>
                  )}
                </Field>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Full name" icon={User}>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="input-base" />
                  </Field>
                  <Field label={payEnabled ? 'Email (for your receipt)' : 'Email (optional)'} icon={Mail}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      inputMode="email"
                      className="input-base"
                    />
                  </Field>
                </div>

                <Field label="Company (optional)" icon={Building2}>
                  <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Business name" className="input-base" />
                </Field>

                <Field label="Delivery address" icon={MapPin}>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, area, landmark" className="input-base" />
                </Field>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="City / State" icon={MapPin}>
                    <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Abuja" className="input-base" />
                  </Field>
                  <Field label="Preferred delivery date" icon={CalendarClock}>
                    <input
                      type="date"
                      value={deliveryDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="input-base"
                    />
                  </Field>
                </div>

                <Field label="Notes for the driver (optional)">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Gate code, tank location, contact on site…"
                    className="input-base resize-none"
                  />
                </Field>

                {touched && !detailsValid && (
                  <p className="text-sm font-medium text-red-600">
                    Please fill in phone, name{payEnabled ? ', a valid email' : ''}, address, city and a delivery date to continue.
                  </p>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-5 py-3 rounded-xl hover:bg-white/20 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => {
                    setTouched(true);
                    if (detailsValid) setStep(3);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-ashco-yellow text-ashco-black font-display font-bold px-6 py-3 rounded-xl hover:bg-ashco-yellow-dark transition-colors"
                >
                  Review order <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </section>

            <aside className="lg:sticky lg:top-24 h-fit">
              <PumpTotal
                litres={litres}
                total={q.total}
                unit={q.unitPrice}
                savings={q.totalSavings}
                tierLabel={q.volumeTier?.label ?? null}
                productName={product.name}
              />
            </aside>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-2xl mx-auto">
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-1">
              Review &amp; confirm
            </h1>
            <p className="text-white/70 mb-6">Check everything looks right, then place your order.</p>

            <div className="rounded-2xl bg-white overflow-hidden">
              <div className="bg-ashco-green text-white p-5 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-white/70">Delivering</div>
                  <div className="font-display text-xl font-bold">{product.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-wide text-white/70">Quantity</div>
                  <div className="font-display text-xl font-bold">{formatLitres(litres)}</div>
                </div>
              </div>

              <div className="p-5 space-y-3 text-sm">
                <SummaryRow label={`Fuel (${formatNumber(litres)} × ${formatNaira(q.unitPrice)})`} value={formatNaira(q.fuelSubtotal)} />
                {q.volumeDiscount > 0 && (
                  <SummaryRow label={`Bulk discount (${q.volumeTier?.label})`} value={`− ${formatNaira(q.volumeDiscount)}`} good />
                )}
                {q.returningDiscount > 0 && (
                  <SummaryRow label="Loyalty discount (returning customer)" value={`− ${formatNaira(q.returningDiscount)}`} good />
                )}
                <SummaryRow label="Flat doorstep delivery fee" value={formatNaira(q.deliveryFee)} />
                <div className="border-t border-dashed pt-3 flex items-center justify-between">
                  <span className="font-display font-bold text-lg text-ashco-black">Total to pay</span>
                  <span className="font-display font-extrabold text-2xl text-ashco-green">{formatNaira(q.total)}</span>
                </div>
                {q.totalSavings > 0 && (
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-ashco-green bg-ashco-green/10 rounded-full px-3 py-1.5">
                    <BadgePercent className="w-3.5 h-3.5" /> You saved {formatNaira(q.totalSavings)} on this order
                  </div>
                )}
              </div>

              <div className="border-t p-5 grid sm:grid-cols-2 gap-4 text-sm">
                <Detail label="Deliver to" value={`${address}, ${city}`} />
                <Detail label="Preferred date" value={deliveryDate} />
                <Detail label="Contact" value={`${name}${company ? ` — ${company}` : ''}`} />
                <Detail label="Phone" value={normalisePhone(phone)} />
                {email && <Detail label="Email" value={email.trim()} />}
                {notes && <Detail label="Notes" value={notes} />}
              </div>
            </div>

            {orderError && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{orderError}</span>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep(2)}
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-5 py-3 rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={submitOrder}
                disabled={submitting}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-ashco-yellow text-ashco-black font-display font-bold text-lg px-6 py-3 rounded-xl hover:bg-ashco-yellow-dark transition-colors shadow-lg disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing…
                  </>
                ) : payEnabled ? (
                  <>
                    <Check className="w-5 h-5" /> Pay {formatNaira(q.total)} &amp; place order
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" /> Place order
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 4 && placedOrder && (
          <div className="max-w-xl mx-auto text-center pt-6">
            <div className="w-20 h-20 rounded-full bg-ashco-yellow mx-auto flex items-center justify-center mb-6 shadow-xl">
              <Check className="w-10 h-10 text-ashco-black" strokeWidth={3} />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-2">
              Order placed!
            </h1>
            <p className="text-white/70 mb-6">
              Thanks, {placedOrder.name.split(' ')[0]}. We'll confirm your delivery shortly.
            </p>

            <div className="rounded-2xl bg-white p-6 text-left mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">Order ID</span>
                <span className="font-display font-bold text-ashco-black">{serverRef || placedOrder.id}</span>
              </div>
              {paid && (
                <div className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-ashco-green bg-ashco-green/10 rounded-full px-3 py-1.5">
                  <Check className="w-3.5 h-3.5" /> Payment received
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <Truck className="w-5 h-5 text-ashco-green" />
                <span className="text-sm text-ashco-black">
                  {placedOrder.productName} · {formatLitres(placedOrder.litres)} to {placedOrder.city}
                </span>
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <span className="font-semibold text-ashco-black">Total</span>
                <span className="font-display font-extrabold text-xl text-ashco-green">
                  {formatNaira(placedOrder.total)}
                </span>
              </div>
            </div>

            <a
              href={whatsappLink(placedOrder)}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-display font-bold text-lg px-6 py-4 rounded-2xl hover:brightness-95 transition-all shadow-lg mb-3"
            >
              <MessageCircle className="w-5 h-5" /> {paid ? 'Share order on WhatsApp' : 'Send order on WhatsApp'}
            </a>
            <p className="text-xs text-white/50 mb-6">
              {paid
                ? 'Your payment is confirmed. Tap to share the delivery details with our team.'
                : 'Tap to send your order straight to our team so we can confirm and dispatch.'}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPlacedOrder(null);
                  setServerRef('');
                  setPaid(false);
                  setOrderError(null);
                  setStep(1);
                  setLitres(1000);
                }}
                className="flex-1 bg-white/10 text-white font-semibold px-5 py-3 rounded-xl hover:bg-white/20 transition-colors"
              >
                Place another order
              </button>
              <Link
                to="/"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-ashco-yellow text-ashco-black font-semibold px-5 py-3 rounded-xl hover:bg-ashco-yellow-dark transition-colors"
              >
                Back home
              </Link>
            </div>
          </div>
        )}
      </main>
      <FaqBot />
    </div>
  );
};

/* ---------- small building blocks ---------- */

function Stepper({ step }: { step: Step }) {
  const items = ['Product', 'Delivery', 'Confirm'];
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {items.map((label, i) => {
        const n = (i + 1) as Step;
        const done = step > n;
        const active = step === n;
        return (
          <div key={label} className="flex items-center gap-2 sm:gap-4 flex-1">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  done ? 'bg-ashco-yellow text-ashco-black' : active ? 'bg-white text-ashco-green' : 'bg-white/20 text-white/60'
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : n}
              </div>
              <span className={`text-sm font-semibold hidden sm:block ${active || done ? 'text-white' : 'text-white/50'}`}>
                {label}
              </span>
            </div>
            {i < items.length - 1 && (
              <div className={`h-0.5 flex-1 rounded ${done ? 'bg-ashco-yellow' : 'bg-white/20'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PumpTotal({
  litres,
  total,
  unit,
  savings,
  tierLabel,
  productName,
}: {
  litres: number;
  total: number;
  unit: number;
  savings: number;
  tierLabel: string | null;
  productName?: string;
}) {
  return (
    <div className="rounded-2xl bg-ashco-black text-white p-6 shadow-2xl border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase tracking-widest text-white/50">Order total</span>
        <Fuel className="w-5 h-5 text-ashco-yellow" />
      </div>
      <div className="font-display text-4xl sm:text-5xl font-extrabold text-ashco-yellow tabular-nums leading-none">
        {formatNaira(total)}
      </div>
      <div className="mt-3 space-y-1 text-sm text-white/70">
        {productName && <div>{productName}</div>}
        <div>{formatLitres(litres)} · {formatNaira(unit)}/L</div>
      </div>
      {tierLabel && (
        <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-ashco-black bg-ashco-yellow rounded-full px-3 py-1">
          <BadgePercent className="w-3.5 h-3.5" /> {tierLabel} unlocked
        </div>
      )}
      {savings > 0 && (
        <div className="mt-2 text-xs text-ashco-yellow font-semibold">
          You're saving {formatNaira(savings)}
        </div>
      )}
      <div className="mt-4 flex items-center gap-2 text-xs text-white/50 border-t border-white/10 pt-3">
        <Truck className="w-4 h-4" /> Flat doorstep delivery included
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: typeof User;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-sm font-semibold text-ashco-black mb-1.5">
        {Icon && <Icon className="w-4 h-4 text-ashco-green" />}
        {label}
      </span>
      {children}
    </label>
  );
}

function SummaryRow({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className={good ? 'font-semibold text-ashco-green' : 'font-semibold text-ashco-black'}>{value}</span>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-gray-400">{label}</div>
      <div className="text-ashco-black font-medium">{value}</div>
    </div>
  );
}

export default Order;
