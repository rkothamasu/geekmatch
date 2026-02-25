export const logger = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, meta || '');
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error || '');
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, meta || '');
  }
};
