"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_exports_1 = require("mailspring-exports");
const Avatar_1 = __importDefault(require("./Avatar"));
const contact_photo_cache_1 = __importDefault(require("../services/contact-photo-cache"));
const avatar_resolver_1 = require("../services/avatar-resolver");
const identity_1 = require("../services/identity");
function describe(contact) {
    if (!contact) {
        return { key: '?', email: '', initials: '?', title: '' };
    }
    const email = (contact.email || '').trim();
    const name = (contact.name || '').trim();
    return {
        key: (0, identity_1.identityKey)(email, name),
        email,
        initials: (0, identity_1.initialsFor)(name, email),
        title: name && email && name !== email ? `${name} <${email}>` : name || email,
    };
}
// Registered with the `ThreadListIcon` role, which the thread list renders in
// its first column (wide layout) and in the icons column of each row (narrow
// layout, used by the split view). Mailspring virtualizes the list, so rows
// mount and unmount while scrolling: rendering stays a pure function of the
// thread plus a Map lookup, and the photo subscription is per email.
class ThreadAvatar extends mailspring_exports_1.React.Component {
    constructor() {
        super(...arguments);
        this.subscribedEmail = null;
        this.unsubscribe = null;
        this.unlistenRegistry = null;
        this.onPhotoChanged = () => {
            this.forceUpdate();
        };
        this.onRegistryChanged = () => {
            this.forceUpdate();
        };
    }
    componentDidMount() {
        this.syncPhotoSubscription();
        // Other plugins register their ThreadListIcon components after this one
        // (see renderOtherIcons); rows already on screen pick them up here.
        this.unlistenRegistry = mailspring_exports_1.ComponentRegistry.listen(this.onRegistryChanged);
    }
    componentDidUpdate() {
        this.syncPhotoSubscription();
    }
    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        if (this.unlistenRegistry) {
            this.unlistenRegistry();
            this.unlistenRegistry = null;
        }
    }
    shouldComponentUpdate(nextProps) {
        return nextProps.thread !== this.props.thread;
    }
    syncPhotoSubscription() {
        const { email } = describe((0, avatar_resolver_1.pickAvatarContact)(this.props.thread));
        const key = email.toLowerCase();
        if (key !== this.subscribedEmail) {
            if (this.unsubscribe) {
                this.unsubscribe();
            }
            this.subscribedEmail = key;
            this.unsubscribe = key ? contact_photo_cache_1.default.subscribe(key, this.onPhotoChanged) : null;
        }
        if (key && contact_photo_cache_1.default.peek(key) === undefined) {
            contact_photo_cache_1.default.request(email);
        }
    }
    // In the narrow layout the thread list renders only the first ThreadListIcon
    // component (matchLimit={1} in thread-list-columns.tsx). This plugin
    // activates early so that component is the avatar; the other plugins' icons
    // (open tracking, personal level indicators...) are rendered here instead so
    // they do not disappear. The wide layout renders them all itself, so the
    // stylesheet hides this copy there.
    renderOtherIcons() {
        const others = mailspring_exports_1.ComponentRegistry.findComponentsMatching({ role: 'ThreadListIcon' }).filter((component) => component !== ThreadAvatar);
        if (others.length === 0) {
            return null;
        }
        return (mailspring_exports_1.React.createElement("span", { className: "modern-ui-thread-avatar__extras" }, others.map((Component) => (mailspring_exports_1.React.createElement(Component, { key: Component.displayName, thread: this.props.thread })))));
    }
    render() {
        const { thread } = this.props;
        const identity = describe((0, avatar_resolver_1.pickAvatarContact)(thread));
        const photo = identity.email ? contact_photo_cache_1.default.peek(identity.email) : null;
        return (mailspring_exports_1.React.createElement("span", { className: "modern-ui-thread-avatar" },
            mailspring_exports_1.React.createElement(Avatar_1.default, { initials: identity.initials, colors: (0, identity_1.softColorsFor)(identity.key), photo: photo || null, title: identity.title }),
            this.renderOtherIcons()));
    }
}
ThreadAvatar.displayName = 'ModernUIThreadAvatar';
ThreadAvatar.containerRequired = false;
exports.default = ThreadAvatar;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGhyZWFkQXZhdGFyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbXBvbmVudHMvVGhyZWFkQXZhdGFyLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJEQUFzRTtBQUN0RSxzREFBOEI7QUFDOUIsMEZBQWdFO0FBQ2hFLGlFQUE2RTtBQUM3RSxtREFBK0U7QUFNL0UsU0FBUyxRQUFRLENBQUMsT0FBMkI7SUFDM0MsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2IsT0FBTyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsQ0FBQztJQUMzRCxDQUFDO0lBQ0QsTUFBTSxLQUFLLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzNDLE1BQU0sSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN6QyxPQUFPO1FBQ0wsR0FBRyxFQUFFLElBQUEsc0JBQVcsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDO1FBQzdCLEtBQUs7UUFDTCxRQUFRLEVBQUUsSUFBQSxzQkFBVyxFQUFDLElBQUksRUFBRSxLQUFLLENBQUM7UUFDbEMsS0FBSyxFQUFFLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEtBQUssS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLO0tBQzlFLENBQUM7QUFDSixDQUFDO0FBRUQsOEVBQThFO0FBQzlFLDZFQUE2RTtBQUM3RSw0RUFBNEU7QUFDNUUsNEVBQTRFO0FBQzVFLHFFQUFxRTtBQUNyRSxNQUFxQixZQUFhLFNBQVEsMEJBQUssQ0FBQyxTQUE0QjtJQUE1RTs7UUFJVSxv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