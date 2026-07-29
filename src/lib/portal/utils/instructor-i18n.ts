import type { Instructor } from '@aizen/types';

export const INSTRUCTOR_EN_MAP: Record<string, { bio: string; title: string }> = {
  'le-thanh-hai': {
    bio: 'Expert with over 15 years of practical experience in Information Technology. Directly leading AI operational roadmaps, helping enterprises package workflows, optimize efficiency, and boost revenue based on the most practical experiences and applications.',
    title: 'CEO AIZEN',
  },
};

export function getInstructorTranslation(
  instructor: Pick<Instructor, 'id' | 'name' | 'title' | 'bio'>,
  language: string
) {
  if (language !== 'en') {
    return { title: instructor.title || '', bio: instructor.bio || '' };
  }

  const normalizedName = (instructor.name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, '-')
    .trim();

  const enData =
    (instructor.id ? INSTRUCTOR_EN_MAP[String(instructor.id)] : undefined) ||
    INSTRUCTOR_EN_MAP[normalizedName] ||
    (normalizedName.includes('hai') ? INSTRUCTOR_EN_MAP['le-thanh-hai'] : undefined);

  return {
    title: enData?.title || instructor.title || '',
    bio: enData?.bio || instructor.bio || '',
  };
}
