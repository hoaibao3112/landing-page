import type { Metadata } from 'next';
import { getResourcesAction } from '@/app/actions';
import { ResourcesClient } from './ResourcesClient';
import { VerticalThreeSectionModal } from '@/components/portal/sections/home/VerticalThreeSectionModal';

export const metadata: Metadata = {
  title: 'Kho Tài Nguyên Khóa Học Thực Chiến | AIZEN Education',
  description:
    'Kho tài nguyên AI miễn phí từ các khóa học đã hoàn thành của AIZEN: Ebook, Slide bài giảng, Prompt Library, Template Google Drive thực chiến.',
};

export default async function ResourcesPage() {
  const resources = await getResourcesAction();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <VerticalThreeSectionModal />
      <ResourcesClient initialResources={resources} />
    </div>
  );
}
