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

  export interface ModCustomEntry<T = unknown> {
    id?: string;
    customType: string;
    data: T;
  }

  export interface ModSession {
    appendCustomEntry<T = unknown>(entry: {customType: string; data: T}): void;
    getCustomEntries<T = unknown>(query: {customType: string}): ModCustomEntry<T>[];
  }

  export interface ModState {
    get<T = unknown>(key: string): T | undefined;
    set<T = unknown>(key: string, value: T): void;
    subscribe?<T = unknown>(key: string, callback: (value: T) => void): () => void;
  }

  export interface ModSessionStartEvent {
    source?: 'startup' | 'resume' | 'reload';
    sessionId?: string;
  }

  export interface ModHooks {
    appendSystemPrompt?: () => string | undefined;
    onSessionStart?: (event?: ModSessionStartEvent) => void;
    onSessionEnd?: (event?: {reason?: string}) => void;
  }

  export interface ModApi {
    cwd: string;
    ui: ModUi;
    session?: ModSession;
    state?: ModState;
    addFlag(name: string, config: ModFlagConfig): void;
    getFlag(name: string): unknown;
    hooks(hooks: ModHooks): void;
    addCommand(cmd: ModCommand): void;
    on(event: 'session_start' | 'session_end' | string, handler: (e?: any) => void): void;
  }
}
