import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, LogOut, Truck, BadgePercent, Package, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase, supabaseReady } from '@/lib/supabase';
import { formatNaira, formatLitres } from '@/lib/format';

interface OrderRow {
  id: string;
  ref: string;
  product_name: string;
  litres: number;
  total: number;
  status: string;
  delivery_date: string;
  created_at: string;
}

const Account = () => {
  const navigate = useNavigate();
  const { ready, userId, email, profile, isAdmin, signOut } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready && !userId) {
      navigate('/login');
    }
  }, [ready, userId, navigate]);

  useEffect(() => {
    async function load() {
      if (!supabaseReady || !userId) return;
      const { data } = await supabase
        .from('orders')
        .select('id, ref, product_name, litres, total, status, delivery_date, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      setOrders((data as OrderRow[]) ?? []);
      setLoading(false);
    }
    if (userId) load();
  }, [userId]);

  if (!ready || (!userId && ready)) {
    return (
      <div className="min-h-screen bg-ashco-green-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  const orderCount = profile?.order_count ?? 0;
  const isReturning = orderCount > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-ashco-green via-ashco-green-dark to-black">
      <header className="sticky top-0 z-30 bg-ashco-green-dark/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white">
            <div className="w-9 h-9 bg-white rounded-lg p-1 shadow">
              <img src="/logo.png" alt="Ashco Energy" className="w-full h-full object-contain" />
            </div>
            <div className="font-display font-extrabold tracking-tight">ASHCO ENERGY</div>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-white/70 hover:text-white transition-colors" aria-label="Home">
              <Home className="w-5 h-5" />
            </Link>
            <button onClick={() => { signOut(); navigate('/'); }} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-20">
        <h1 className="font-display text-3xl font-extrabold text-white mb-1">
          Hi{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''} 👋
        </h1>
        <p className="text-white/70 mb-6">{email}</p>

        {isAdmin && (
          <Link to="/admin" className="block mb-6 rounded-2xl bg-ashco-yellow text-ashco-black p-4 font-display font-bold hover:bg-ashco-yellow-dark transition-colors">
            You're an admin — open the pricing dashboard →
          </Link>
        )}

        {/* Loyalty card */}
        <div className="rounded-2xl bg-white p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-ashco-green/10 flex items-center justify-center">
              <BadgePercent className="w-6 h-6 text-ashco-green" />
            </div>
            <div>
              <div className="font-display font-bold text-ashco-black">Loyalty status</div>
              <div className="text-sm text-gray-500">{orderCount} order{orderCount === 1 ? '' : 's'} placed</div>
            </div>
          </div>
          {isReturning ? (
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-ashco-green bg-ashco-green/10 rounded-full px-3 py-1.5">
              <Sparkles className="w-4 h-4" /> Loyalty discount active on your next order
            </div>
          ) : (
            <p className="text-sm text-gray-600">Place your first order to unlock your returning-customer discount.</p>
          )}
        </div>

        {/* Orders */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl font-bold text-white">Your orders</h2>
          <Link to="/order" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ashco-yellow hover:text-white transition-colors">
            <Truck className="w-4 h-4" /> New order
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-white animate-spin" /></div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center">
            <Package className="w-10 h-10 text-white/40 mx-auto mb-3" />
            <p className="text-white/70">No orders yet. Your order history will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="rounded-2xl bg-white p-4 flex items-center justify-between">
                <div>
                  <div className="font-display font-bold text-ashco-black">{o.product_name}</div>
                  <div className="text-sm text-gray-500">{formatLitres(o.litres)} · {o.ref}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Deliver: {o.delivery_date}</div>
                </div>
                <div className="text-right">
                  <div className="font-display font-extrabold text-ashco-green">{formatNaira(o.total)}</div>
                  <span className="inline-block mt-1 text-xs font-semibold text-ashco-yellow-dark bg-ashco-yellow/20 rounded-full px-2 py-0.5 capitalize">
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Account;
