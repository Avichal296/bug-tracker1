import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../app/SessionContext.jsx';
import { Notice } from '../components/Notice.jsx';
import { apiRequest } from '../services/api.js';

export function AuthPage() {
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { signIn } = useSession();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');

    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const session = await apiRequest(`/api/auth/${mode === 'login' ? 'login' : 'signup'}`, {
        method: 'POST',
        body: JSON.stringify(values),
      });
      signIn(session);
      navigate('/bugs', { replace: true });
    } catch (requestError) {
      setError(Object.values(requestError.fields || {})[0] || requestError.message);
    } finally {
      setBusy(false);
    }
  }

  const isLogin = mode === 'login';

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-slate-50 to-slate-50 px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3 font-display text-lg font-extrabold tracking-tight text-slate-800">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-700 text-white">B</span>
          <span>Bug Tracker <span className="font-semibold text-slate-400">Lite</span></span>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/[0.04] sm:p-9">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">A clearer way to track issues</p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-800">{isLogin ? 'Welcome back' : 'Create your account'}</h1>
          <p className="mb-7 mt-2 text-sm leading-6 text-slate-500">{isLogin ? 'Sign in to see what needs attention.' : 'Create an account to start tracking bugs.'}</p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && <label className="form-label">Your name<input className="form-input" name="name" autoComplete="name" minLength="2" maxLength="80" placeholder="e.g. Asha Kumar" required /></label>}
            <label className="form-label">Email address<input className="form-input" name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>
            <label className="form-label">Password<input className="form-input" name="password" type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} minLength="8" placeholder="At least 8 characters" required /></label>
            <Notice>{error}</Notice>
            <button className="button-primary w-full" disabled={busy}>{busy ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}</button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {isLogin ? 'New here?' : 'Already have an account?'}{' '}
            <button className="font-semibold text-emerald-700 hover:text-emerald-800" onClick={() => { setMode(isLogin ? 'signup' : 'login'); setError(''); }}>
              {isLogin ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </section>
        <p className="mt-5 text-center text-xs text-slate-400">Keep the small issues from becoming big ones.</p>
      </div>
    </main>
  );
}
