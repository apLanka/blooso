'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { loginSchema, type LoginInput } from '@repo/shared/schemas';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const href =
        user.role === 'admin'
          ? '/admin/dashboard'
          : user.role === 'client'
            ? '/account'
            : '/dashboard';
      console.log('[LoginPage] already authenticated, redirecting to:', href);
      setTimeout(() => router.replace(href), 0);
    }
  }, [isAuthenticated, user, router]);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  console.log('[LoginPage] render - isAuthenticated:', isAuthenticated, 'user:', user?.role);

  if (isAuthenticated && user) {
    return null;
  }

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    try {
      console.log('[LoginPage] onSubmit - calling login()');
      const loggedInUser = await login(data.email, data.password);
      console.log('[LoginPage] login() returned - role:', loggedInUser.role);
      const href =
        loggedInUser.role === 'admin'
          ? '/admin/dashboard'
          : loggedInUser.role === 'client'
            ? '/account'
            : '/dashboard';
      console.log('[LoginPage] pushing to:', href);
      router.push(href);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="animate-fade-up">
      {/* Heading */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
        >
          Welcome back
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
          Sign in to your Blooso account
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="mb-6 rounded-xl px-4 py-3 text-sm font-medium"
          style={{
            backgroundColor: 'rgba(185, 28, 28, 0.06)',
            color: '#b91c1c',
            border: '1px solid rgba(185, 28, 28, 0.15)',
          }}
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="login-email"
            className="block text-sm font-medium"
            style={{ color: 'var(--blooso-text)' }}
          >
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            className={cn(
              'h-11 w-full rounded-[10px] border px-4 text-sm outline-none transition-all',
              'placeholder:text-sm',
              'focus:ring-2'
            )}
            style={{
              borderColor: errors.email ? '#b91c1c' : 'var(--blooso-border)',
              backgroundColor: 'var(--blooso-bg)',
              color: 'var(--blooso-text)',
              // @ts-expect-error -- CSS custom property
              '--tw-ring-color': errors.email ? 'rgba(185,28,28,0.15)' : 'rgba(139,58,82,0.2)',
            }}
            {...registerField('email')}
          />
          {errors.email && (
            <p id="login-email-error" className="text-xs" style={{ color: '#b91c1c' }}>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="block text-sm font-medium"
              style={{ color: 'var(--blooso-text)' }}
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium transition-colors hover:underline"
              style={{ color: 'var(--blooso-rose)' }}
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
              className={cn(
                'h-11 w-full rounded-[10px] border px-4 pr-11 text-sm outline-none transition-all',
                'focus:ring-2'
              )}
              style={{
                borderColor: errors.password ? '#b91c1c' : 'var(--blooso-border)',
                backgroundColor: 'var(--blooso-bg)',
                color: 'var(--blooso-text)',
              }}
              {...registerField('password')}
            />
            <button
              type="button"
              id="login-toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 transition-colors hover:opacity-70"
              style={{ color: 'var(--blooso-text-subtle)' }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && (
            <p id="login-password-error" className="text-xs" style={{ color: '#b91c1c' }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          id="login-submit-btn"
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] text-sm font-semibold',
            'transition-all hover:opacity-90 active:scale-[0.98]',
            'disabled:cursor-not-allowed disabled:opacity-60'
          )}
          style={{ backgroundColor: 'var(--blooso-rose)', color: '#fff' }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1" style={{ backgroundColor: 'var(--blooso-border-light)' }} />
        <span className="text-xs" style={{ color: 'var(--blooso-text-subtle)' }}>
          New to Blooso?
        </span>
        <div className="h-px flex-1" style={{ backgroundColor: 'var(--blooso-border-light)' }} />
      </div>

      {/* Sign up link */}
      <Link
        id="login-signup-link"
        href="/register"
        className={cn(
          'flex h-11 w-full items-center justify-center rounded-[10px] border text-sm font-semibold',
          'transition-all hover:bg-black/[0.03] active:scale-[0.98]'
        )}
        style={{
          borderColor: 'var(--blooso-border)',
          color: 'var(--blooso-text)',
        }}
      >
        Create an account
      </Link>
    </div>
  );
}
