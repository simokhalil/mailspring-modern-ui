// Computes the heading shown above the thread list from Mailspring's focused
// MailboxPerspective. Pure: Mailspring objects and `localized` are passed in.

export interface PerspectiveLike {
  name?: string;
  accountIds?: string[];
  searchQuery?: string;
  categories?: () => Array<{ role?: string | null; path?: string }>;
  categoriesSharedRole?: () => string | null;
}

export interface TitleContext {
  accounts: Array<{ id: string; label?: string; emailAddress?: string }>;
  localized: (key: string, ...args: any[]) => string;
  // Category.LocalizedStringForRole: role -> name in the app's language.
  localizedRoles: { [role: string]: string };
}

export interface FolderTitle {
  title: string;
  subtitle: string | null;
}

function safeCategories(perspective: PerspectiveLike) {
  try {
    return typeof perspective.categories === 'function' ? perspective.categories() || [] : [];
  } catch (err) {
    return [];
  }
}

function safeSharedRole(perspective: PerspectiveLike): string | null {
  try {
    return typeof perspective.categoriesSharedRole === 'function'
      ? perspective.categoriesSharedRole()
      : null;
  } catch (err) {
    return null;
  }
}

function accountSubtitle(perspective: PerspectiveLike, ctx: TitleContext): string | null {
  const ids = perspective.accountIds || [];
  if (ctx.accounts.length <= 1 || ids.length === 0) {
    return null;
  }
  if (ids.length > 1) {
    return ctx.localized('All Accounts');
  }
  const account = ctx.accounts.find((a) => a.id === ids[0]);
  return account ? account.label || account.emailAddress || null : null;
}

export function folderTitleFor(
  perspective: PerspectiveLike | null | undefined,
  ctx: TitleContext
): FolderTitle {
  if (!perspective) {
    return { title: '', subtitle: null };
  }

  // SearchMailboxPerspective (thread-search package) names itself
  // "Searching <folder>" in English only; it exposes the query instead.
  if (typeof perspective.searchQuery === 'string') {
    const query = perspective.searchQuery.trim();
    return {
      title: ctx.localized('Search Results'),
      subtitle: query ? `“${query}”` : accountSubtitle(perspective, ctx),
    };
  }

  const categories = safeCategories(perspective);
  const role = categories.length > 0 ? safeSharedRole(perspective) : null;
  let title = perspective.name || '';

  if (role && ctx.localizedRoles[role]) {
    // In the unified view a perspective spans one folder per account, each
    // possibly named differently on its server; the role name reads better.
    // The IMAP inbox is always "INBOX", which Mailspring shows untranslated.
    const isInboxPath = categories.length === 1 && (categories[0].path || '').toUpperCase() === 'INBOX';
    if (categories.length > 1 || isInboxPath || !title) {
      title = ctx.localizedRoles[role];
    }
  }

  return { title, subtitle: accountSubtitle(perspective, ctx) };
}
