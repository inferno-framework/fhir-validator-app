declare module 'blob-polyfill';

declare namespace NodeJS {
  interface Global {
    CONFIG?: { [key in string]?: string };
  }
}
