import { getResourcesAction } from '@/app/actions';
import ResourceAdminManager from '@/app/portal/admin/(dashboard)/tai-lieu/ResourceAdminManager';

export const metadata = {
  title: 'Quản Lý Tài Liệu Khóa Học | Admin AIZEN',
};

export default async function LegacyAdminResourcesPage() {
  const initialData = await getResourcesAction();

  return <ResourceAdminManager initialData={initialData} />;
}
