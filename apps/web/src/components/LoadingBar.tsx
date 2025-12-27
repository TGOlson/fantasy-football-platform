import { useEffect, useState } from 'react';
import { useNavigation } from 'react-router-dom';
import { Box } from '@mantine/core';

/**
 * Slim loading bar shown at top of viewport during route transitions.
 * Automatically shows/hides based on React Router navigation state.
 */
export function LoadingBar() {
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);

  const isLoading = navigation.state === 'loading';

  useEffect(() => {
    if (isLoading) {
      // Start at 0
      setProgress(0);

      // Quickly move to 70% over 200ms
      const timer1 = setTimeout(() => setProgress(70), 50);

      // Slowly creep to 90% over the next 800ms
      const timer2 = setTimeout(() => setProgress(90), 250);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      // Complete the bar
      setProgress(100);

      // Hide after animation completes
      const timer = setTimeout(() => setProgress(0), 200);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (progress === 0) {
    return null;
  }

  return (
    <Box
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        backgroundColor: 'var(--mantine-color-blue-6)',
        transform: `scaleX(${progress / 100})`,
        transformOrigin: 'left',
        transition: progress === 100
          ? 'transform 150ms ease-out'
          : 'transform 200ms ease-out',
        zIndex: 9999,
      }}
    />
  );
}
