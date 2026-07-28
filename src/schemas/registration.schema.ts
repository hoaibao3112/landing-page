import { z } from 'zod';

export const createRegistrationSchema = z.object({
  courseId: z
    .string()
    .min(1, 'Vui lòng chọn khóa học'),
  fullName: z
    .string()
    .min(1, 'Vui lòng nhập họ và tên')
    .min(2, 'Họ và tên quá ngắn')
    .max(100, 'Họ và tên quá dài')
    .trim(),
  phone: z
    .string()
    .min(1, 'Vui lòng nhập số điện thoại')
    .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ')
    .trim(),
  email: z
    .string()
    .min(1, 'Vui lòng nhập email')
    .email('Email không đúng định dạng')
    .lowercase()
    .trim(),
  company: z.string().max(150, 'Tên công ty quá dài').optional().nullable(),
  position: z.string().max(100, 'Chức vụ quá dài').optional().nullable(),
  referral: z.string().min(1, 'Vui lòng chọn nguồn biết đến'),
  plan: z.enum(['individual', 'group']),
  promoCode: z.string().max(50).optional().nullable(),
});

export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;
