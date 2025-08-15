import { useState, useCallback, useRef } from 'react';
import { useResponsive } from '../theme/responsive';

export interface SwipeGestureOptions {
  threshold?: number;
  velocity?: number;
  preventDefaultTouchMove?: boolean;
  disabled?: boolean;
}

export interface SwipeDirection {
  horizontal: 'left' | 'right' | 'none';
  vertical: 'up' | 'down' | 'none';
}

export interface SwipeGestureHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export interface SwipeGestureState {
  isActive: boolean;
  direction: SwipeDirection;
  distance: { x: number; y: number };
  velocity: { x: number; y: number };
}

/**
 * Hook for implementing swipe gestures with configurable callbacks
 */
export function useSwipeGestures(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  options: SwipeGestureOptions = {}
) {
  const { isTouchDevice } = useResponsive();
  const {
    threshold = 50,
    velocity = 0.3,
    preventDefaultTouchMove = false,
    disabled = false,
  } = options;

  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [gestureState, setGestureState] = useState<SwipeGestureState>({
    isActive: false,
    direction: { horizontal: 'none', vertical: 'none' },
    distance: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
  });

  const touchStartTime = useRef<number>(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || !isTouchDevice) return;

    const touch = e.targetTouches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchEnd(null);
    touchStartTime.current = Date.now();
    
    setGestureState({
      isActive: true,
      direction: { horizontal: 'none', vertical: 'none' },
      distance: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
    });
  }, [disabled, isTouchDevice]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || !isTouchDevice || !touchStart) return;

    if (preventDefaultTouchMove) {
      e.preventDefault();
    }

    const touch = e.targetTouches[0];
    const currentTouch = { x: touch.clientX, y: touch.clientY };
    setTouchEnd(currentTouch);

    // Calculate current distance and direction
    const distanceX = currentTouch.x - touchStart.x;
    const distanceY = currentTouch.y - touchStart.y;

    const horizontalDirection: 'left' | 'right' | 'none' = 
      Math.abs(distanceX) > 10 
        ? distanceX > 0 ? 'right' : 'left'
        : 'none';

    const verticalDirection: 'up' | 'down' | 'none' = 
      Math.abs(distanceY) > 10 
        ? distanceY > 0 ? 'down' : 'up'
        : 'none';

    setGestureState(prev => ({
      ...prev,
      direction: {
        horizontal: horizontalDirection,
        vertical: verticalDirection,
      },
      distance: { x: distanceX, y: distanceY },
    }));
  }, [disabled, isTouchDevice, touchStart, preventDefaultTouchMove]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (disabled || !isTouchDevice || !touchStart || !touchEnd) {
      setGestureState(prev => ({ ...prev, isActive: false }));
      return;
    }

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const absDistanceX = Math.abs(distanceX);
    const absDistanceY = Math.abs(distanceY);

    const touchDuration = Date.now() - touchStartTime.current;
    const velocityX = absDistanceX / touchDuration;
    const velocityY = absDistanceY / touchDuration;

    // Update final gesture state
    setGestureState(prev => ({
      ...prev,
      isActive: false,
      velocity: { x: velocityX, y: velocityY },
    }));

    // Determine if gesture meets threshold and velocity requirements
    const isHorizontalSwipe = absDistanceX > threshold && velocityX > velocity;
    const isVerticalSwipe = absDistanceY > threshold && velocityY > velocity;

    // Prioritize the direction with greater distance
    if (isHorizontalSwipe && absDistanceX > absDistanceY) {
      if (distanceX > 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (distanceX < 0 && onSwipeRight) {
        onSwipeRight();
      }
    } else if (isVerticalSwipe && absDistanceY > absDistanceX) {
      if (distanceY > 0 && onSwipeUp) {
        onSwipeUp();
      } else if (distanceY < 0 && onSwipeDown) {
        onSwipeDown();
      }
    }
  }, [
    disabled,
    isTouchDevice,
    touchStart,
    touchEnd,
    threshold,
    velocity,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
  ]);

  const handlers: SwipeGestureHandlers = {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };

  return {
    handlers,
    gestureState,
    isTouchDevice,
  };
}

/**
 * Hook for simple horizontal swipe detection (left/right only)
 */
export function useHorizontalSwipe(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  threshold: number = 50
) {
  return useSwipeGestures(
    onSwipeLeft,
    onSwipeRight,
    undefined,
    undefined,
    { threshold }
  );
}

/**
 * Hook for simple vertical swipe detection (up/down only)
 */
export function useVerticalSwipe(
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  threshold: number = 50
) {
  return useSwipeGestures(
    undefined,
    undefined,
    onSwipeUp,
    onSwipeDown,
    { threshold }
  );
}

/**
 * Hook for pull-to-refresh gesture
 */
export function usePullToRefresh(
  onRefresh: () => void | Promise<void>,
  options: {
    threshold?: number;
    triggerHeight?: number;
    disabled?: boolean;
  } = {}
) {
  const { threshold = 80, triggerHeight = 60, disabled = false } = options;
  const { isTouchDevice } = useResponsive();
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [startY, setStartY] = useState<number | null>(null);
  const scrollElement = useRef<HTMLElement | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || !isTouchDevice) return;

    const touch = e.targetTouches[0];
    setStartY(touch.clientY);
    
    // Check if we're at the top of the scrollable area
    const element = e.currentTarget as HTMLElement;
    scrollElement.current = element;
    
    if (element.scrollTop === 0) {
      setIsPulling(true);
    }
  }, [disabled, isTouchDevice]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || !isTouchDevice || !isPulling || !startY || isRefreshing) return;

    const touch = e.targetTouches[0];
    const currentY = touch.clientY;
    const pullDistance = Math.max(0, currentY - startY);

    // Prevent default scrolling when pulling
    if (pullDistance > 0 && scrollElement.current?.scrollTop === 0) {
      e.preventDefault();
    }

    setPullDistance(pullDistance);
  }, [disabled, isTouchDevice, isPulling, startY, isRefreshing]);

  const onTouchEnd = useCallback(async () => {
    if (disabled || !isTouchDevice || !isPulling) return;

    setIsPulling(false);

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
    setStartY(null);
  }, [disabled, isTouchDevice, isPulling, pullDistance, threshold, onRefresh]);

  const handlers: SwipeGestureHandlers = {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };

  return {
    handlers,
    isPulling,
    pullDistance,
    isRefreshing,
    shouldTrigger: pullDistance >= threshold,
    pullProgress: Math.min(pullDistance / triggerHeight, 1),
  };
}