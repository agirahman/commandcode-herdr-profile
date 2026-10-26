declare module '@commandcode/harness' {
  export interface ModUiSelectOption {
    label: string;
    description?: string;
  }

  export interface ModUiSelectConfig {
    title: string;
    options: ModUiSelectOption[];
  }

  export interface ModUi {
    capabilities?: {
      status?: boolean;
    };
    setStatus(text: string | null): void;
    notify(text: string, level?: 'info' | 'warning' | 'error'): void;
    select(config: ModUiSelectConfig): Promise<string | undefined>;
  }

  export interface ModCommandContext {
    args: string;
  }

  export interface ModCommandResult {
    message?: string;
  }

  export interface ModCommand {
    name: string;
    description: string;
    argumentHint?: string;
    handler: (ctx: ModCommandContext) => Promise<ModCommandResult> | ModCommandResult;
  }

  export interface ModFlagConfig {
    type: 'string' | 'boolean' | 'number';
    default?: unknown;
    description?: string;
  }

  export interface ModHooks {
    appendSystemPrompt?: () => string | undefined;
  }

  export interface ModApi {
    cwd: string;
    ui: ModUi;
    addFlag(name: string, config: ModFlagConfig): void;
    getFlag(name: string): unknown;
    hooks(hooks: ModHooks): void;
    addCommand(cmd: ModCommand): void;
    on(event: 'session_start' | 'session_end', handler: () => void): void;
  }
}
