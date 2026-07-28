import { getResourcesAction } from '@/app/actions';
import ResourceAdminManager from './ResourceAdminManager';

export const metadata = {
  title: 'Quản Lý Tài Liệu Khóa Học | Admin AIZEN',
};

export default async function AdminResourcesPage() {
  const initialData = await getResourcesAction({ includeInactive: true });

  return <ResourceAdminManager initialData={initialData} />;
}
