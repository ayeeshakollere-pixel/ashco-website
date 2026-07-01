// ============================================================================
//  Lightweight local data store (browser localStorage).
//  Lets the app recognise returning customers and remember their details,
//  with no server or database required. Perfect for a live demo.
//  When you're ready for a real backend, swap these functions for API calls.
// ============================================================================

import type { ProductId } from './pricing';

const CUSTOMERS_KEY = 'ashco.customers.v1';
const ORDERS_KEY = 'ashco.orders.v1';

export interface Customer {
  phone: string;
  name: string;
  company?: string;
  address: string;
  city: string;
  orderCount: number;
  createdAt: string;
  lastOrderAt: string;
}

export interface Order {
  id: string;
  phone: string;
  name: string;
  company?: string;
  address: string;
  city: string;
  productId: ProductId;
  productName: string;
  litres: number;
  total: number;
  deliveryDate: string;
  notes?: string;
  createdAt: string;
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / disabled — fail quietly */
  }
}

export function normalisePhone(phone: string): string {
  return phone.replace(/\D/g, '').replace(/^234/, '0');
}

export function findCustomer(phone: string): Customer | null {
  const key = normalisePhone(phone);
  if (key.length < 7) return null;
  const all = readJSON<Record<string, Customer>>(CUSTOMERS_KEY, {});
  return all[key] ?? null;
}

export function isReturning(phone: string): boolean {
  const c = findCustomer(phone);
  return !!c && c.orderCount > 0;
}

export function generateOrderId(): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
    d.getDate()
  ).padStart(2, '0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ASH-${stamp}-${rand}`;
}

export function saveOrder(order: Order) {
  // Store the order
  const orders = readJSON<Order[]>(ORDERS_KEY, []);
  orders.unshift(order);
  writeJSON(ORDERS_KEY, orders.slice(0, 100));

  // Upsert the customer so next time they're recognised as returning
  const key = normalisePhone(order.phone);
  const customers = readJSON<Record<string, Customer>>(CUSTOMERS_KEY, {});
  const existing = customers[key];
  customers[key] = {
    phone: key,
    name: order.name,
    company: order.company,
    address: order.address,
    city: order.city,
    orderCount: (existing?.orderCount ?? 0) + 1,
    createdAt: existing?.createdAt ?? order.createdAt,
    lastOrderAt: order.createdAt,
  };
  writeJSON(CUSTOMERS_KEY, customers);
}

export function getOrders(): Order[] {
  return readJSON<Order[]>(ORDERS_KEY, []);
}
