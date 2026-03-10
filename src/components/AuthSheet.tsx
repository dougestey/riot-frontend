'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthSheetProps {
  mode: 'login' | 'register' | null;
}

export function AuthSheet({ mode }: AuthSheetProps) {
  const { login, register, closeAuthSheet } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localMode, setLocalMode] = useState<'login' | 'register'>('login');

  const activeMode = mode ?? localMode;
  const isOpen = mode !== null;

  function resetForm() {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setError('');
    setSubmitting(false);
  }

  function switchMode() {
    setError('');
    setLocalMode(activeMode === 'login' ? 'register' : 'login');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (activeMode === 'login') {
        await login(email, password);
      } else {
        await register({ email, password, firstName, lastName });
      }
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    resetForm();
    closeAuthSheet();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-lg rounded-t-2xl bg-riot-black px-6 pb-8 pt-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />

        <h2 className="text-center text-lg font-semibold text-riot-text">
          {activeMode === 'login' ? 'Sign In' : 'Create Account'}
        </h2>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          {activeMode === 'register' && (
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-riot-text placeholder-riot-text-secondary outline-none focus:border-riot-pink"
              />
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-riot-text placeholder-riot-text-secondary outline-none focus:border-riot-pink"
              />
            </div>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-riot-text placeholder-riot-text-secondary outline-none focus:border-riot-pink"
            autoComplete="email"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-riot-text placeholder-riot-text-secondary outline-none focus:border-riot-pink"
            autoComplete={activeMode === 'login' ? 'current-password' : 'new-password'}
          />

          {error && (
            <p className="text-center text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-riot-pink py-3 text-sm font-semibold text-white shadow-sm active:opacity-85 disabled:opacity-50"
          >
            {submitting
              ? 'Please wait...'
              : activeMode === 'login'
                ? 'Sign In'
                : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-riot-text-secondary">
          {activeMode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={switchMode}
                className="font-medium text-riot-pink"
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={switchMode}
                className="font-medium text-riot-pink"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
