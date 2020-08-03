interface Config extends NodeJS.Global {
  CONFIG?: { [key in string]?: string };
}

export default (key: string): string | undefined => (global as Config).CONFIG?.[key];
