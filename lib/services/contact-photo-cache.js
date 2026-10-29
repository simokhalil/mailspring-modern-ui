"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_exports_1 = require("mailspring-exports");
const vcard_photo_1 = require("./vcard-photo");
const BATCH_DELAY_MS = 30;
const MAX_ENTRIES = 3000;
class ContactPhotoCache {
    constructor() {
        // email (lowercase) -> data: URI, or null when the contact has no local photo.
        this.cache = new Map();
        // lowercase key -> the address as written, which is how Contact#email is stored.
        this.queued = new Map();
        this.inFlight = new Set();
        this.listeners = new Map();
        this.timer = null;
        this.unlistenDatabase = null;
        this.disposed = false;
        this.flush = async () => {
            this.timer = null;
            const batch = [...this.queued.keys()];
            const values = [...new Set([...batch, ...this.queued.values()])];
            this.queued.clear();
            if (batch.length === 0 || this.disposed) {
                return;
            }
            batch.forEach((k) => this.inFlight.add(k));
            const found = new Map();
            try {
                // Contact#email keeps its original casing and SQLite compares exactly,
                // so ask for both the address as written and its lowercase form.
                const contacts = await mailspring_exports_1.DatabaseStore.findAll(mailspring_exports_1.Contact).where(mailspring_exports_1.Contact.attributes.email.in(values));
                for (const contact of contacts || []) {
                    const key = (contact.email || '').toLowerCase();
                    if (!key || found.has(key)) {
                        continue;
                    }
                    const photo = (0, vcard_photo_1.photoFromContactInfo)(contact.info);
                    if (photo) {
                        found.set(key, photo);
                    }
                }
            }
            catch (err) {
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
        this.onDatabaseChanged = (change) => {
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
    activate() {
        this.disposed = false;
        this.unlistenDatabase = mailspring_exports_1.DatabaseStore.listen(this.onDatabaseChanged);
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
    peek(email) {
        const key = (email || '').toLowerCase();
        return key ? this.cache.get(key) : null;
    }
    request(email) {
        const key = (email || '').toLowerCase();
        if (this.disposed || !key || this.cache.has(key) || this.inFlight.has(key)) {
            return;
        }
        this.queued.set(key, email.trim());
        if (!this.timer) {
            this.timer = setTimeout(this.flush, BATCH_DELAY_MS);
        }
    }
    subscribe(email, listener) {
        const key = (email || '').toLowerCase();
        if (!key) {
            return () => { };
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
    notify(key) {
        const set = this.listeners.get(key);
        if (set) {
            [...set].forEach((fn) => fn());
        }
    }
    store(key, value) {
        if (this.cache.size >= MAX_ENTRIES) {
            // Map keeps insertion order: drop the oldest entry.
            const oldest = this.cache.keys().next().value;
            if (oldest !== undefined) {
                this.cache.delete(oldest);
            }
        }
        this.cache.set(key, value);
    }
}
exports.default = new ContactPhotoCache();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGFjdC1waG90by1jYWNoZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9jb250YWN0LXBob3RvLWNhY2hlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkRBQTREO0FBQzVELCtDQUFxRDtBQVNyRCxNQUFNLGNBQWMsR0FBRyxFQUFFLENBQUM7QUFDMUIsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDO0FBRXpCLE1BQU0saUJBQWlCO0lBQXZCO1FBQ0UsK0VBQStFO1FBQ3ZFLFVBQUssR0FBRyxJQUFJLEdBQUcsRUFBeUIsQ0FBQztRQUNqRCxpRkFBaUY7UUFDekUsV0FBTSxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO1FBQ25DLGFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBQzdCLGNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBeUIsQ0FBQztRQUM3QyxVQUFLLEdBQXlDLElBQUksQ0FBQztRQUNuRCxxQkFBZ0IsR0FBd0IsSUFBSSxDQUFDO1FBQzdDLGFBQVEsR0FBRyxLQUFLLENBQUM7UUFnRmpCLFVBQUssR0FBRyxLQUFLLElBQUksRUFBRTtZQUN6QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNsQixNQUFNLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sTUFBTSxHQUFHLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3BCLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUN4QyxPQUFPO1lBQ1QsQ0FBQztZQUNE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