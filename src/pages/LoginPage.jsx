import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function LoginPage() {
  const { signInWithGoogle, signInAsGuest, error, isFirebaseConfigured, setError } = useAuth();
  const [name, setName] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  const handleGuestSignIn = (e) => {
    e.preventDefault();
    setError(null);
    signInAsGuest(name);
  };

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    await signInWithGoogle();
    setSigningIn(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-8 flex flex-col items-center text-center">
          <img
            src="/favicon.svg"
            alt=""
            className="mb-4 h-16 w-16 rounded-2xl"
            aria-hidden
          />
          <h1 className="text-2xl font-bold text-white">Cashflow Tracker</h1>
          <p className="mt-2 text-sm text-portfolio-gray">
            Track expenses, debt, and your safe-to-spend balance.
          </p>
        </div>

        <form onSubmit={handleGuestSignIn} className="space-y-3">
          <Input
            label="Your name"
            type="text"
            placeholder="e.g. William"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
          />
          <Button type="submit" size="lg" className="w-full">
            Continue as Guest
          </Button>
          <p className="text-center text-xs text-portfolio-gray">
            Guest mode saves data on this device only.
          </p>
        </form>

        {isFirebaseConfigured && (
          <>
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-portfolio-border" />
              <span className="text-xs text-portfolio-gray">or</span>
              <div className="h-px flex-1 bg-portfolio-border" />
            </div>

            <Button
              type="button"
              size="lg"
              variant="secondary"
              className="flex w-full items-center justify-center gap-3"
              onClick={handleGoogleSignIn}
              disabled={signingIn}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {signingIn ? 'Signing in…' : 'Continue with Google'}
            </Button>
            <p className="mt-2 text-center text-xs text-portfolio-gray">
              Google syncs your data with Firestore.
            </p>
          </>
        )}

        {error && (
          <p className="mt-3 rounded-xl border border-white/20 bg-portfolio-card px-3 py-2 text-center text-xs text-white">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
