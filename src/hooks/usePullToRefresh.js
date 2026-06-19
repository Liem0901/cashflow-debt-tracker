import { useEffect, useRef, useState } from 'react';

const PULL_THRESHOLD = 72;
const MAX_PULL = 96;

export function usePullToRefresh(onRefresh, { disabled = false } = {}) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startYRef = useRef(0);
  const pullingRef = useRef(false);
  const pullDistanceRef = useRef(0);
  const isRefreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);

  onRefreshRef.current = onRefresh;

  useEffect(() => {
    if (disabled) return undefined;

    const canPull = () => window.scrollY <= 0;

    const onTouchStart = (event) => {
      if (!canPull() || isRefreshingRef.current) return;
      startYRef.current = event.touches[0].clientY;
      pullingRef.current = true;
    };

    const onTouchMove = (event) => {
      if (!pullingRef.current || isRefreshingRef.current) return;

      const deltaY = event.touches[0].clientY - startYRef.current;
      if (deltaY > 0 && canPull()) {
        event.preventDefault();
        const nextDistance = Math.min(deltaY * 0.45, MAX_PULL);
        pullDistanceRef.current = nextDistance;
        setPullDistance(nextDistance);
        return;
      }

      if (deltaY <= 0) {
        pullingRef.current = false;
        pullDistanceRef.current = 0;
        setPullDistance(0);
      }
    };

    const onTouchEnd = async () => {
      if (!pullingRef.current) return;
      pullingRef.current = false;

      if (pullDistanceRef.current >= PULL_THRESHOLD) {
        isRefreshingRef.current = true;
        setIsRefreshing(true);
        setPullDistance(PULL_THRESHOLD);
        try {
          await onRefreshRef.current?.();
        } finally {
          isRefreshingRef.current = false;
          setIsRefreshing(false);
          pullDistanceRef.current = 0;
          setPullDistance(0);
        }
        return;
      }

      pullDistanceRef.current = 0;
      setPullDistance(0);
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
    document.addEventListener('touchcancel', onTouchEnd);

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [disabled]);

  return {
    pullDistance: isRefreshing ? PULL_THRESHOLD : pullDistance,
    isRefreshing,
    isTriggered: pullDistance >= PULL_THRESHOLD || isRefreshing,
  };
}
