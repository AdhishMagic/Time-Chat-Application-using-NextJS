import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be at most 50 characters'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email format')
    .refine(
      (email) => !email.match(/^[^@]+@(test|fake|xxx|example|invalid)\.(com|org|net|yyy|xxx)$/i),
      'Email domain is not valid'
    ),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .refine((pwd) => /[A-Z]/.test(pwd), 'Password must contain uppercase letter')
    .refine((pwd) => /[a-z]/.test(pwd), 'Password must contain lowercase letter')
    .refine((pwd) => /[0-9]/.test(pwd), 'Password must contain number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const registerApiSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be at most 50 characters'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email format')
    .refine(
      (email) => !email.match(/^[^@]+@(test|fake|xxx|example|invalid)\.(com|org|net|yyy|xxx)$/i),
      'Email domain is not valid'
    ),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .refine((pwd) => /[A-Z]/.test(pwd), 'Password must contain uppercase letter')
    .refine((pwd) => /[a-z]/.test(pwd), 'Password must contain lowercase letter')
    .refine((pwd) => /[0-9]/.test(pwd), 'Password must contain number'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterApiInput = z.infer<typeof registerApiSchema>;
