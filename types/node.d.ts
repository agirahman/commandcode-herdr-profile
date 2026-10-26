declare module 'node:fs' {
  export function readFileSync(path: string, encoding: string): string;
  export function readdirSync(path: string): string[];
}

declare module 'node:os' {
  export function homedir(): string;
}

declare module 'node:path' {
  export function join(...paths: string[]): string;
}

declare module 'fs' {
  export function readFileSync(path: string, encoding: string): string;
  export function readdirSync(path: string): string[];
}

declare module 'os' {
  export function homedir(): string;
}

declare module 'path' {
  export function join(...paths: string[]): string;
}
