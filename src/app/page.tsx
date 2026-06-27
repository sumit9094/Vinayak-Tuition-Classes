import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Courses from '@/components/sections/Courses';
import Medium from '@/components/sections/Medium';
import ReviewsSection from '@/components/sections/ReviewsSection';
import AdmissionForm from '@/components/sections/AdmissionForm';
import Contact from '@/components/sections/Contact';

export default function Home() {
  return (
    <div className="flex flex-col overflow-hidden">
      <Hero />
      <About />
      <Courses />
      <Medium />
      <ReviewsSection />
      <AdmissionForm />
      <Contact />
    </div>
  );
}
