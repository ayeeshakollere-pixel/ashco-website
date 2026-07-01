// ============================================================================
//  ASHCO ENERGY — PRICING CONFIG
//  ---------------------------------------------------------------------------
//  This is the ONLY file you need to edit to change prices, fees and discounts.
//  All amounts are in Nigerian Naira (₦). Update the numbers, save, redeploy.
// ============================================================================

export type ProductId = 'diesel' | 'petrol' | 'kerosene';

export interface Product {
  id: ProductId;
  name: string;        // Shown to customers
  short: string;       // Badge / abbreviation
  pricePerLitre: number; // ₦ per litre  <-- EDIT THESE
  minLitres: number;   // Smallest order allowed
  maxLitres: number;   // Largest order in one go
  step: number;        // Slider increment
  accent: 'green' | 'yellow' | 'sky';
  blurb: string;
}

// --- 1. PRODUCTS & PRICES ---------------------------------------------------
export const PRODUCTS: Product[] = [
  {
    id: 'diesel',
    name: 'Diesel (AGO)',
    short: 'AGO',
    pricePerLitre: 1250,   // <-- EDIT: current diesel price per litre
    minLitres: 200,
    maxLitres: 33000,
    step: 100,
    accent: 'green',
    blurb: 'Automotive Gas Oil for generators, trucks, plants & industry.',
  },
  {
    id: 'petrol',
    name: 'Petrol (PMS)',
    short: 'PMS',
    pricePerLitre: 950,    // <-- EDIT: current petrol price per litre
    minLitres: 200,
    maxLitres: 33000,
    step: 100,
    accent: 'yellow',
    blurb: 'Premium Motor Spirit for fleets, stations and standby power.',
  },
  {
    id: 'kerosene',
    name: 'Kerosene (DPK)',
    short: 'DPK',
    pricePerLitre: 1300,   // <-- EDIT: current kerosene price per litre
    minLitres: 200,
    maxLitres: 20000,
    step: 100,
    accent: 'sky',
    blurb: 'Dual Purpose Kerosene for heating, aviation support & retail.',
  },
];

// --- 2. FLAT DELIVERY FEE ---------------------------------------------------
// A single flat doorstep-delivery fee applied to every order.
export const FLAT_DELIVERY_FEE = 15000; // <-- EDIT: ₦ flat delivery fee

// --- 3. RETURNING-CUSTOMER DISCOUNT ----------------------------------------
// Customers who have ordered before automatically get this % off the fuel cost
// (delivery fee is not discounted).
export const RETURNING_DISCOUNT_RATE = 0.05; // <-- EDIT: 0.05 = 5% off

// --- 4. VOLUME DISCOUNT TIERS (optional) -----------------------------------
// Bigger orders unlock a lower effective price. Applied to the fuel subtotal.
// Set to [] to switch volume discounts off entirely.
export interface VolumeTier { minLitres: number; rate: number; label: string; }
export const VOLUME_TIERS: VolumeTier[] = [
  { minLitres: 5000,  rate: 0.03, label: 'Bulk 5,000L+' },   // 3% off
  { minLitres: 10000, rate: 0.05, label: 'Bulk 10,000L+' },  // 5% off
  { minLitres: 20000, rate: 0.08, label: 'Bulk 20,000L+' },  // 8% off
];

// ============================================================================
//  CALCULATION ENGINE — you normally don't need to touch anything below here.
// ============================================================================

export interface Quote {
  product: Product;
  litres: number;
  unitPrice: number;
  fuelSubtotal: number;
  volumeTier: VolumeTier | null;
  volumeDiscount: number;
  returningDiscount: number;
  deliveryFee: number;
  total: number;
  totalSavings: number;
}

export function getProduct(id: ProductId): Product {
  return PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];
}

export function bestVolumeTier(litres: number): VolumeTier | null {
  const eligible = VOLUME_TIERS.filter((t) => litres >= t.minLitres);
  return eligible.length ? eligible[eligible.length - 1] : null;
}

export function quote(
  productId: ProductId,
  litres: number,
  isReturning: boolean
): Quote {
  const product = getProduct(productId);
  const unitPrice = product.pricePerLitre;
  const fuelSubtotal = unitPrice * litres;

  const volumeTier = bestVolumeTier(litres);
  const volumeDiscount = volumeTier ? Math.round(fuelSubtotal * volumeTier.rate) : 0;

  const afterVolume = fuelSubtotal - volumeDiscount;
  const returningDiscount = isReturning
    ? Math.round(afterVolume * RETURNING_DISCOUNT_RATE)
    : 0;

  const deliveryFee = FLAT_DELIVERY_FEE;
  const total = fuelSubtotal - volumeDiscount - returningDiscount + deliveryFee;

  return {
    product,
    litres,
    unitPrice,
    fuelSubtotal,
    volumeTier,
    volumeDiscount,
    returningDiscount,
    deliveryFee,
    total,
    totalSavings: volumeDiscount + returningDiscount,
  };
}
