type Level = 'info' | 'warn' | 'error';

function fmt(level: Level, scope: string, msg: string): string {
  return `${new Date().toISOString()} [${level}] [${scope}] ${msg}`;
}

function stringifyErr(err: unknown): string {
  if (err instanceof Error) return err.stack ?? `${err.name}: ${err.message}`;
  return String(err);
}

export const log = {
  info(scope: string, msg: string): void {
    console.log(fmt('info', scope, msg));
  },
  warn(scope: string, msg: string): void {
    console.warn(fmt('warn', scope, msg));
  },
  error(scope: string, msg: string, err?: unknown): void {
    console.error(fmt('error', scope, msg));
    if (err !== undefined) console.error(stringifyErr(err));
  },
};
