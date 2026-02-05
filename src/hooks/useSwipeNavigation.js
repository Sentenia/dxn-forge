import { useState, useEffect, useCallback } from 'react';

const PAGES = ['stake', 'longterm', 'burn'];
const MIN_SWIPE_DISTANCE = 50;
const MAX_SCREEN_WIDTH = 1024;

export function useSwipeNavigation(currentPage, onNavigate) {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  // Check screen width and enable/disable swipe
  useEffect(() => {
    const checkWidth = () => {
      setIsEnabled(window.innerWidth < MAX_SCREEN_WIDTH);
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const currentIndex = PAGES.indexOf(currentPage);

  const handleTouchStart = useCallback((e) => {
    if (!isEnabled) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(true);
  }, [isEnabled]);

  const handleTouchMove = useCallback((e) => {
    if (!isEnabled || !isSwiping) return;
    setTouchEnd(e.targetTouches[0].clientX);
  }, [isEnabled, isSwiping]);

  const handleTouchEnd = useCallback(() => {
    if (!isEnabled || !touchStart || !touchEnd) {
      setIsSwiping(false);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > MIN_SWIPE_DISTANCE;
    const isRightSwipe = distance < -MIN_SWIPE_DISTANCE;

    if (isLeftSwipe && currentIndex < PAGES.length - 1) {
      // Swipe left = next page
      onNavigate(PAGES[currentIndex + 1]);
    } else if (isRightSwipe && currentIndex > 0) {
      // Swipe right = previous page
      onNavigate(PAGES[currentIndex - 1]);
    }

    setTouchStart(null);
    setTouchEnd(null);
    setIsSwiping(false);
  }, [isEnabled, touchStart, touchEnd, currentIndex, onNavigate]);

  // Attach touch listeners to document
  useEffect(() => {
    if (!isEnabled) return;

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isEnabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    pages: PAGES,
    currentIndex,
    isEnabled,
  };
}
