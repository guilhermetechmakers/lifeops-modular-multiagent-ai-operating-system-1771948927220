import { cn } from '@/lib/utils'

export interface LogoItem {
  id: string
  url: string
  alt?: string
}

export interface LogosCarouselProps {
  logos?: LogoItem[] | null
  autoLoopSpeed?: number
  className?: string
}

export function LogosCarousel({
  logos = [],
  autoLoopSpeed: _autoLoopSpeed,
  className,
}: LogosCarouselProps) {
  const list = Array.isArray(logos) ? logos : []

  if (list.length === 0) {
    return (
      <section
        className={cn('py-16 px-4 lg:px-8', className)}
        aria-label="Trusted by"
      >
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground text-sm">
            No logos available at the moment.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section
      className={cn('py-16 px-4 lg:px-8', className)}
      aria-label="Trusted by companies"
    >
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-sm uppercase tracking-wider text-muted-foreground mb-8">
          Trusted by
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-16">
          {list.map((logo, i) => (
            <div
              key={logo?.id ?? i}
              className="flex items-center justify-center h-10 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all duration-300"
            >
              {logo?.url ? (
                <img
                  src={logo.url}
                  alt={logo?.alt ?? `Company logo ${i + 1}`}
                  className="max-h-8 max-w-[120px] object-contain"
                />
              ) : (
                <div
                  className="w-24 h-8 rounded bg-muted"
                  aria-hidden
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
