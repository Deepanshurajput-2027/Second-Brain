import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  token: z.string().min(1, 'Refresh token is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required').optional(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
}).refine((data) => data.newPassword || data.password, {
  message: 'Password is required and must be at least 8 characters',
  path: ['newPassword'],
});

