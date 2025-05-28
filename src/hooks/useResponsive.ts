import { useState, useEffect } from 'react';

interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
}

const defaultBreakpoints: BreakpointConfig = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
};

export type BreakpointKey = keyof BreakpointConfig;

interface UseResponsiveReturn {
  // Current screen size
  width: number;
  height: number;
  
  // Breakpoint checks
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2Xl: boolean;
  is3Xl: boolean;
  
  // Utility functions
  isAbove: (breakpoint: BreakpointKey) => boolean;
  isBelow: (breakpoint: BreakpointKey) => boolean;
  isBetween: (min: BreakpointKey, max: BreakpointKey) => boolean;
  
  // Device type detection
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  
  // Orientation
  isPortrait: boolean;
  isLandscape: boolean;
  
  // Touch device detection
  isTouchDevice: boolean;
}

export function useResponsive(breakpoints: BreakpointConfig = defaultBreakpoints): UseResponsiveReturn {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch device
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    checkTouchDevice();

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const { width, height } = dimensions;

  // Breakpoint checks
  const isXs = width >= breakpoints.xs;
  const isSm = width >= breakpoints.sm;
  const isMd = width >= breakpoints.md;
  const isLg = width >= breakpoints.lg;
  const isXl = width >= breakpoints.xl;
  const is2Xl = width >= breakpoints['2xl'];
  const is3Xl = width >= breakpoints['3xl'];

  // Utility functions
  const isAbove = (breakpoint: BreakpointKey): boolean => {
    return width >= breakpoints[breakpoint];
  };

  const isBelow = (breakpoint: BreakpointKey): boolean => {
    return width < breakpoints[breakpoint];
  };

  const isBetween = (min: BreakpointKey, max: BreakpointKey): boolean => {
    return width >= breakpoints[min] && width < breakpoints[max];
  };

  // Device type detection
  const isMobile = width < breakpoints.md;
  const isTablet = width >= breakpoints.md && width < breakpoints.lg;
  const isDesktop = width >= breakpoints.lg;

  // Orientation
  const isPortrait = height > width;
  const isLandscape = width > height;

  return {
    width,
    height,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    is3Xl,
    isAbove,
    isBelow,
    isBetween,
    isMobile,
    isTablet,
    isDesktop,
    isPortrait,
    isLandscape,
    isTouchDevice,
  };
}

// Hook for getting responsive values
export function useResponsiveValue<T>(values: Partial<Record<BreakpointKey | 'base', T>>): T | undefined {
  const { width } = useResponsive();
  
  const breakpointEntries = Object.entries(defaultBreakpoints)
    .sort(([, a], [, b]) => b - a); // Sort descending
  
  // Check breakpoints from largest to smallest
  for (const [breakpoint, minWidth] of breakpointEntries) {
    if (width >= minWidth && values[breakpoint as BreakpointKey]) {
      return values[breakpoint as BreakpointKey];
    }
  }
  
  // Return base value if no breakpoint matches
  return values.base;
}

// Hook for responsive classes
export function useResponsiveClasses(classes: Partial<Record<BreakpointKey | 'base', string>>): string {
  const value = useResponsiveValue(classes);
  return value || '';
} 