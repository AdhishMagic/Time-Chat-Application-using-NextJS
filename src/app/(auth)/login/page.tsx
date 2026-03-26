'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { loginSchema } from '@/modules/auth/schemas';
import { ZodError } from 'zod';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const validateFieldOnBlur = (name: string, value: string) => {
    try {
      const fieldSchema = loginSchema.pick({
        [name as keyof typeof formData]: true,
      } as Record<keyof typeof formData, true>);

      fieldSchema.parse({ [name]: value });

      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldError = error.issues[0];
        setErrors((prev) => ({
          ...prev,
          [name]: fieldError.message,
        }));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value) {
      validateFieldOnBlur(name, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setServerError('');
    setIsSubmitting(true);

    try {
      const validatedData = loginSchema.parse(formData);
      setErrors({});
      setIsLoading(true);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });

      const result = await response.json();

      if (!response.ok) {
        setServerError(result.error || 'Login failed');
        return;
      }

      localStorage.setItem('token', result.data?.token || '');
      router.push('/chat');
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          const path = issue.path[0] as string;
          newErrors[path] = issue.message;
        });
        setErrors(newErrors);
      } else {
        setServerError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.email && formData.password;

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
        <p className="text-gray-600">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{serverError}</p>
          </div>
        )}

        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          disabled={isLoading}
          error={errors.email}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          disabled={isLoading}
          error={errors.password}
        />

        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!isFormValid || isLoading || isSubmitting}
          className="w-full"
        >
          Sign in
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

