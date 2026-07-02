import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, LogOut, Save, Loader2, ShieldAlert, Package, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase, supabaseReady } from '@/lib/supabase';
import { formatNaira, formatLitres } from '@/lib/format';

interface ProductRow {
  id: string;
  name: string;
  price_per_litre: number;
  min_litres: number;
  max_litres: number;
}

interface SettingsRow {
  id: string;
  flat_delivery_fee: number;
  returning_discount_rate: number;
}

interface OrderRow {
  id: string;
  ref: string;
  name: string;
  phone: string;
  product_name: string;
  litres: number;
  total: number;
  city: string;
  status: string;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { ready, userId, isAdmin, signOut } = useAuth();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [settings, setSettings] = useState<SettingsRow | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !userId) navigate('/login');
  }, [ready, userId, navigate]);

  useEffect(() => {
    async function load() {
      if (!supabaseReady || !userId || !isAdmin) return;
      const [p, s, o] = await Promise.all([
        supabase.from('products').select('id, name, price_per_litre, min_litres, max_litres').order('sort_order'),
        supabase.from('settings').select('id, flat_delivery_fee, returning_discount_rate').eq('id', 'global').single(),
        supabase.from('orders').select('id, ref, name, phone, product_name, litres, total, city, status, created_at').order('created_at', { ascending: false }).limit(50),
      ]);
      setProducts((p.data as ProductRow[]) ?? []);
      setSettings((s.data as SettingsRow) ?? null);
      setOrders((o.data as OrderRow[]) ?? []);
      setLoading(false);
    }
    if (ready && userId && isAdmin) load();
    else if (ready) setLoading(false);
  }, [ready, userId, isAdmin]);

  function updateProduct(id: string, price: number) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, price_per_litre: price } : p)));
  }

  async function saveAll() {
    if (!supabaseReady || !settings) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      for (const p of products) {
        const { error } = await supabase
          .from('products')
          .update({ price_per_litre: p.price_per_litre, updated_at: new Date().toISOString() })
          .eq('id', p.id);
        if (error) throw error;
      }
      const { error: sErr } = await supabase
        .from('settings')
        .update({
          flat_delivery_fee: settings.flat_delivery_fee,
          returning_discount_rate: settings.returning_discount_rate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 'global');
      if (sErr) throw sErr;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (!ready || loading) {
    return (
      <div className="min-h-screen bg-ashco-green-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  // Signed in but NOT an admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-ashco-green-dark flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm text-center">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="font-display text-xl font-bold text-ashco-black mb-2">Admins only</h1>
          <p className="text-sm text-gray-600 mb-6">This area is for the Ashco team. Your account doesn't have admin access.</p>
          <Link to="/" className="inline-block bg-ashco-green text-white font-semibold px-5 py-2.5 rounded-xl">Back home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ashco-green via-ashco-green-dark to-black">
      <header className="sticky top-0 z-30 bg-ashco-green-dark/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <div className="w-9 h-9 bg-white rounded-lg p-1 shadow">
              <img src="/logo.png" alt="Ashco Energy" className="w-full h-full object-contain" />
            </div>
            <div className="font-display font-extrabold tracking-tight">ADMIN DASHBOARD</div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-white/70 hover:text-white transition-colors" aria-label="Home"><Home className="w-5 h-5" /></Link>
            <button onClick={() => { signOut(); navigate('/'); }} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24">
        {/* Pricing */}
        <h1 className="font-display text-3xl font-extrabold text-white mb-1">Pricing</h1>
        <p className="text-white/70 mb-6">Change prices here — the live site updates instantly for everyone.</p>

        <div className="rounded-2xl bg-white p-5 sm:p-6 space-y-5">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 border-b last:border-0 pb-4 last:pb-0">
              <div>
                <div className="font-display font-bold text-ashco-black">{p.name}</div>
                <div className="text-xs text-gray-500">{formatLitres(p.min_litres)}–{formatLitres(p.max_litres)} per order</div>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₦</span>
                <input
                  type="number"
                  value={p.price_per_litre}
                  onChange={(e) => updateProduct(p.id, Number(e.target.value))}
                  className="w-40 text-lg font-display font-bold text-ashco-black border-2 border-gray-200 rounded-xl pl-7 pr-16 py-2.5 focus:border-ashco-green outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">/litre</span>
              </div>
            </div>
          ))}

          {settings && (
            <>
              <div className="flex items-center justify-between gap-4 border-b pb-4">
                <div>
                  <div className="font-display font-bold text-ashco-black">Flat delivery fee</div>
                  <div className="text-xs text-gray-500">Charged once per order</div>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₦</span>
                  <input
                    type="number"
                    value={settings.flat_delivery_fee}
                    onChange={(e) => setSettings({ ...settings, flat_delivery_fee: Number(e.target.value) })}
                    className="w-40 text-lg font-display font-bold text-ashco-black border-2 border-gray-200 rounded-xl pl-7 pr-4 py-2.5 focus:border-ashco-green outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-display font-bold text-ashco-black">Returning-customer discount</div>
                  <div className="text-xs text-gray-500">Percent off fuel for loyal customers</div>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={Math.round(settings.returning_discount_rate * 100)}
                    onChange={(e) => setSettings({ ...settings, returning_discount_rate: Number(e.target.value) / 100 })}
                    className="w-40 text-lg font-display font-bold text-ashco-black border-2 border-gray-200 rounded-xl pl-4 pr-10 py-2.5 focus:border-ashco-green outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">%</span>
                </div>
              </div>
            </>
          )}

          {error && <p className="text-sm font-medium text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button
            onClick={saveAll}
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 bg-ashco-green text-white font-display font-bold py-3.5 rounded-xl hover:bg-ashco-green-dark transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? (<><Check className="w-5 h-5" /> Saved!</>) : (<><Save className="w-5 h-5" /> Save changes</>)}
          </button>
        </div>

        {/* Recent orders */}
        <h2 className="font-display text-2xl font-bold text-white mt-10 mb-3 flex items-center gap-2">
          <Package className="w-6 h-6" /> Recent orders
        </h2>
        {orders.length === 0 ? (
          <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center text-white/70">
            No orders yet.
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <div key={o.id} className="rounded-xl bg-white p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-display font-bold text-ashco-black truncate">{o.name} · <span className="font-normal text-gray-500">{o.phone}</span></div>
                  <div className="text-sm text-gray-500 truncate">{o.product_name} · {formatLitres(o.litres)} → {o.city}</div>
                  <div className="text-xs text-gray-400">{o.ref}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-display font-extrabold text-ashco-green">{formatNaira(o.total)}</div>
                  <span className="inline-block mt-1 text-xs font-semibold text-ashco-yellow-dark bg-ashco-yellow/20 rounded-full px-2 py-0.5 capitalize">{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
