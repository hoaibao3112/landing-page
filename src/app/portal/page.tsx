import { Navbar } from '@/components/portal/common/Navbar';
import { Footer } from '@/components/portal/common/Footer';
import { HeroSection } from '@/components/portal/sections/home/HeroSection';
import { UpcomingCoursesSection } from '@/components/portal/sections/home/UpcomingCoursesSection';
import { CompletedCoursesPreviewSection } from '@/components/portal/sections/home/CompletedCoursesPreviewSection';
import type { Course } from '@aizen/types';
import { fetchCoursesServer } from '@/lib/portal/server-data';

async function getUpcomingCourses(): Promise<Course[]> {
  const result = await fetchCoursesServer({ status: 'upcoming', limit: 3 });
  return result.items;
}

async function getCompletedCourses(): Promise<Course[]> {
  const result = await fetchCoursesServer({ status: 'completed', limit: 3 });
  return result.items;
}

export default async function HomePage() {
  const [upcomingCourses, completedCourses] = await Promise.all([
    getUpcomingCourses(),
    getCompletedCourses(),
  ]);

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <UpcomingCoursesSection courses={upcomingCourses} />
        <CompletedCoursesPreviewSection courses={completedCourses} />
      </main>
      <Footer />
    </>
  );
}