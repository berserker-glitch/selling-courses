import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { Lesson } from '@/types';

/**
 * VideoPlayer Props interface
 * Defines the properties for the video player component including
 * lesson data, navigation callbacks, and user info for watermarking
 */
interface VideoPlayerProps {
  lesson: Lesson;
  onComplete?: () => void;
  isCompleted?: boolean;
  userEmail?: string;
  userId?: string;
}

/**
 * VideoPlayer Component
 * A clean, minimal video player with anti-piracy features.
 * Designed to be embedded in the CourseDetail page.
 * Navigation controls are handled by the parent component.
 */
export function VideoPlayer({
  lesson,
  onComplete,
  isCompleted = false,
  userEmail,
  userId,
}: VideoPlayerProps) {
  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // DOM refs for video element and container
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  /**
   * Effect: Track video progress and trigger completion callback
   * Updates progress bar and current time display
   * Triggers onComplete when video reaches 90% watched
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (!video.duration || Number.isNaN(video.duration)) return;
      const percent = (video.currentTime / video.duration) * 100;
      setProgress(percent);
      setCurrentTime(video.currentTime);

      // Trigger completion at 90% progress
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

  /**
   * Effect: Anti-Piracy - Auto-pause on tab switch
   * Prevents screen recording by pausing when user switches tabs
   */
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

  /**
   * Effect: Anti-Piracy - DevTools Detection
   * Rudimentary check for DevTools by monitoring window dimensions
   */
  useEffect(() => {
    const checkDevTools = () => {
      const threshold = 160;
      if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
        if (isPlaying) {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      }
    };
    window.addEventListener('resize', checkDevTools);
    return () => window.removeEventListener('resize', checkDevTools);
  }, [isPlaying]);

  /**
   * Effect: Handle fullscreen change events
   */
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  /**
   * Effect: Cleanup hide controls timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, []);

  /**
   * Schedules hiding controls after a delay when video is playing
   */
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

  /**
   * Shows controls on pointer activity
   */
  const handlePointerActivity = () => {
    setShowControls(true);
    scheduleHideControls();
  };

  /**
   * Toggles video play/pause state
   */
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

  /**
   * Handles seeking in the video via progress bar click
   */
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * video.duration;
    setProgress(percent * 100);
    setCurrentTime(video.currentTime);
  };

  /**
   * Handles volume slider changes
   */
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

  /**
   * Toggles mute state
   */
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const newMuted = !isMuted;
    video.muted = newMuted;
    setIsMuted(newMuted);
    setVolume(newMuted ? 0 : Math.round(video.volume * 100) || 100);
  };

  /**
   * Toggles fullscreen mode
   */
  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };

  /**
   * Formats seconds to MM:SS display
   */
  const formatTime = (time: number) => {
    if (!Number.isFinite(time) || time < 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-slate-900 group"
      onMouseMove={handlePointerActivity}
      onMouseEnter={handlePointerActivity}
      onTouchStart={handlePointerActivity}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        src={lesson.videoUrl}
        poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%231e293b'/%3E%3C/svg%3E"
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

      {/* Anti-Piracy Watermark - Subtle overlay with user info */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-20 select-none">
        <div className="absolute top-8 left-8 text-white/30 text-[10px] font-medium tracking-wide">
          {userEmail}
        </div>
        <div className="absolute bottom-16 right-8 text-white/30 text-[10px] font-medium tracking-wide">
          {userId?.substring(0, 8)}
        </div>
      </div>

      {/* Play/Pause Overlay - Large centered play button */}
      <div
        className={`absolute inset-0 flex cursor-pointer items-center justify-center transition-all duration-300 ${!isPlaying || showControls ? 'opacity-100' : 'opacity-0'
          }`}
        onClick={togglePlay}
      >
        {!isPlaying && (
          <div className="rounded-full bg-white/90 p-6 shadow-2xl transition-transform duration-200 hover:scale-110">
            <Play className="h-12 w-12 text-slate-800 ml-1" fill="currentColor" />
          </div>
        )}
      </div>

      {/* Bottom Controls - Minimal gradient with progress and basic controls */}
      <div
        className={`absolute inset-x-0 bottom-0 flex flex-col gap-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12 transition-all duration-300 ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
      >
        {/* Time Display */}
        <div className="flex items-center justify-between text-[11px] font-medium text-white/80">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Progress Bar */}
        <div
          className="h-1 w-full cursor-pointer rounded-full bg-white/20 hover:h-1.5 transition-all"
          onClick={handleSeek}
        >
          <div
            className="h-full rounded-full bg-white transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play/Pause Button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            {/* Volume Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
              >
                {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                onClick={(e) => e.stopPropagation()}
                className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/30 accent-white"
              />
            </div>
          </div>

          {/* Fullscreen Button */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}