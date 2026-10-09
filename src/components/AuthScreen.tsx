import React, { useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthScreen: React.FC = () => {
  const { isSupabaseConfigured, authError, signIn } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSigningIn(true);
    await signIn(email, password);
    setIsSigningIn(false);
  };

  return (
    <main className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-6">
      <section className="w-full max-w-md bg-[#0e1726] border border-[#1b283d] rounded-2xl p-8 shadow-2xl">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 flex items-center justify-center mb-5">
          <LockKeyhole className="w-5 h-5" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Noor Bike Rentals</h1>
        {isSupabaseConfigured ? (
          <>
            <p className="text-sm text-slate-400 mt-2">Sign in with your authorized staff account.</p>
            {authError && (
              <p role="alert" className="mt-4 rounded-xl border border-rose-700/50 bg-rose-950/40 p-3 text-sm text-rose-300">
                {authError}
              </p>
            )}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block text-xs font-semibold text-slate-300">
                Email
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1.5 w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-300">
                Password
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1.5 w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </label>
              <button
                type="submit"
                disabled={isSigningIn}
                className="w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 px-4 py-3 text-sm font-bold text-white"
              >
                {isSigningIn ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </>
        ) : (
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p>Supabase is not configured yet. Add the project URL and publishable key to <code className="text-cyan-300">.env.local</code>:</p>
            <pre className="overflow-x-auto rounded-xl border border-[#1f2e46] bg-[#090d16] p-4 text-xs text-cyan-200">
{`VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_KEY`}
            </pre>
            <p className="text-slate-400">Then apply the migration documented in README.md and restart the development server.</p>
          </div>
        )}
      </section>
    </main>
  );
};
