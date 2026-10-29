"use strict";
// Computes the heading shown above the thread list from Mailspring's focused
// MailboxPerspective. Pure: Mailspring objects and `localized` are passed in.
Object.defineProperty(exports, "__esModule", { value: true });
exports.folderTitleFor = folderTitleFor;
function safeCategories(perspective) {
    try {
        return typeof perspective.categories === 'function' ? perspective.categories() || [] : [];
    }
    catch (err) {
        return [];
    }
}
function safeSharedRole(perspective) {
    try {
        return typeof perspective.categoriesSharedRole === 'function'
            ? perspective.categoriesSharedRole()
            : null;
    }
    catch (err) {
        return null;
    }
}
function accountSubtitle(perspective, ctx) {
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
function folderTitleFor(perspective, ctx) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9sZGVyLXRpdGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2VzL2ZvbGRlci10aXRsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsNkVBQTZFO0FBQzdFLDhFQUE4RTs7QUFvRDlFLHdDQWlDQztBQS9ERCxTQUFTLGNBQWMsQ0FBQyxXQUE0QjtJQUNsRCxJQUFJLENBQUM7UUFDSCxPQUFPLE9BQU8sV0FBVyxDQUFDLFVBQVUsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUM1RixDQUFDO0lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNiLE9BQU8sRUFBRSxDQUFDO0lBQ1osQ0FBQztBQUNILENBQUM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxXQUE0QjtJQUNsRCxJQUFJLENBQUM7UUFDSCxPQUFPLE9BQU8sV0FBVyxDQUFDLG9CQUFvQixLQUFLLFVBQVU7WUFDM0QsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsRUFBRTtZQUNwQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ1gsQ0FBQztJQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDYixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7QUFDSCxDQUFDO0FBRUQsU0FBUyxlQUFlLENBQUMsV0FBNEIsRUFBRSxHQUFpQjtJQUN0RSxNQUFNLEdBQUcsR0FBRyxXQUFXLENBQUMsVUFBVSxJQUFJLEVBQUUsQ0FBQztJQUN6QyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ2pELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNELElBQUksR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUNuQixPQUFPLEdBQUcsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUNELE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFELE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxJQUFJLE9BQU8sQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDeEUsQ0FBQztBQUVELFNBQWdCLGNBQWMsQ0FDNUIsV0FBK0MsRUFDL0MsR0FBaUI7SUFFakIsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2pCLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQztJQUN2QyxDQUFDO0lBRUQsZ0VBQWdFO0lBQ2hFLHNFQUFzRTtJQUN0RSxJQUFJLE9BQU8sV0FBVyxDQUFDLFdBQVcsS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUNoRCxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzdDLE9BQU87WUFDTCxLQUFLLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQztZQUN0QyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQztTQUNuRSxDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0sVUFBVSxHQUFHLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUMvQyxNQUFNLElBQUksR0FBRyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDeEUsSUFBSSxLQUFLLEdBQUcsV0FBVyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7SUFFbkMsSUFBSSxJQUFJLElBQUksR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ3JDLHVFQUF1RTtRQUN2RSx3RUFBd0U7UUFDeEUseUVBQXlFO1FBQ3pFLE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxPQUFPLENBQUM7UUFDcEcsSUFBSSxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxXQUFXLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNuRCxLQUFLLEdBQUcsR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQyxDQUFDO0lBQ0gsQ0FBQztJQUVELE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLGVBQWUsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNoRSxDQUFDIn0=