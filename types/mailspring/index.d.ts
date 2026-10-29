// Minimal type declarations for the parts of the Mailspring plugin API used by
// this plugin. Mailspring does not publish its own types (see the starter's
// README), so these were written against the 1.26.2 sources:
//   app/src/global/mailspring-exports.js
//   app/src/global/mailspring-component-kit.js
// Only what the plugin actually calls is declared, and loosely.

declare module 'mailspring-exports' {
  import * as ReactNS from 'react';
  import * as ReactDOMNS from 'react-dom';

  export const React: typeof ReactNS;
  export const ReactDOM: typeof ReactDOMNS;

  type Unlisten = () => void;

  interface Listenable {
    listen(callback: (...args: any[]) => void, context?: any): Unlisten;
  }

  export interface Contact {
    id?: string;
    accountId?: string;
    name: string;
    email: string;
    info?: any;
    source?: string;
    isMe(): boolean;
    displayName(opts?: { compact?: boolean; includeAccountLabel?: boolean }): string;
  }
  export const Contact: {
    attributes: { email: { in(values: string[]): any } };
  };

  export interface Account {
    id: string;
    name: string;
    label: string;
    emailAddress: string;
    provider: string;
    color: string;
  }

  export interface Category {
    id: string;
    accountId: string;
    role: string;
    path: string;
    readonly displayName: string;
  }
  export const Category: {
    LocalizedStringForRole: { [role: string]: string };
  };

  export interface Message {
    id: string;
    accountId: string;
    threadId: string;
    subject: string;
    snippet: string;
    draft: boolean;
    unread: boolean;
    date: Date;
    from: Contact[];
    to: Contact[];
    cc: Contact[];
    isFromMe(): boolean;
  }

  export interface Thread {
    id: string;
    accountId: string;
    participants: Contact[];
    unread: boolean;
    starred: boolean;
    __messages?: Message[];
  }

  export interface MailboxPerspective {
    name: string;
    accountIds: string[];
    searchQuery?: string;
    categories(): Category[];
    categoriesSharedRole(): string | null;
    isInbox(): boolean;
    isSent(): boolean;
  }

  export const Actions: {
    focusDefaultMailboxPerspectiveForAccounts: (
      accountsOrIds: Array<Account | string>,
      opts?: { sidebarAccountIds?: string[] }
    ) => void;
    switchPreferencesTab: (tab: string) => void;
    openPreferences: () => void;
    queueTask: (task: any) => void;
    queueTasks: (tasks: any[]) => void;
    ensureCategoryIsFocused: (role: string, accountId: string) => void;
    setFocus: (opts: { collection: string; item: any }) => void;
    sendQuickReply: (context: { thread: Thread; message: Message }, body: string) => void;
  };

  export const AccountStore: Listenable & {
    accounts(): Account[];
    accountIds(): string[];
    accountForId(id: string): Account | null;
  };

  export const FocusedPerspectiveStore: Listenable & {
    current(): MailboxPerspective;
    sidebarAccountIds(): string[];
  };

  export const CategoryStore: Listenable & {
    getInboxCategory(accountOrId: Account | string): Category | null;
    getTrashCategory(accountOrId: Account | string): Category | null;
  };

  export const ThreadCountsStore: Listenable & {
    unreadCountForCategoryId(categoryId: string): number | null;
  };

  export const DatabaseStore: Listenable & {
    findAll<T>(klass: any, predicates?: any): Promise<T[]> & { where(...args: any[]): Promise<T[]> };
  };

  export const ComponentRegistry: Listenable & {
    register(component: any, descriptor: { role?: string; location?: any; modes?: string[] }): void;
    unregister(component: any): void;
    findComponentsMatching(descriptor: { role?: string; location?: any }): any[];
  };

  export const WorkspaceStore: Listenable & {
    Location: { [name: string]: { id: string; Toolbar: { id: string } } };
  };

  export const DOMUtils: {
    getWorkspaceCssNumberProperty(name: string, fallback: number): number;
  };

  export const TaskFactory: {
    taskForSettingUnread(opts: { threads: Thread[]; unread: boolean; source: string }): any;
    tasksForMovingToTrash(opts: { threads: Thread[]; source: string }): any[];
    tasksForArchiving(opts: { threads: Thread[]; source: string }): any[];
  };

  export const NativeNotifications: {
    displayNotification(opts: {
      title: string;
      subtitle?: string;
      body?: string;
      tag?: string;
      threadId?: string;
      messageId?: string;
      playSound?: boolean;
      canReply?: boolean;
      replyPlaceholder?: string;
      actions?: { type: 'button'; text: string }[];
      onActivate?: (event: {
        response: string | null;
        activationType: 'clicked' | 'replied' | 'action';
        actionIndex?: number;
      }) => void;
    }): Promise<{ id: string; close(): void } | null>;
  };

  export function localized(key: string, ...args: any[]): string;
  export function getCurrentLocale(): string;

  export class PreferencesTabItem {
    tabId: string;
    displayName: string;
    order: number;
    componentClassFn: () => any;
    constructor(opts: { tabId: string; displayName: string; componentClassFn: () => any; order?: number });
  }
  export const PreferencesUIStore: Listenable & {
    TabItem: typeof PreferencesTabItem;
    registerPreferencesTab(tab: PreferencesTabItem): void;
    unregisterPreferencesTab(tabOrId: PreferencesTabItem | string): void;
  };
}

declare module 'mailspring-component-kit' {
  import * as ReactNS from 'react';

  export const RetinaImg: ReactNS.ComponentClass<{
    name?: string;
    url?: string;
    fallback?: string;
    mode: string;
    className?: string;
    style?: ReactNS.CSSProperties;
    alt?: string;
  }> & {
    Mode: {
      ContentPreserve: string;
      ContentLight: string;
      ContentDark: string;
      ContentIsMask: string;
    };
  };
}

// Provided by Mailspring's Electron runtime; the plugin does not bundle them.
declare module 'electron' {
  export const ipcRenderer: { send(channel: string, ...args: any[]): void };
}

declare module '@electron/remote' {
  export interface MenuItemOptions {
    label?: string;
    type?: 'normal' | 'separator' | 'checkbox';
    checked?: boolean;
    enabled?: boolean;
    click?: () => void;
  }
  export const Menu: {
    buildFromTemplate(template: MenuItemOptions[]): { popup(opts?: object): void };
  };
}

// Mailspring's renderer global.
declare const AppEnv: {
  config: {
    get(key: string): any;
    set(key: string, value: any): boolean;
    unset(key: string): void;
    onDidChange(key: string, callback: (event: { newValue: any }) => void): { dispose(): void };
  };
  packages: {
    getPackageNamed(name: string): { name: string; directory: string } | undefined;
    isPackageActive(name: string): boolean;
  };
  displayWindow(): void;
  showErrorDialog(message: string): void;
  reportError(error: Error): void;
  isMainWindow(): boolean;
};
