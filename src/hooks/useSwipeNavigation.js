import { useState, useEffect, useCallback, useRef } from 'react';

const PAGES = ['stake', 'longterm', 'burn', 'howitworks'];
const MIN_SWIPE_DISTANCE = 50;
const MAX_SCREEN_WIDTH = 1024;

export function useSwipeNavigation(currentPage, onNavigate) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [incomingPage, setIncomingPage] = useState(null); // 'stake', 'longterm', or 'burn'
  const [isAnimating, setIsAnimating] = useState(false);

  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const currentDragX = useRef(0);
  const dragDirection = useRef(null); // 'left' or 'right'

  // Refs to DOM elements for direct manipulation (no re-renders)
  const currentPageRef = useRef(null);
  const incomingPageRef = useRef(null);
  const containerRef = useRef(null);

  const currentIndex = PAGES.indexOf(currentPage);

  // Check screen width
  useEffect(() => {
    const checkWidth = () => {
      setIsEnabled(window.innerWidth < MAX_SCREEN_WIDTH);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Apply transforms directly to DOM (no state updates during drag)
  const applyTransforms = useCallback((dragX) => {
    const currentEl = currentPageRef.current;
    const incomingEl = incomingPageRef.current;
    if (!currentEl) return;

    // Current page follows finger
    currentEl.style.transform = `translateX(${dragX}px)`;

    // Incoming page slides in from the side
    if (incomingEl) {
      const windowWidth = window.innerWidth;
      if (dragDirection.current === 'left') {
        // Next page comes from right
        incomingEl.style.transform = `translateX(${windowWidth + dragX}px)`;
      } else if (dragDirection.current === 'right') {
        // Previous page comes from left
        incomingEl.style.transform = `translateX(${-windowWidth + dragX}px)`;
      }
    }
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (!isEnabled || isAnimating) return;

    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    currentDragX.current = 0;
    dragDirection.current = null;

    // Remove any existing transitions for immediate response
    if (currentPageRef.current) {
      currentPageRef.current.style.transition = 'none';
    }
  }, [isEnabled, isAnimating]);

  const handleTouchMove = useCallback((e) => {
    if (!isEnabled || isAnimating || touchStartX.current === null) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX.current;
    const deltaY = Math.abs(currentY - touchStartY.current);

    // If vertical scroll is dominant, ignore horizontal swipe
    if (!isDragging && deltaY > Math.abs(deltaX) && deltaY > 10) {
      touchStartX.current = null;
      return;
    }

    // Determine drag direction and incoming page
    if (!isDragging && Math.abs(deltaX) > 5) {
      const newDirection = deltaX < 0 ? 'left' : 'right';
      dragDirection.current = newDirection;

      // Determine which page should appear
      let nextPage = null;
      if (newDirection === 'left' && currentIndex < PAGES.length - 1) {
        nextPage = PAGES[currentIndex + 1];
      } else if (newDirection === 'right' && currentIndex > 0) {
        nextPage = PAGES[currentIndex - 1];
      }

      setIncomingPage(nextPage);
      setIsDragging(true);
    }

    if (isDragging) {
      // Apply resistance at edges (no next page available)
      let adjustedDelta = deltaX;
      const atLeftEdge = currentIndex === 0 && deltaX > 0;
      const atRightEdge = currentIndex === PAGES.length - 1 && deltaX < 0;

      if (atLeftEdge || atRightEdge) {
        adjustedDelta = deltaX * 0.2; // Rubber band effect
      }

      currentDragX.current = adjustedDelta;
      applyTransforms(adjustedDelta);
    }
  }, [isEnabled, isAnimating, isDragging, currentIndex, applyTransforms]);

  const handleTouchEnd = useCallback(() => {
    if (!isEnabled || touchStartX.current === null) return;

    const dragX = currentDragX.current;
    const shouldComplete = Math.abs(dragX) > MIN_SWIPE_DISTANCE && incomingPage !== null;

    // Add transition for snap animation
    const currentEl = currentPageRef.current;
    const incomingEl = incomingPageRef.current;
    const transition = 'transform 0.3s cubic-bezier(0, 0, 0.2, 1)';

    if (currentEl) currentEl.style.transition = transition;
    if (incomingEl) incomingEl.style.transition = transition;

    setIsAnimating(true);

    if (shouldComplete) {
      // Complete the transition
      const windowWidth = window.innerWidth;

      if (dragDirection.current === 'left') {
        // Slide current page fully left, incoming from right to center
        if (currentEl) currentEl.style.transform = `translateX(${-windowWidth}px)`;
        if (incomingEl) incomingEl.style.transform = 'translateX(0)';
      } else {
        // Slide current page fully right, incoming from left to center
        if (currentEl) currentEl.style.transform = `translateX(${windowWidth}px)`;
        if (incomingEl) incomingEl.style.transform = 'translateX(0)';
      }

      // After animation, change page
      setTimeout(() => {
        onNavigate(incomingPage);
        setIsDragging(false);
        setIncomingPage(null);
        setIsAnimating(false);

        // Reset transforms
        if (currentEl) {
          currentEl.style.transition = 'none';
          currentEl.style.transform = '';
        }
      }, 300);

    } else {
      // Snap back
      if (currentEl) currentEl.style.transform = 'translateX(0)';
      if (incomingEl) {
        const windowWidth = window.innerWidth;
        if (dragDirection.current === 'left') {
          incomingEl.style.transform = `translateX(${windowWidth}px)`;
        } else {
          incomingEl.style.transform = `translateX(${-windowWidth}px)`;
        }
      }

      setTimeout(() => {
        setIsDragging(false);
        setIncomingPage(null);
        setIsAnimating(false);

        if (currentEl) {
          currentEl.style.transition = 'none';
          currentEl.style.transform = '';
        }
      }, 300);
    }

    // Reset refs
    touchStartX.current = null;
    touchStartY.current = null;
    currentDragX.current = 0;
  }, [isEnabled, incomingPage, onNavigate]);

  // Attach touch listeners to container
  useEffect(() => {
    const container = containerRef.current;
    if (!isEnabled || !container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isEnabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    pages: PAGES,
    currentIndex,
    isEnabled,
    isDragging,
    incomingPage,
    containerRef,
    currentPageRef,
    incomingPageRef,
    dragDirection: dragDirection.current,
  };
}
