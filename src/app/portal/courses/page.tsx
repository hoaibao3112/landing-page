import { fetchCoursesServer } from '@/lib/portal/server-data';
import type { Course, PaginatedResponse } from '@aizen/types';
import type { Metadata } from 'next';
import { CoursesClient } from './CoursesClient';

export const metadata: Metadata = {
  title: 'Thư viện khóa học',
  description: 'Xem tất cả khóa học AI thực chiến của AIZEN Education',
};

interface SearchParams {
  status?: string;
  category?: string;
  year?: string;
  page?: string;
  q?: string;
}

async function fetchCourses(params: SearchParams): Promise<PaginatedResponse<Course>> {
  return fetchCoursesServer({
    status: params.status,
    category: params.category,
    year: params.year,
    page: params.page ? Number(params.page) : 1,
    limit: 9,
    search: params.q,
  });
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { items, pagination } = await fetchCourses(params);
  const currentPage = Number(params.page ?? 1);

  return (
    <CoursesClient
      items={items}
      pagination={pagination}
      currentPage={currentPage}
    />
  );
}