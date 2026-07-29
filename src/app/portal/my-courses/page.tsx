import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Enrollment } from '@aizen/types';
import { supabaseAdmin } from '@/lib/portal/supabase-server';
import { MyCoursesClient } from './MyCoursesClient';

export const metadata: Metadata = {
  title: 'Khóa học của tôi',
};

async function getMyEnrollments(): Promise<Enrollment[]> {
  try {
    const cookieStore = await cookies();
    const supabaseCookie = cookieStore.getAll().find(
      (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'),
    );
    const accessToken = cookieStore.get('access_token')?.value;
    const token = accessToken || (supabaseCookie ? JSON.parse(supabaseCookie.value)?.access_token : null);

    if (!token) return [];

    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) return [];

    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .select('id, user_id, course_id, status, completed_at, created_at, courses(id, title, slug, thumbnail_url, status, start_date, category)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data ?? []) as unknown as Enrollment[];
  } catch {
    return [];
  }
}

export default async function MyCoursesPage() {
  const enrollments = await getMyEnrollments();

  const upcoming = enrollments.filter((e) => e.status === 'upcoming');
  const completed = enrollments.filter((e) => e.status === 'completed');

  return (
    <MyCoursesClient upcoming={upcoming} completed={completed} />
  );
}
