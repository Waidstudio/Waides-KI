import { useState, useEffect } from 'react';

export type AppMode = 'demo' | 'real';

export function useModeSwitch() {
  const [currentMode, setCurrentMode] = useState<AppMode>('demo');
  const [isLoading, setIsLoading] = useState(false);

  // Get current mode on component mount
  useEffect(() => {
    const fetchCurrentMode = async () => {
      try {
        const response = await fetch('/api/mode/current');
        const data = await response.json();
        if (data.success) {
          setCurrentMode(data.mode);
        }
      } catch (error) {
        console.error('Failed to fetch current mode:', error);
      }
    };

    fetchCurrentMode();
  }, []);

  const switchMode = async (newMode: AppMode) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/mode/switch', {
        method: 'POST',
        body: JSON.stringify({ mode: newMode }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentMode(newMode);
        // Reload the page to fetch fresh data with the new mode
        window.location.reload();
      } else {
        console.error('Failed to switch mode:', data.message);
      }
    } catch (error) {
      console.error('Error switching mode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentMode,
    switchMode,
    isLoading,
  };
}