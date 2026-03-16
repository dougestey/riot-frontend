'use client';

import { useState, type FormEvent } from 'react';
import { Sheet } from 'konsta/react';
import { useAuth } from '@/lib/auth';

interface AuthSheetProps {
  opened: boolean;
  onClose: () => void;
}

type Mode = 'login' | 'register';

export function AuthSheet({ opened, onClose }: AuthSheetProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setError('');
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    setMode('login');
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, firstName || undefined, lastName || undefined);
      }
      handleClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = () => {
    setError('');
    setMode(mode === 'login' ? 'register' : 'login');
  };

  return (
    <Sheet
      opened={opened}
      onBackdropClick={handleClose}
      className="!bg-riot-black pb-safe"
    >
      <div className="mx-auto w-full max-w-sm px-6 py-8">
        {/* Handle bar */}
        <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-white/20" />

        <h2 className="font-display text-xl font-semibold text-white">
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </h2>
        <p className="mt-1 text-sm text-white/60">
          {mode === 'login'
            ? 'Welcome back to RIOT'
            : 'Join RIOT to save events and more'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'register' && (
            <div className="flex gap-3">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                autoComplete="given-name"
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3.5 text-sm text-riot-text placeholder:text-riot-text-secondary/60 focus:border-riot-pink focus:ring-1 focus:ring-riot-pink focus:outline-none"
              />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                autoComplete="family-name"
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3.5 text-sm text-riot-text placeholder:text-riot-text-secondary/60 focus:border-riot-pink focus:ring-1 focus:ring-riot-pink focus:outline-none"
              />
            </div>
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            required
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3.5 text-sm text-riot-text placeholder:text-riot-text-secondary/60 focus:border-riot-pink focus:ring-1 focus:ring-riot-pink focus:outline-none"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'register' ? 'Password (8+ characters)' : 'Password'}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            minLength={mode === 'register' ? 8 : undefined}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3.5 text-sm text-riot-text placeholder:text-riot-text-secondary/60 focus:border-riot-pink focus:ring-1 focus:ring-riot-pink focus:outline-none"
          />

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-riot-pink py-2.5 text-sm font-semibold text-white shadow-sm cursor-pointer active:opacity-85 disabled:opacity-50"
          >
            {submitting
              ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
              : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/60">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={switchMode}
                className="font-semibold text-riot-pink cursor-pointer"
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
                className="font-semibold text-riot-pink cursor-pointer"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </Sheet>
  );
}
