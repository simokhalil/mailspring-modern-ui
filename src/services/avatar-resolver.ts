// Chooses which contact a thread's avatar represents. Works on duck-typed
// objects so it can be unit-tested without Mailspring.

export interface ContactLike {
  name?: string;
  email?: string;
  isMe?: () => boolean;
}

export interface MessageLike {
  draft?: boolean;
  from?: ContactLike[];
  to?: ContactLike[];
  cc?: ContactLike[];
}

export interface ThreadLike {
  participants?: ContactLike[];
  __messages?: MessageLike[];
}

export interface PickOptions {
  // Mailspring's Contact#isMe checks every account and alias. Injected so the
  // logic stays testable.
  isMe?: (contact: ContactLike) => boolean;
}

function defaultIsMe(contact: ContactLike) {
  return typeof contact.isMe === 'function' ? contact.isMe() : false;
}

function usable(contact: ContactLike | undefined): contact is ContactLike {
  return !!contact && !!((contact.email && contact.email.trim()) || (contact.name && contact.name.trim()));
}

// The avatar shows:
//  1. the sender of the most recent message that is not from the user, so the
//     avatar matches who last wrote. It only changes when a new message arrives;
//  2. if every message is from the user (Sent, a draft-only thread...), the
//     first recipient of the most recent message;
//  3. if messages are not loaded, the first participant that is not the user;
//  4. the user themself, as a last resort (notes to self).
export function pickAvatarContact(thread: ThreadLike | null | undefined, opts: PickOptions = {}): ContactLike | null {
  if (!thread) {
    return null;
  }
  const isMe = opts.isMe || defaultIsMe;

  const messages = Array.isArray(thread.__messages)
    ? thread.__messages.filter((m) => m && !m.draft)
    : [];

  if (messages.length > 0) {
    for (let i = messages.length - 1; i >= 0; i--) {
      const sender = (messages[i].from || []).find(usable);
      if (sender && !isMe(sender)) {
        return sender;
      }
    }
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      const recipient = [...(m.to || []), ...(m.cc || [])].find((c) => usable(c) && !isMe(c));
      if (recipient) {
        return recipient;
      }
    }
  }

  const participants = (thread.participants || []).filter(usable);
  const other = participants.find((c) => !isMe(c));
  if (other) {
    return other;
  }

  const lastSender = messages.length ? (messages[messages.length - 1].from || []).find(usable) : null;
  return lastSender || participants[0] || null;
}
