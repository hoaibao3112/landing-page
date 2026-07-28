import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Vui lòng nhập email')
    .email('Email không đúng định dạng')
    .trim()
    .lowercase(),
  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Vui lòng nhập email')
    .email('Email không đúng định dạng')
    .trim()
    .lowercase(),
  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu')
    .min(8, 'Mật khẩu phải chứa ít nhất 8 ký tự')
    .regex(/(?=.*[A-Za-z])(?=.*\d)/, 'Mật khẩu phải chứa cả chữ cái và chữ số'),
  fullName: z
    .string()
    .min(1, 'Vui lòng nhập họ và tên')
    .min(2, 'Họ và tên quá ngắn')
    .max(100, 'Họ và tên quá dài')
    .trim(),
  phone: z.string().max(20, 'Số điện thoại quá dài').optional().nullable(),
  company: z.string().max(150, 'Tên công ty quá dài').optional().nullable(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
