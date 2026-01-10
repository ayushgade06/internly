export const logger = {
  info: (scope: string, message: string, data?: any) => {
    console.log(`[Internly][${scope}] ${message}`, data ?? "");
  },

  warn: (scope: string, message: string, data?: any) => {
    console.warn(`[Internly][${scope}] ${message}`, data ?? "");
  },

  error: (scope: string, message: string, data?: any) => {
    console.error(`[Internly][${scope}] ${message}`, data ?? "");
  }
};
