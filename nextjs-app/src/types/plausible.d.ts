/**
 * TypeScript definitions for Plausible Analytics
 */
declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: {
        props?: Record<string, string | number | boolean>;
        callback?: () => void;
      },
    ) => void;
  }
}

export {};
