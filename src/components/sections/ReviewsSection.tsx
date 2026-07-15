'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ExternalLink, ChevronLeft, ChevronRight, MessageSquare, User, X, CheckCircle2 } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import GlassCard from '../ui/GlassCard'

interface Testimonial {
  id?: string | number;
  name: string;
  review?: string;
  message?: string;
  rating: number;
  time?: string;
  createdAt?: string;
  initial?: string;
  color?: string;
}

const staticTestimonials: Testimonial[] = [
  {
    id: 1,
    name: "Parth Patel",
    time: "3 weeks ago",
    review: "Vinayak tuition class is the best in Kalol. Nikhil sir explains concepts very clearly. I improved my math score from 60 to 90+ in my 10th boards!",
    rating: 5,
    initial: "P",
    color: "bg-blue-600"
  },
  {
    id: 2,
    name: "Riya Shah",
    time: "2 months ago",
    review: "Excellent coaching center. Personal attention is given to every student and the weekly tests are very helpful for board preparation. Highly recommended!",
    rating: 5,
    initial: "R",
    color: "bg-pink-500"
  },
  {
    id: 3,
    name: "Devang Thakur",
    time: "4 months ago",
    review: "Top notch teaching for Commerce students. The study material provided is very detailed and the environment is always motivating.",
    rating: 5,
    initial: "D",
    color: "bg-emerald-500"
  }
]

export default function ReviewsSection({ initialReviews }: { initialReviews?: Testimonial[] }) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(
    initialReviews && initialReviews.length > 0 ? initialReviews : staticTestimonials
  );
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formName, setFormName] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [formRating, setFormRating] = useState(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (initialReviews && initialReviews.length > 0) {
      setLoading(false);
      return;
    }
    async function fetchReviews() {
      try {
        const res = await fetch('/api/reviews')
        if (res.ok) {
          const data = await res.json()
          if (data.reviews && data.reviews.length > 0) {
            // Map Mongoose reviews to testimonial structure
            const colors = ["bg-blue-600", "bg-pink-500", "bg-emerald-500", "bg-amber-500", "bg-indigo-650"]
            const mapped: Testimonial[] = data.reviews.map((r: any, idx: number) => ({
              id: r._id,
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
            }))
            setTestimonials(mapped)
          } else {
            setTestimonials([])
          }
        }
      } catch (err) {
        console.error('Failed to load reviews from API:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [initialReviews])

  const nextSlide = () => {
    if (testimonials.length === 0) return
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevSlide = () => {
    if (testimonials.length === 0) return
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
    if (testimonials.length <= 1) return
    const timer = setInterval(nextSlide, 6000)
    return () => clearInterval(timer)
  }, [testimonials])

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formMessage.trim()) return
    
    setFormSubmitting(true)
    setFormError(null)
    
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          message: formMessage,
          rating: formRating
        })
      })
      
      const data = await res.json()
      if (res.ok) {
        setFormSuccess(true)
        setFormName('')
        setFormMessage('')
        setFormRating(5)
        setTimeout(() => {
          setFormSuccess(false)
          setIsModalOpen(false)
        }, 3000)
      } else {
        setFormError(data.error || 'Submission failed')
      }
    } catch (err) {
      setFormError('Network error. Please try again.')
    } finally {
      setFormSubmitting(false)
    }
  }

  return (
    <section id="reviews" className="py-24 bg-slate-50 dark:bg-darkObsidian relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-accentCyan/5 rounded-full mix-blend-screen filter blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <SectionHeading 
          title="Student Feedback"
          subtitle="What Our Students and Parents Say"
          align="center"
        />

        {testimonials.length === 0 ? (
          <div className="text-center py-16 text-slate-400 dark:text-slate-500 font-semibold text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl mx-auto my-12 flex flex-col items-center justify-center space-y-2">
            <MessageSquare className="w-10 h-10 text-slate-350 dark:text-slate-700 animate-pulse" />
            <span>Be the first to share your experience!</span>
          </div>
        ) : (
          <div className="relative max-w-3xl mx-auto mb-16 mt-12 px-4 sm:px-12">
            {/* Slider Controls - Desktop */}
            <button 
              onClick={prevSlide} 
              className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-20 w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 items-center justify-center text-slate-600 dark:text-slate-300 hover:text-accentViolet dark:hover:text-accentCyan hover:scale-110 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button 
              onClick={nextSlide} 
              className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-20 w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 items-center justify-center text-slate-600 dark:text-slate-300 hover:text-accentViolet dark:hover:text-accentCyan hover:scale-110 transition-all cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="relative min-h-[250px] sm:min-h-[220px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="w-full h-full absolute inset-0"
                >
                  <GlassCard className="h-full p-6 sm:p-8 flex flex-col relative group border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/40">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl shrink-0 ${testimonials[currentIndex].color || 'bg-[#8B5CF6]'}`}>
                        {testimonials[currentIndex].initial}
                      </div>
                      <div className="pt-1">
                        <h3 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white leading-tight">
                          {testimonials[currentIndex].name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${
                                  i < testimonials[currentIndex].rating
                                    ? 'text-[#fbbc04] fill-[#fbbc04]'
                                    : 'text-slate-300 dark:text-slate-600'
                                  }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-slate-500">{testimonials[currentIndex].time}</span>
                        </div>
                      </div>
                      
                      {/* Google Logo minimal icon */}
                      <div className="ml-auto opacity-70">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                    </div>

                    <p className="text-slate-700 dark:text-slate-200 flex-grow text-base sm:text-lg leading-relaxed mt-2 italic">
                      "{testimonials[currentIndex].review}"
                    </p>
                  </GlassCard>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dots & Mobile Controls */}
            <div className="flex justify-center items-center gap-6 mt-8">
              <button onClick={prevSlide} className="sm:hidden p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${i === currentIndex ? 'bg-accentViolet w-8' : 'bg-slate-300 dark:bg-slate-700 w-2.5'}`} 
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
              <button onClick={nextSlide} className="sm:hidden p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* CTA section with write a review modal trigger */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center text-center mt-6 sm:mt-12 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm max-w-3xl mx-auto"
        >
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
             <svg className="w-8 h-8" viewBox="0 0 24 24">
               <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
               <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
               <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
               <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
             </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Love our classes?</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Your feedback helps other students find the best education in Kalol. Please take a moment to share your experience directly with us or on Google!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center px-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-accentViolet to-accentCyan hover:opacity-90 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              <span>Write a Direct Review</span>
            </button>
            <a 
              href="https://maps.app.goo.gl/8mbaXz4kcm9KJocp6" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <span>Review us on Google</span>
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </div>
        </motion.div>
      </div>

      {/* Write a Review Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden z-10 text-left"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-accentViolet" />
                Submit Testimonial
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">
                Share your learning experience. Your review will be published upon admin approval.
              </p>

              {formSuccess ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-sm border border-emerald-500/30">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">Review Submitted!</h4>
                  <p className="text-xs text-slate-505 dark:text-slate-405 font-medium leading-relaxed max-w-xs mx-auto">
                    Thank you! Your feedback has been sent to our team for verification and will show up shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {formError && (
                    <div className="p-3 bg-red-500/10 border border-red-550/20 text-red-500 rounded-xl text-xs font-semibold">
                      {formError}
                    </div>
                  )}

                  {/* Name Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Your Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-slate-400" />
                      </div>
                      <input 
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accentViolet focus:ring-1 focus:ring-accentViolet/20 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Star Rating Select */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Rating</label>
                    <div className="flex gap-1.5 py-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="text-slate-300 dark:text-slate-700 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star 
                            className={`w-6 h-6 ${
                              star <= (hoverRating ?? formRating) 
                                ? 'text-[#fbbc04] fill-[#fbbc04]' 
                                : 'text-slate-350 dark:text-slate-700'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Your Review</label>
                    <textarea 
                      rows={4}
                      required
                      value={formMessage}
                      onChange={(e) => setFormMessage(e.target.value)}
                      placeholder="Write details about Nikihl Sir's teaching, batches, or your experience..."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accentViolet focus:ring-1 focus:ring-accentViolet/20 transition-all resize-none font-medium"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-accentViolet to-accentCyan text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-[0.98] outline-none cursor-pointer hover:opacity-95 disabled:opacity-50"
                  >
                    {formSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
