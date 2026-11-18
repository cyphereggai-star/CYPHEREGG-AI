import { useState, type FormEvent } from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { sanitizeText } from '@/lib/sanitize';

const APP_ICON = '/file_00000000037c81f4aed797d83aabc06a copy.png';

type Mode = 'login' | 'signup';

interface AuthPageProps {
  mode: Mode;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthPage({ mode }: AuthPageProps) {
  const { navigate } = useRouter();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    fullName?: string;
  }>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === 'signup';

  const validateField = (name: string, value: string) => {
    let err: string | undefined;
    if (name === 'email') {
      if (!value) err = 'Email is required';
      else if (!EMAIL_RE.test(value)) err = 'Enter a valid email address';
    } else if (name === 'password') {
      if (!value) err = 'Password is required';
      else if (value.length < 6) err = 'Password must be at least 6 characters';
    } else if (name === 'fullName') {
      if (isSignup && (!value || value.trim().length < 2))
        err = 'Please enter your name';
    }
    setErrors((prev) => ({ ...prev, [name]: err }));
    return !err;
  };

  const onBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (name === 'email') validateField('email', email);
    if (name === 'password') validateField('password', password);
    if (name === 'fullName') validateField('fullName', fullName);
  };

  const valid =
    EMAIL_RE.test(email) &&
    password.length >= 6 &&
    (!isSignup || fullName.trim().length >= 2);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setTouched({ email: true, password: true, fullName: true });
    const ok =
      validateField('email', email) &&
      validateField('password', password) &&
      (!isSignup || validateField('fullName', fullName));
    if (!ok) return;

    setLoading(true);
    const res = isSignup
      ? await signUp(email.trim(), password, sanitizeText(fullName.trim(), 200))
      : await signIn(email, password);
    setLoading(false);

    if (res.error) {
      setSubmitError(res.error);
      return;
    }
    toast(isSignup ? 'Welcome to CypherEgg AI!' : 'Signed in successfully');
    navigate({ name: 'dashboard', section: 'workspace' });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cyber-bg px-4 py-10">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent-blue/10 blur-[120px]" />

      <div className="relative w-full max-w-md animate-slide-up">
        <button
          onClick={() => navigate({ name: 'landing' })}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-cyber-muted transition-colors hover:text-cyber-text"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </button>

        <div className="rounded-2xl border border-cyber-border bg-cyber-surface/80 p-7 shadow-card backdrop-blur-md">
          <div className="mb-7 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-accent-blue/30 shadow-glow overflow-hidden">
              <img src={APP_ICON} alt="CypherEgg AI" className="h-full w-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold text-cyber-text">
              {isSignup ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="mt-1.5 text-sm text-cyber-muted">
              {isSignup
                ? 'Start building with CypherEgg AI in seconds'
                : 'Sign in to your CypherEgg AI workspace'}
            </p>
          </div>

          {submitError && (
            <div className="mb-4 rounded-lg border border-accent-danger/30 bg-accent-danger/10 px-4 py-3 text-sm text-accent-danger animate-fade-in-fast">
              {submitError}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {isSignup && (
              <Input
                label="Full name"
                name="fullName"
                placeholder="Ada Lovelace"
                autoComplete="name"
                icon={<UserIcon className="h-4 w-4" />}
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (touched.fullName) validateField('fullName', e.target.value);
                }}
                onBlur={() => onBlur('fullName')}
                error={touched.fullName ? errors.fullName : undefined}
                success={
                  !!touched.fullName && !errors.fullName && fullName.trim().length >= 2
                }
              />
            )}

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@gmail.com"
              autoComplete="email"
              icon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (touched.email) validateField('email', e.target.value);
              }}
              onBlur={() => onBlur('email')}
              error={touched.email ? errors.email : undefined}
              success={!!touched.email && !errors.email && EMAIL_RE.test(email)}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder={isSignup ? 'At least 6 characters' : '••••••••'}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              icon={<Lock className="h-4 w-4" />}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (touched.password) validateField('password', e.target.value);
              }}
              onBlur={() => onBlur('password')}
              error={touched.password ? errors.password : undefined}
              success={!!touched.password && !errors.password && password.length >= 6}
              hint={isSignup && !touched.password ? 'Use 6+ characters' : undefined}
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              disabled={!valid}
              rightIcon={!loading ? <ArrowRight className="h-4 w-4" /> : undefined}
            >
              {isSignup ? 'Create account' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-cyber-muted">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() =>
                navigate({ name: isSignup ? 'login' : 'signup' })
              }
              className="font-medium text-accent-blue transition-colors hover:text-accent-blue/80"
            >
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center">
          <Logo size="sm" />
        </div>
      </div>
    </div>
  );
}
