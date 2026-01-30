import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize, Minimize, CheckCircle } from 'lucide-react';
import { Lesson } from '@/types';

interface VideoPlayerProps {
  lesson: Lesson;
  onPrevious?: () => void;
  onNext?: () => void;
  onComplete?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  isCompleted?: boolean;
  userEmail?: string; // For watermark
  userId?: string; // For watermark
}

export function VideoPlayer({
  lesson,
  onPrevious,
  onNext,
  onComplete,
  hasPrevious = false,
  hasNext = false,
  isCompleted = false,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (!video.duration || Number.isNaN(video.duration)) return;
      const percent = (video.currentTime / video.duration) * 100;
      setProgress(percent);
      setCurrentTime(video.currentTime);

      if (percent >= 90 && !isCompleted && onComplete) {
        onComplete();
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setShowControls(true);
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [isCompleted, onComplete]);

  // Anti-Piracy: Auto-pause on tab switch
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        const video = videoRef.current;
        if (video) {
          video.pause();
          setIsPlaying(false);
          setShowControls(true);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying]);

  // Anti-Piracy: DevTools Detection (Basic Heuristic - Screen Resize/Dimension check)
  useEffect(() => {
    const checkDevTools = () => {
      // Rudimentary check
      const threshold = 160;
      if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
        // Possible devtools open.
        // Action: Pause video or show warning?
        // For now, pause is safer.
        if (isPlaying) {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      }
    };
    window.addEventListener('resize', checkDevTools);
    return () => window.removeEventListener('resize', checkDevTools);
  }, [isPlaying]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, []);

  const scheduleHideControls = () => {
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }

    if (!isPlaying) {
      setShowControls(true);
      return;
    }

    hideControlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 2500);
  };

  const handlePointerActivity = () => {
    setShowControls(true);
    scheduleHideControls();
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      setShowControls(true);
    } else {
      video.play();
      setIsPlaying(true);
      scheduleHideControls();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * video.duration;
    setProgress(percent * 100);
    setCurrentTime(video.currentTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    const newVolume = parseInt(e.target.value, 10);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (video) {
      video.volume = newVolume / 100;
      video.muted = newVolume === 0;
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const newMuted = !isMuted;
    video.muted = newMuted;
    setIsMuted(newMuted);
    setVolume(newMuted ? 0 : Math.round(video.volume * 100) || 100);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };

  const formatTime = (time: number) => {
    if (!Number.isFinite(time) || time < 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="space-y-8">
      {/* Video Player */}
      <div
        ref={containerRef}
        className="group relative overflow-hidden rounded-xl border bg-black shadow-sm"
        onMouseMove={handlePointerActivity}
        onMouseEnter={handlePointerActivity}
        onTouchStart={handlePointerActivity}
      >
        <video
          ref={videoRef}
          className="aspect-video w-full"
          src={lesson.videoUrl}
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23f3f4f6'/%3E%3Ctext x='400' y='225' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='24'%3EVideo Player%3C/text%3E%3C/svg%3E"
          onPlay={() => {
            setIsPlaying(true);
            scheduleHideControls();
          }}
          onPause={() => {
            setIsPlaying(false);
            setShowControls(true);
          }}
          onClick={togglePlay}
        />

        {/* Anti-Piracy Watermark */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-30 select-none">
          {/* Moving watermark pattern */}
          <div className="absolute top-10 left-10 text-white/20 text-xs font-bold -rotate-12">
            {userEmail} • {userId?.substring(0, 8)}
          </div>
          <div className="absolute bottom-20 right-20 text-white/20 text-xs font-bold -rotate-12">
            {userId?.substring(0, 8)} • {userEmail}
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/10 text-4xl font-black -rotate-45 whitespace-nowrap">
            DO NOT DISTRIBUTE
          </div>
        </div>

        {/* Play/Pause Overlay */}
        <div
          className={`absolute inset-0 flex cursor-pointer items-center justify-center transition-opacity ${!isPlaying || showControls ? 'opacity-100 bg-black/30' : 'opacity-0'
            }`}
          onClick={togglePlay}
        >
          {!isPlaying && (
            <div className="rounded-full bg-white/20 p-5 backdrop-blur-sm">
              <Play className="h-12 w-12 text-white" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div
          className={`absolute inset-x-0 bottom-0 flex flex-col gap-3 bg-gradient-to-t from-black/90 to-transparent p-4 transition-all duration-300 ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
        >
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase text-white/80">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div
            className="h-1.5 w-full cursor-pointer rounded-full bg-white/20"
            onClick={handleSeek}
          >
            <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <div className="flex items-center gap-2 text-white">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={toggleMute}
                >
                  {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-white/30"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-white">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Information */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">{lesson.title}</h1>
          <div className="rounded-md bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Duration: {lesson.duration}
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold uppercase text-foreground/70">
          {isCompleted && (
            <div className="flex items-center gap-2 rounded-full bg-success px-3 py-1 text-success-foreground">
              <CheckCircle className="h-4 w-4" />
              Completed
            </div>
          )}
        </div>
        {lesson.description && (
          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">{lesson.description}</p>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
        <Button variant="outline" onClick={onPrevious} disabled={!hasPrevious} className="flex items-center gap-2">
          <SkipBack className="h-4 w-4" />
          <span className="text-xs font-medium">Previous Lesson</span>
        </Button>

        <div className="text-center">
          <Progress value={progress} className="mx-auto mb-2 h-3 w-40" />
          <p className="text-xs font-semibold uppercase text-foreground/60">{Math.round(progress)}% Complete</p>
        </div>

        <Button
          variant={isCompleted ? 'default' : 'outline'}
          onClick={onNext}
          disabled={!hasNext}
          className="flex items-center gap-2"
        >
          <span className="text-xs font-medium">Next Lesson</span>
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}