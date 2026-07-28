import { z } from 'zod';

export const courseHighlightSchema = z.object({
  icon: z.string().optional(),
  value: z.string(),
  label: z.string(),
});

export const courseSkillSchema = z.object({
  title: z.string(),
  description: z.string(),
  badge: z.string().optional(),
});

export const createCourseSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề khóa học').max(255, 'Tiêu đề quá dài').trim(),
  slug: z.string().min(1, 'Vui lòng nhập slug khóa học').max(255, 'Slug quá dài').trim(),
  description: z.string().min(1, 'Vui lòng nhập mô tả khóa học').trim(),
  thumbnail_url: z.string().optional().nullable(),
  status: z.enum(['upcoming', 'completed']),
  category: z.string().min(1, 'Vui lòng chọn danh mục khóa học').trim(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  schedule_time: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  location_url: z.string().optional().nullable(),
  price: z.number().min(0, 'Giá khóa học phải từ 0 trở lên'),
  price_group: z.number().min(0, 'Giá nhóm phải từ 0 trở lên'),
  instructor_id: z.string().min(1, 'Vui lòng chọn giảng viên'),
  skills: z.array(courseSkillSchema).optional().nullable(),
  highlights: z.array(courseHighlightSchema).optional().nullable(),
  curriculum_headline: z.string().optional().nullable(),
  qr_early_bird: z.string().optional().nullable(),
  qr_individual: z.string().optional().nullable(),
  qr_group_2: z.string().optional().nullable(),
  qr_group_4: z.string().optional().nullable(),
  qr_early_bird_promo: z.string().optional().nullable(),
  qr_individual_promo: z.string().optional().nullable(),
  qr_group_2_promo: z.string().optional().nullable(),
  qr_group_4_promo: z.string().optional().nullable(),
  early_bird_deadline: z.string().optional().nullable(),
  plans_config: z.record(z.string(), z.any()).optional().nullable(),
});

export const updateCourseSchema = createCourseSchema.partial();

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
