import { useRef, useEffect, useCallback, useState } from 'react';

type ScrollFlag = ScrollBehavior | false;

export function useScrollToBottom() {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [scrollBehavior, setScrollBehavior] = useState<ScrollFlag>(false);

  // Check if user is at bottom of scroll container
  const checkIfAtBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const threshold = 10; // 10px threshold for "at bottom"
    const isBottom = scrollHeight - scrollTop - clientHeight < threshold;
    setIsAtBottom(isBottom);
  }, []);

  // Scroll to bottom function
  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      const container = containerRef.current;
      const endElement = endRef.current;
      
      if (!container || !endElement) return;

      // Use scrollTo for better control over the scroll behavior
      container.scrollTo({
        top: container.scrollHeight,
        behavior,
      });
    },
    [],
  );

  // Handle scroll behavior changes
  useEffect(() => {
    if (scrollBehavior) {
      scrollToBottom(scrollBehavior);
      setScrollBehavior(false);
    }
  }, [scrollBehavior, scrollToBottom]);

  // Add scroll event listener to detect position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      checkIfAtBottom();
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    checkIfAtBottom();

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [checkIfAtBottom]);

  // Expose scroll to bottom with behavior setting
  const scrollToBottomWithBehavior = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      setScrollBehavior(behavior);
    },
    [],
  );

  function onViewportEnter() {
    setIsAtBottom(true);
  }

  function onViewportLeave() {
    setIsAtBottom(false);
  }

  return {
    containerRef,
    endRef,
    isAtBottom,
    scrollToBottom: scrollToBottomWithBehavior,
    onViewportEnter,
    onViewportLeave,
  };
}
