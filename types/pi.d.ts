declare module '@earendil-works/pi-coding-agent' {
  export interface ExtensionAPI {
    on(event: string, handler: (event: any, ctx: any) => any): void;
    registerCommand(
      name: string,
      config: {
        description?: string;
        getArgumentCompletions?: (prefix: string) => Array<{ value: string; label: string }> | null;
        handler: (args: string, ctx: any) => Promise<void> | void;
      }
    ): void;
  }
}
