import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'

export interface TestimonialItem {
  id: string
  quote: string
  author: string
  company?: string
  avatarUrl?: string
}

export interface TestimonialsCarouselProps {
  items?: TestimonialItem[] | null
  autoRotateInterval?: number
  className?: string
}

export function TestimonialsCarousel({
  items = [],
  autoRotateInterval = 5000,
  className,
}: TestimonialsCarouselProps) {
  const list = Array.isArray(items) ? items : []
  const [activeIndex, setActiveIndex] = useState(0)

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % Math.max(1, list.length))
  }, [list.length])

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + list.length) % Math.max(1, list.length))
  }, [list.length])

  useEffect(() => {
    if (list.length <= 1 || autoRotateInterval <= 0) return
    const id = setInterval(goNext, autoRotateInterval)
    return () => clearInterval(id)
  }, [list.length, autoRotateInterval, goNext])

  if (list.length === 0) {
    return (
      <section
        className={cn('py-24 lg:py-32 px-4 lg:px-8 bg-card/30', className)}
        aria-label="Testimonials"
      >
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">
            No testimonials available at the moment.
          </p>
        </div>
      </section>
    )
  }

  const current = list[activeIndex] ?? list[0]

  return (
    <section
      className={cn('py-24 lg:py-32 px-4 lg:px-8 bg-card/30', className)}
      aria-label="Customer testimonials"
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4">
          What Our Customers Say
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-16">
          Trusted by teams who automate with confidence.
        </p>

        <div
          className="relative max-w-3xl mx-auto"
          role="region"
          aria-live="polite"
          aria-label={`Testimonial ${activeIndex + 1} of ${list.length}`}
        >
          <Card className="overflow-hidden">
            <CardContent className="p-8 lg:p-12">
              <Quote
                className="h-10 w-10 text-primary/50 mb-4"
                aria-hidden
              />
              <blockquote className="text-lg lg:text-xl text-foreground mb-6">
                &ldquo;{current?.quote ?? ''}&rdquo;
              </blockquote>
              <footer className="flex items-center gap-4">
                {current?.avatarUrl ? (
                  <img
                    src={current.avatarUrl}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold"
                    aria-hidden
                  >
                    {(current?.author ?? '?')[0]}
                  </div>
                )}
                <div>
                  <cite className="font-semibold not-italic">
                    {current?.author ?? 'Anonymous'}
                  </cite>
                  {current?.company && (
                    <p className="text-sm text-muted-foreground">
                      {current.company}
                    </p>
                  )}
                </div>
              </footer>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={goPrev}
              aria-label="Previous testimonial"
              className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-2" role="tablist">
              {list.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === activeIndex}
                  aria-label={`Go to testimonial ${i + 1}`}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    'h-2 w-2 rounded-full transition-colors',
                    i === activeIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                  )}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={goNext}
              aria-label="Next testimonial"
              className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
