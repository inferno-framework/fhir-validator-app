export default (key: string): string | undefined => (global as NodeJS.Global).CONFIG?.[key];
