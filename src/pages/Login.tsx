import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight, Home, Loader2 } from 'lucide-react';
import { supabase, supabaseReady } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

type Mode = 'login' | 'signup';

const Login = () => {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!supabaseReady) {
      setError('Login is not configured yet. Please try again later.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, phone } },
        });
        if (error) throw error;
        await refresh();
        // If email confirmation is off, session exists now.
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          navigate('/account');
        } else {
          setNotice('Account created! Check your email to confirm, then log in.');
          setMode('login');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await refresh();
        navigate('/account');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ashco-green via-ashco-green-dark to-black flex flex-col">
      {/* Top bar */}
      <header className="p-4 sm:p-6">
        <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-semibold">
          <Home className="w-4 h-4" /> Back home
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-3">
              <img src="/logo.png" alt="Ashco Energy" className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]" />
            </div>
            <div className="font-display font-extrabold text-2xl text-white tracking-tight">ASHCO ENERGY</div>
            <div className="text-ashco-yellow text-sm font-semibold">We keep you going</div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-ashco-gray rounded-xl mb-6">
              <button
                onClick={() => { setMode('login'); setError(null); setNotice(null); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  mode === 'login' ? 'bg-white text-ashco-green shadow' : 'text-gray-500'
                }`}
              >
                Log in
              </button>
              <button
                onClick={() => { setMode('signup'); setError(null); setNotice(null); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  mode === 'signup' ? 'bg-white text-ashco-green shadow' : 'text-gray-500'
                }`}
              >
                Sign up
              </button>
            </div>

            <h1 className="font-display text-2xl font-bold text-ashco-black mb-1">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              {mode === 'login'
                ? 'Log in to track orders and earn loyalty discounts.'
                : 'Sign up so your loyalty discount follows you everywhere.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <Field label="Full name" icon={User}>
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Your name" className="input-base" />
                  </Field>
                  <Field label="Phone" icon={Phone}>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="0803 000 0000" className="input-base" />
                  </Field>
                </>
              )}
              <Field label="Email" icon={Mail}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="input-base" />
              </Field>
              <Field label="Password" icon={Lock}>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters" className="input-base" />
              </Field>

              {error && <p className="text-sm font-medium text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
              {notice && <p className="text-sm font-medium text-ashco-green bg-ashco-green/10 rounded-lg px-3 py-2">{notice}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-ashco-green text-white font-display font-bold py-3.5 rounded-xl hover:bg-ashco-green-dark transition-colors disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    {mode === 'login' ? 'Log in' : 'Create account'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-white/50 text-xs mt-6">
            You can still <Link to="/order" className="text-ashco-yellow font-semibold">order as a guest</Link> without an account.
          </p>
        </div>
      </div>
    </div>
  );
};

function Field({ label, icon: Icon, children }: { label: string; icon: typeof User; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-sm font-semibold text-ashco-black mb-1.5">
        <Icon className="w-4 h-4 text-ashco-green" /> {label}
      </span>
      {children}
    </label>
  );
}

export default Login;
