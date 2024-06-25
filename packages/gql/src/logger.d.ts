/* eslint-disable @typescript-eslint/no-explicit-any */
export type Logger = {
  debug: (...messages: any[]) => void;
  info: (...messages: any[]) => void;
  warn: (...messages: any[]) => void;
  error: (...messages: any[]) => void;
};
