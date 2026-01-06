import { useCallback, useEffect, useState } from 'react';

export function useSlideshow(totalSlides: number) {
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const hasSlides = totalSlides > 0;
  const lastSlideIndex = Math.max(0, totalSlides - 1);

  const goNextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev === lastSlideIndex ? 0 : prev + 1));
  }, [lastSlideIndex]);

  const goPreviousSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev === 0 ? lastSlideIndex : prev - 1));
  }, [lastSlideIndex]);

  const closeSlideshow = () => {
    setIsSlideshow(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!isSlideshow || !isPlaying || !hasSlides) return;

    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev === lastSlideIndex ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(timer);
  }, [hasSlides, isPlaying, isSlideshow, lastSlideIndex]);

  useEffect(() => {
    if (!isSlideshow) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          goPreviousSlide();
          break;
        case 'ArrowRight':
          goNextSlide();
          break;
        case ' ':
          event.preventDefault();
          setIsPlaying((prev) => !prev);
          break;
        case 'Escape':
          closeSlideshow();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNextSlide, goPreviousSlide, isSlideshow]);

  useEffect(() => {
    const handleOpenSlideshow = () => {
      setIsSlideshow(true);
      setCurrentSlideIndex(0);
      setIsPlaying(true);
    };

    window.addEventListener('openSlideshow', handleOpenSlideshow);
    return () => window.removeEventListener('openSlideshow', handleOpenSlideshow);
  }, []);

  return {
    isSlideshow,
    currentSlideIndex,
    isPlaying,
    setIsPlaying,
    setIsSlideshow,
    goNextSlide,
    goPreviousSlide,
    closeSlideshow,
    hasSlides,
  };
}
