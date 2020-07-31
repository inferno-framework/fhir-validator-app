interface config extends NodeJS.Global {
  CONFIG: Record<string, string>;
}

export default (key: string): string | undefined => (global as config)?.CONFIG?.[key];
