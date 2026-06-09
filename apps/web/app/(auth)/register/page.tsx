'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { registerSchema, type RegisterInput } from '@repo/shared/schemas';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isAuthenticated, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  console.log('[RegisterPage] render - isAuthenticated:', isAuthenticated, 'user:', user?.role);

  if (isAuthenticated && user) {
    const isClient = user.role === 'client';
    console.log(
      '[RegisterPage] already authenticated, redirecting to:',
      isClient ? '/my-bookings' : '/dashboard'
    );
    router.replace(isClient ? '/my-bookings' : '/dashboard');
    return null;
  }

  const onSubmit = async (data: RegisterInput) => {
    setError(null);
    try {
      console.log('[RegisterPage] onSubmit - calling registerUser()');
      const newUser = await registerUser(data.email, data.password, data.name);
      console.log('[RegisterPage] registerUser() returned - role:', newUser.role);
      const isClient = newUser.role === 'client';
      console.log('[RegisterPage] pushing to:', isClient ? '/my-bookings' : '/dashboard');
      router.push(isClient ? '/my-bookings' : '/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed. Please try again.');
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
          Create an account
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
          Get started with Blooso today.
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
        {/* Full Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="register-name"
            className="block text-sm font-medium"
            style={{ color: 'var(--blooso-text)' }}
          >
            Full name
          </label>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            placeholder="John Doe"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'register-name-error' : undefined}
            className={cn(
              'h-11 w-full rounded-[10px] border px-4 text-sm outline-none transition-all',
              'placeholder:text-sm',
              'focus:ring-2'
            )}
            style={{
              borderColor: errors.name ? '#b91c1c' : 'var(--blooso-border)',
              backgroundColor: 'var(--blooso-bg)',
              color: 'var(--blooso-text)',
              // @ts-expect-error -- CSS custom property
              '--tw-ring-color': errors.name ? 'rgba(185,28,28,0.15)' : 'rgba(139,58,82,0.2)',
            }}
            {...registerField('name')}
          />
          {errors.name && (
            <p id="register-name-error" className="text-xs" style={{ color: '#b91c1c' }}>
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="register-email"
            className="block text-sm font-medium"
            style={{ color: 'var(--blooso-text)' }}
          >
            Email address
          </label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'register-email-error' : undefined}
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
            <p id="register-email-error" className="text-xs" style={{ color: '#b91c1c' }}>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="register-password"
            className="block text-sm font-medium"
            style={{ color: 'var(--blooso-text)' }}
          >
            Password
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'register-password-error' : undefined}
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
              id="register-toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 transition-colors hover:opacity-70"
              style={{ color: 'var(--blooso-text-subtle)' }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && (
            <p id="register-password-error" className="text-xs" style={{ color: '#b91c1c' }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          id="register-submit-btn"
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] text-sm font-semibold',
            'transition-all hover:opacity-90 active:scale-[0.98]',
            'disabled:cursor-not-allowed disabled:opacity-60'
          )}
          style={{ backgroundColor: 'var(--blooso-rose)', color: '#fff' }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1" style={{ backgroundColor: 'var(--blooso-border-light)' }} />
        <span className="text-xs" style={{ color: 'var(--blooso-text-subtle)' }}>
          Already have an account?
        </span>
        <div className="h-px flex-1" style={{ backgroundColor: 'var(--blooso-border-light)' }} />
      </div>

      {/* Login link */}
      <Link
        id="register-login-link"
        href="/login"
        className={cn(
          'flex h-11 w-full items-center justify-center rounded-[10px] border text-sm font-semibold',
          'transition-all hover:bg-black/[0.03] active:scale-[0.98]'
        )}
        style={{
          borderColor: 'var(--blooso-border)',
          color: 'var(--blooso-text)',
        }}
      >
        Sign in to your account
      </Link>
    </div>
  );
}
