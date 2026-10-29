import { React, ComponentRegistry, Thread } from 'mailspring-exports';
import Avatar from './Avatar';
import ContactPhotoCache from '../services/contact-photo-cache';
import { pickAvatarContact, ContactLike } from '../services/avatar-resolver';
import { identityKey, initialsFor, softColorsFor } from '../services/identity';

interface ThreadAvatarProps {
  thread: Thread;
}

function describe(contact: ContactLike | null) {
  if (!contact) {
    return { key: '?', email: '', initials: '?', title: '' };
  }
  const email = (contact.email || '').trim();
  const name = (contact.name || '').trim();
  return {
    key: identityKey(email, name),
    email,
    initials: initialsFor(name, email),
    title: name && email && name !== email ? `${name} <${email}>` : name || email,
  };
}

// Registered with the `ThreadListIcon` role, which the thread list renders in
// its first column (wide layout) and in the icons column of each row (narrow
// layout, used by the split view). Mailspring virtualizes the list, so rows
// mount and unmount while scrolling: rendering stays a pure function of the
// thread plus a Map lookup, and the photo subscription is per email.
export default class ThreadAvatar extends React.Component<ThreadAvatarProps> {
  static displayName = 'ModernUIThreadAvatar';
  static containerRequired = false;

  private subscribedEmail: string | null = null;
  private unsubscribe: (() => void) | null = null;
  private unlistenRegistry: (() => void) | null = null;

  componentDidMount() {
    this.syncPhotoSubscription();
    // Other plugins register their ThreadListIcon components after this one
    // (see renderOtherIcons); rows already on screen pick them up here.
    this.unlistenRegistry = ComponentRegistry.listen(this.onRegistryChanged);
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

  shouldComponentUpdate(nextProps: ThreadAvatarProps) {
    return nextProps.thread !== this.props.thread;
  }

  private onPhotoChanged = () => {
    this.forceUpdate();
  };

  private onRegistryChanged = () => {
    this.forceUpdate();
  };

  private syncPhotoSubscription() {
    const { email } = describe(pickAvatarContact(this.props.thread));
    const key = email.toLowerCase();
    if (key !== this.subscribedEmail) {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
      this.subscribedEmail = key;
      this.unsubscribe = key ? ContactPhotoCache.subscribe(key, this.onPhotoChanged) : null;
    }
    if (key && ContactPhotoCache.peek(key) === undefined) {
      ContactPhotoCache.request(email);
    }
  }

  // In the narrow layout the thread list renders only the first ThreadListIcon
  // component (matchLimit={1} in thread-list-columns.tsx). This plugin
  // activates early so that component is the avatar; the other plugins' icons
  // (open tracking, personal level indicators...) are rendered here instead so
  // they do not disappear. The wide layout renders them all itself, so the
  // stylesheet hides this copy there.
  private renderOtherIcons() {
    const others = ComponentRegistry.findComponentsMatching({ role: 'ThreadListIcon' }).filter(
      (component) => component !== ThreadAvatar
    );
    if (others.length === 0) {
      return null;
    }
    return (
      <span className="modern-ui-thread-avatar__extras">
        {others.map((Component) => (
          <Component key={Component.displayName} thread={this.props.thread} />
        ))}
      </span>
    );
  }

  render() {
    const { thread } = this.props;
    const identity = describe(pickAvatarContact(thread));
    const photo = identity.email ? ContactPhotoCache.peek(identity.email) : null;

    return (
      <span className="modern-ui-thread-avatar">
        <Avatar
          initials={identity.initials}
          colors={softColorsFor(identity.key)}
          photo={photo || null}
          title={identity.title}
        />
        {this.renderOtherIcons()}
      </span>
    );
  }
}
