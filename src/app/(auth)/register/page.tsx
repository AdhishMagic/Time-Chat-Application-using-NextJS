'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { registerSchema } from '@/modules/auth/schemas';
import { ZodError } from 'zod';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const validateFieldOnBlur = (name: string, value: string) => {
    try {
      const fieldSchema = registerSchema.pick({
        [name as keyof typeof formData]: true,
      } as Record<keyof typeof formData, true>);

      if (name === 'confirmPassword') {
        registerSchema.parse({
          ...formData,
          [name]: value,
        });
      } else {
        fieldSchema.parse({ [name]: value });
      }

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
      const validatedData = registerSchema.parse(formData);
      setErrors({});
      setIsLoading(true);

      const payload = {
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password,
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setServerError(result.error || 'Registration failed');
        return;
      }

      router.push('/login');
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

  const isFormValid =
    formData.name && formData.email && formData.password && formData.confirmPassword;

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create account</h1>
        <p className="text-gray-600">Join the conversation today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{serverError}</p>
          </div>
        )}

        <Input
          label="Full Name"
          type="text"
          name="name"
          placeholder="John Doe"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          disabled={isLoading}
          error={errors.name}
        />

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
          placeholder="At least 8 characters"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          disabled={isLoading}
          error={errors.password}
          helperText="8+ chars, uppercase, lowercase, number"
        />

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          disabled={isLoading}
          error={errors.confirmPassword}
        />

        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!isFormValid || isLoading || isSubmitting}
          className="w-full"
        >
          Create account
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

