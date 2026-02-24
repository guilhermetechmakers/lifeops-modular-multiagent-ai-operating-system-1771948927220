/**
 * TutorialVideosGallery - Carousel/grid of onboarding videos.
 * Play controls, captions, watch progress tracking.
 */
import { useState } from 'react'
import { Play, Check, Loader2 } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboarding-store'
import { MOCK_VIDEOS } from '@/api/onboarding-mock'
import { cn } from '@/lib/utils'
import type { TutorialVideo } from '@/types/onboarding'

export function TutorialVideosGallery() {
  const { setVideoProgress, getVideoProgress } = useOnboardingStore()
  const [playingId, setPlayingId] = useState<string | null>(null)

  const videos = (MOCK_VIDEOS ?? []) as TutorialVideo[]

  const handlePlay = (videoId: string) => {
    setPlayingId(videoId)
    // Simulate progress - in production, use video element events
    setTimeout(() => {
      setVideoProgress(videoId, 100)
      setPlayingId(null)
    }, 2000)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Watch these short videos to learn the basics. Optional but recommended. Progress is saved.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(videos.length > 0 ? videos : []).map((video) => {
          const progress = getVideoProgress(video.id)
          const isWatched = progress >= 100
          const isPlaying = playingId === video.id

          return (
            <div
              key={video.id}
              className={cn(
                'rounded-xl border border-[#26282C] bg-[#1F2124] overflow-hidden',
                'transition-all duration-200 hover:border-primary/30 hover:shadow-card'
              )}
            >
              <div className="aspect-video bg-muted/50 relative flex items-center justify-center">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => handlePlay(video.id)}
                      disabled={isPlaying}
                      className={cn(
                        'rounded-full p-4 bg-primary/20 text-primary transition-transform',
                        'hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        isPlaying && 'opacity-70'
                      )}
                      aria-label={`Play ${video.title}`}
                    >
                      {isPlaying ? (
                        <Loader2 className="h-8 w-8 animate-spin" />
                      ) : (
                        <Play className="h-8 w-8 fill-current" />
                      )}
                    </button>
                    <span className="text-xs">
                      {Math.floor(video.duration_seconds / 60)} min
                    </span>
                  </div>
                )}
                {isWatched && (
                  <div className="absolute top-2 right-2 rounded-full bg-success p-1">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                {progress > 0 && progress < 100 && (
                  <div
                    className="absolute bottom-0 left-0 h-1 bg-primary"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </div>
              <div className="p-4">
                <p className="font-semibold text-white">{video.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{video.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
