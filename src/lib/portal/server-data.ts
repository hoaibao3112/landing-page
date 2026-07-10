/**
 * Server-side data fetcher — dùng Supabase Admin Client trực tiếp
 * KHÔNG dùng fetch HTTP ra ngoài, tránh lỗi ECONNREFUSED khi build
 */
import { supabaseAdmin } from '@/lib/portal/supabase-server';
import type { Course, Blog, Instructor, PaginatedResponse } from '@aizen/types';

// ─── Courses ─────────────────────────────────────────────────────────────────

function adjustCourseStatus<T extends { status: string; start_date?: string | null }>(course: T): T {
  if (course.status === 'completed' || !course.start_date) return course;
  const today = new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
  if (course.start_date.slice(0, 10) < today) return { ...course, status: 'completed' };
  return course;
}

interface FetchCoursesParams {
  status?: string;
  category?: string;
  year?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export async function fetchCoursesServer(params: FetchCoursesParams = {}): Promise<PaginatedResponse<Course>> {
  const { status, category, year, page = 1, limit = 9, search } = params;
  const offset = (page - 1) * limit;

  let builder = supabaseAdmin
    .from('courses')
    .select('*', { count: 'exact' })
    .order('start_date', { ascending: true })
    .range(offset, offset + limit - 1);

  if (search) builder = builder.ilike('title', `%${search}%`);

  const today = new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
  if (status === 'upcoming') {
    builder = builder.eq('status', 'upcoming').or(`start_date.gte.${today},start_date.is.null`);
  } else if (status === 'completed') {
    builder = builder.or(`status.eq.completed,start_date.lt.${today}`);
  } else if (status) {
    builder = builder.eq('status', status);
  }

  if (category) builder = builder.eq('category', category);
  if (year) builder = builder.like('start_date', `${year}%`);

  try {
    const { data, error, count } = await builder;
    if (error) throw error;
    const items = (data || []).map((c) => adjustCourseStatus(c as Course));
    return {
      items,
      pagination: { total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) },
    };
  } catch {
    return { items: [], pagination: { total: 0, page, limit, totalPages: 0 } };
  }
}

export async function fetchCourseBySlugServer(slug: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('courses')
      .select(`
        *,
        course_modules (id, title, subtitle, description, duration_minutes, order_index, start_time, item_type),
        instructors (id, name, title, avatar_url, bio)
      `)
      .eq('slug', slug)
      .order('order_index', { referencedTable: 'course_modules', ascending: true })
      .single();

    if (error) return null;
    return adjustCourseStatus(data as any);
  } catch {
    return null;
  }
}

// ─── Blogs ───────────────────────────────────────────────────────────────────

interface FetchBlogsParams {
  category?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export async function fetchBlogsServer(params: FetchBlogsParams = {}): Promise<PaginatedResponse<Blog>> {
  const { category, page = 1, limit = 6, search } = params;
  const offset = (page - 1) * limit;

  let builder = supabaseAdmin
    .from('blogs')
    .select('id, title, slug, excerpt, thumbnail_url, category, published_at, status, read_time', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) builder = builder.eq('category', category);
  if (search) builder = builder.ilike('title', `%${search}%`);

  try {
    const { data, error, count } = await builder;
    if (error) throw error;
    return {
      items: (data || []) as unknown as Blog[],
      pagination: { total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) },
    };
  } catch {
    return { items: [], pagination: { total: 0, page, limit, totalPages: 0 } };
  }
}

export async function fetchBlogBySlugServer(slug: string) {
  try {
    const { data: blog, error } = await supabaseAdmin
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !blog) return null;

    const { data: related } = await supabaseAdmin
      .from('blogs')
      .select('id, title, slug, excerpt, thumbnail_url, category, published_at, read_time')
      .eq('status', 'published')
      .eq('category', blog.category)
      .neq('slug', slug)
      .order('published_at', { ascending: false })
      .limit(3);

    return { ...blog, related: related ?? [] };
  } catch {
    return null;
  }
}

// ─── Instructors ─────────────────────────────────────────────────────────────

export async function fetchInstructorsServer(): Promise<Instructor[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('instructors')
      .select('id, name, title, bio, avatar_url, social_links')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as Instructor[];
  } catch {
    return [];
  }
}
