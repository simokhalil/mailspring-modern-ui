import { Contact, DatabaseStore } from 'mailspring-exports';
import { photoFromContactInfo } from './vcard-photo';

// Looks up photos embedded in the user's address book (CardDAV vCards) for the
// senders shown in the thread list. Lookups are batched into one local SQLite
// query per frame and cached, so scrolling a virtualized list costs one Map
// lookup per row. Nothing is fetched from the network.

type Listener = () => void;

const BATCH_DELAY_MS = 30;
const MAX_ENTRIES = 3000;

class ContactPhotoCache {
  // email (lowercase) -> data: URI, or null when the contact has no local photo.
  private cache = new Map<string, string | null>();
  // lowercase key -> the address as written, which is how Contact#email is stored.
  private queued = new Map<string, string>();
  private inFlight = new Set<string>();
  private listeners = new Map<string, Set<Listener>>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private unlistenDatabase: (() => void) | null = null;
  private disposed = false;

  activate() {
    this.disposed = false;
    this.unlistenDatabase = DatabaseStore.listen(this.onDatabaseChanged);
  }

  deactivate() {
    this.disposed = true;
    if (this.unlistenDatabase) {
      this.unlistenDatabase();
      this.unlistenDatabase = null;
    }
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.cache.clear();
    this.queued.clear();
    this.inFlight.clear();
    this.listeners.clear();
  }

  // undefined: not looked up yet; null: no photo; string: data URI.
  peek(email: string): string | null | undefined {
    const key = (email || '').toLowerCase();
    return key ? this.cache.get(key) : null;
  }

  request(email: string) {
    const key = (email || '').toLowerCase();
    if (this.disposed || !key || this.cache.has(key) || this.inFlight.has(key)) {
      return;
    }
    this.queued.set(key, email.trim());
    if (!this.timer) {
      this.timer = setTimeout(this.flush, BATCH_DELAY_MS);
    }
  }

  subscribe(email: string, listener: Listener): () => void {
    const key = (email || '').toLowerCase();
    if (!key) {
      return () => {};
    }
    let set = this.listeners.get(key);
    if (!set) {
      set = new Set();
      this.listeners.set(key, set);
    }
    set.add(listener);
    return () => {
      const current = this.listeners.get(key);
      if (current) {
        current.delete(listener);
        if (current.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  private notify(key: string) {
    const set = this.listeners.get(key);
    if (set) {
      [...set].forEach((fn) => fn());
    }
  }

  private store(key: string, value: string | null) {
    if (this.cache.size >= MAX_ENTRIES) {
      // Map keeps insertion order: drop the oldest entry.
      const oldest = this.cache.keys().next().value;
      if (oldest !== undefined) {
        this.cache.delete(oldest);
      }
    }
    this.cache.set(key, value);
  }

  private flush = async () => {
    this.timer = null;
    const batch = [...this.queued.keys()];
    const values = [...new Set([...batch, ...this.queued.values()])];
    this.queued.clear();
    if (batch.length === 0 || this.disposed) {
      return;
    }
    batch.forEach((k) => this.inFlight.add(k));

    const found = new Map<string, string>();
    try {
      // Contact#email keeps its original casing and SQLite compares exactly,
      // so ask for both the address as written and its lowercase form.
      const contacts = await DatabaseStore.findAll<Contact>(Contact).where(
        Contact.attributes.email.in(values)
      );
      for (const contact of contacts || []) {
        const key = (contact.email || '').toLowerCase();
        if (!key || found.has(key)) {
          continue;
        }
        const photo = photoFromContactInfo(contact.info);
        if (photo) {
          found.set(key, photo);
        }
      }
    } catch (err) {
      console.warn('[mailspring-modern-ui] contact photo lookup failed', err);
    }

    if (this.disposed) {
      return;
    }
    for (const key of batch) {
      this.inFlight.delete(key);
      const photo = found.get(key) || null;
      this.store(key, photo);
      if (photo) {
        this.notify(key);
      }
    }
  };

  // When the address book syncs, forget what we knew about those addresses so
  // the rows showing them look again.
  private onDatabaseChanged = (change: { objectClass: string; objects: any[] }) => {
    if (!change || change.objectClass !== 'Contact' || !Array.isArray(change.objects)) {
      return;
    }
    for (const contact of change.objects) {
      const key = ((contact && contact.email) || '').toLowerCase();
      if (key && this.cache.has(key)) {
        this.cache.delete(key);
        this.notify(key);
      }
    }
  };
}

export default new ContactPhotoCache();
