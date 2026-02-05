import { useState, useEffect, useCallback, useRef } from 'react';

const PAGES = ['stake', 'longterm', 'burn'];
const MIN_SWIPE_DISTANCE = 50;
const MAX_SCREEN_WIDTH = 1024;

export function useSwipeNavigation(currentPage, onNavigate) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  const touchStartX = useRef(null);
  const containerRef = useRef(null);

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
    touchStartX.current = e.touches[0].clientX;
    setIsDragging(true);
  }, [isEnabled]);

  const handleTouchMove = useCallback((e) => {
    if (!isEnabled || !isDragging || touchStartX.current === null) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX.current;

    // Limit drag at edges (add resistance)
    const atLeftEdge = currentIndex === 0 && diff > 0;
    const atRightEdge = currentIndex === PAGES.length - 1 && diff < 0;

    if (atLeftEdge || atRightEdge) {
      // Add rubber-band resistance at edges
      setDragOffset(diff * 0.3);
    } else {
      setDragOffset(diff);
    }
  }, [isEnabled, isDragging, currentIndex]);

  const handleTouchEnd = useCallback(() => {
    if (!isEnabled || !isDragging) {
      setIsDragging(false);
      return;
    }

    const shouldGoNext = dragOffset < -MIN_SWIPE_DISTANCE && currentIndex < PAGES.length - 1;
    const shouldGoPrev = dragOffset > MIN_SWIPE_DISTANCE && currentIndex > 0;

    if (shouldGoNext) {
      onNavigate(PAGES[currentIndex + 1]);
    } else if (shouldGoPrev) {
      onNavigate(PAGES[currentIndex - 1]);
    }

    // Reset drag state
    setDragOffset(0);
    setIsDragging(false);
    touchStartX.current = null;
  }, [isEnabled, isDragging, dragOffset, currentIndex, onNavigate]);

  // Attach touch listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!isEnabled || !container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isEnabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Calculate transform for the pages container
  const getContainerStyle = useCallback(() => {
    if (!isEnabled) {
      return {};
    }

    const baseOffset = -currentIndex * 100; // percentage
    const dragPercent = (dragOffset / window.innerWidth) * 100;

    return {
      transform: `translateX(calc(${baseOffset}% + ${dragOffset}px))`,
      transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0, 0, 0.2, 1)',
    };
  }, [isEnabled, currentIndex, dragOffset, isDragging]);

  return {
    pages: PAGES,
    currentIndex,
    isEnabled,
    isDragging,
    dragOffset,
    containerRef,
    getContainerStyle,
  };
}
