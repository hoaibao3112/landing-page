import type { Metadata } from 'next';
import { InstructorsHero } from '@/components/portal/sections/instructors/InstructorsHero';
import { InstructorGrid } from '@/components/portal/sections/instructors/InstructorGrid';
import { ToolsSection } from '@/components/portal/sections/instructors/ToolsSection';
import { ReviewsSection } from '@/components/portal/sections/instructors/ReviewsSection';
import type { Instructor } from '@aizen/types';
import { fetchInstructorsServer } from '@/lib/portal/server-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Giảng viên',
  description: 'Đội ngũ chuyên gia AI thực chiến của AIZEN Education',
};

async function getInstructors(): Promise<Instructor[]> {
  return fetchInstructorsServer();
}

export default async function InstructorsPage() {
  const instructors = await getInstructors();

  return (
    <div className="py-8">
      <InstructorsHero />
      <InstructorGrid instructors={instructors} />
      <ToolsSection />
      <ReviewsSection />
    </div>
  );
}
