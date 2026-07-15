import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Courses from '@/components/sections/Courses';
import Medium from '@/components/sections/Medium';
import ReviewsSection from '@/components/sections/ReviewsSection';
import AdmissionForm from '@/components/sections/AdmissionForm';
import Contact from '@/components/sections/Contact';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';

async function getApprovedReviews() {
  try {
    await connectDB();
    const dbReviews = await Review.find({ approved: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    const colors = ["bg-blue-600", "bg-pink-500", "bg-emerald-500", "bg-amber-500", "bg-indigo-650"];
    
    return dbReviews.map((r: any, idx: number) => ({
      id: r._id.toString(),
      name: r.name,
      review: r.message,
      rating: r.rating,
      time: r.createdAt ? new Date(r.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 'Recently',
      initial: r.name.charAt(0).toUpperCase(),
      color: colors[idx % colors.length]
    }));
  } catch (error) {
    console.error('Error fetching reviews for page.tsx:', error);
    return [];
  }
}

export default async function Home() {
  const reviews = await getApprovedReviews();

  return (
    <div className="flex flex-col overflow-hidden">
      <Hero />
      <About />
      <Courses />
      <Medium />
      <ReviewsSection initialReviews={reviews} />
      <AdmissionForm />
      <Contact />
    </div>
  );
}
