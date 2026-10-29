"use strict";
// Chooses which contact a thread's avatar represents. Works on duck-typed
// objects so it can be unit-tested without Mailspring.
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickAvatarContact = pickAvatarContact;
function defaultIsMe(contact) {
    return typeof contact.isMe === 'function' ? contact.isMe() : false;
}
function usable(contact) {
    return !!contact && !!((contact.email && contact.email.trim()) || (contact.name && contact.name.trim()));
}
// The avatar shows:
//  1. the sender of the most recent message that is not from the user, so the
//     avatar matches who last wrote. It only changes when a new message arrives;
//  2. if every message is from the user (Sent, a draft-only thread...), the
//     first recipient of the most recent message;
//  3. if messages are not loaded, the first participant that is not the user;
//  4. the user themself, as a last resort (notes to self).
function pickAvatarContact(thread, opts = {}) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXZhdGFyLXJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2VzL2F2YXRhci1yZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsMEVBQTBFO0FBQzFFLHVEQUF1RDs7QUF5Q3ZELDhDQWtDQztBQWpERCxTQUFTLFdBQVcsQ0FBQyxPQUFvQjtJQUN2QyxPQUFPLE9BQU8sT0FBTyxDQUFDLElBQUksS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ3JFLENBQUM7QUFFRCxTQUFTLE1BQU0sQ0FBQyxPQUFnQztJQUM5QyxPQUFPLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDM0csQ0FBQztBQUVELG9CQUFvQjtBQUNwQiw4RUFBOEU7QUFDOUUsaUZBQWlGO0FBQ2pGLDRFQUE0RTtBQUM1RSxrREFBa0Q7QUFDbEQsOEVBQThFO0FBQzlFLDJEQUEyRDtBQUMzRCxTQUFnQixpQkFBaUIsQ0FBQyxNQUFxQyxFQUFFLE9BQW9CLEVBQUU7SUFDN0YsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ1osT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ0QsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxXQUFXLENBQUM7SUFFdEMsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO1FBQy9DLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUNoRCxDQUFDLENBQUMsRUFBRSxDQUFDO0lBRVAsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ3hCLEtBQUssSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzlDLE1BQU0sTUFBTSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDckQsSUFBSSxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztnQkFDNUIsT0FBTyxNQUFNLENBQUM7WUFDaEIsQ0FBQztRQUNILENBQUM7UUFDRCxLQUFLLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUM5QyxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEIsTUFBTSxTQUFTLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEYsSUFBSSxTQUFTLEVBQUUsQ0FBQztnQkFDZCxPQUFPLFNBQVMsQ0FBQztZQUNuQixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFFRCxNQUFNLFlBQVksR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2hFLE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakQsSUFBSSxLQUFLLEVBQUUsQ0FBQztRQUNWLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ3BHLE9BQU8sVUFBVSxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUM7QUFDL0MsQ0FBQyJ9