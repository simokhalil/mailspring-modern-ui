"use strict";
// Extracts an embedded contact photo from the data Mailspring keeps in
// Contact#info. Only photos stored inside the contact itself are returned:
// remote URLs (Google People API photos, CardDAV PHOTO;VALUE=uri:https://...)
// are ignored on purpose, because loading them would send requests to a third
// party each time the thread list renders.
Object.defineProperty(exports, "__esModule", { value: true });
exports.unfoldVCard = unfoldVCard;
exports.photoFromVCard = photoFromVCard;
exports.photoFromContactInfo = photoFromContactInfo;
const MAX_PHOTO_LENGTH = 400 * 1024; // characters of base64, ~300 KB of image
const IMAGE_TYPES = {
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
};
function safeDataUri(value) {
    const uri = value.trim();
    if (uri.length > MAX_PHOTO_LENGTH) {
        return null;
    }
    // Only base64 raster images; no SVG, which could carry markup.
    if (/^data:image\/(jpeg|jpg|png|gif|webp);base64,[A-Za-z0-9+/=\s]+$/i.test(uri)) {
        return uri.replace(/\s+/g, '');
    }
    return null;
}
// RFC 6350 §3.2: a line break followed by a space or tab continues the line.
function unfoldVCard(vcf) {
    return vcf.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '').split('\n');
}
function photoFromVCard(vcf) {
    if (!vcf || typeof vcf !== 'string') {
        return null;
    }
    for (const line of unfoldVCard(vcf)) {
        const colon = line.indexOf(':');
        if (colon <= 0) {
            continue;
        }
        const head = line.slice(0, colon);
        const params = head.split(';');
        // Strip an optional group prefix ("item1.PHOTO").
        const prop = params[0].replace(/^.*\./, '').toUpperCase();
        if (prop !== 'PHOTO') {
            continue;
        }
        const value = line.slice(colon + 1).trim();
        // vCard 4.0: PHOTO:data:image/jpeg;base64,....
        if (/^data:/i.test(value)) {
            const uri = safeDataUri(value);
            if (uri) {
                return uri;
            }
            continue;
        }
        // vCard 2.1 / 3.0: PHOTO;ENCODING=b;TYPE=JPEG:<base64>
        const lowerParams = params.slice(1).map((p) => p.toLowerCase());
        const isBase64 = lowerParams.some((p) => p === 'encoding=b' || p === 'encoding=base64' || p === 'base64');
        if (!isBase64) {
            continue; // VALUE=uri / remote URL
        }
        let type = 'jpeg';
        for (const p of lowerParams) {
            const m = /^type=(\w+)$/.exec(p) || /^(jpeg|jpg|png|gif|webp)$/.exec(p);
            if (m && IMAGE_TYPES[m[1]]) {
                type = m[1];
            }
        }
        const uri = safeDataUri(`data:${IMAGE_TYPES[type]};base64,${value}`);
        if (uri) {
            return uri;
        }
    }
    return null;
}
// Contact#info holds { vcf, href } for CardDAV contacts and the Google People
// API JSON for Google contacts (whose photos are remote URLs).
function photoFromContactInfo(info) {
    if (!info || typeof info !== 'object') {
        return null;
    }
    if (typeof info.vcf === 'string') {
        return photoFromVCard(info.vcf);
    }
    if (Array.isArray(info.photos)) {
        for (const photo of info.photos) {
            if (photo && !photo.default && typeof photo.url === 'string') {
                const uri = safeDataUri(photo.url);
                if (uri) {
                    return uri;
                }
            }
        }
    }
    return null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmNhcmQtcGhvdG8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvdmNhcmQtcGhvdG8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHVFQUF1RTtBQUN2RSwyRUFBMkU7QUFDM0UsOEVBQThFO0FBQzlFLDhFQUE4RTtBQUM5RSwyQ0FBMkM7O0FBeUIzQyxrQ0FFQztBQUVELHdDQThDQztBQUlELG9EQWtCQztBQS9GRCxNQUFNLGdCQUFnQixHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyx5Q0FBeUM7QUFFOUUsTUFBTSxXQUFXLEdBQThCO0lBQzdDLElBQUksRUFBRSxZQUFZO0lBQ2xCLEdBQUcsRUFBRSxZQUFZO0lBQ2pCLEdBQUcsRUFBRSxXQUFXO0lBQ2hCLEdBQUcsRUFBRSxXQUFXO0lBQ2hCLElBQUksRUFBRSxZQUFZO0NBQ25CLENBQUM7QUFFRixTQUFTLFdBQVcsQ0FBQyxLQUFhO0lBQ2hDLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN6QixJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsZ0JBQWdCLEVBQUUsQ0FBQztRQUNsQyxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFDRCwrREFBK0Q7SUFDL0QsSUFBSSxpRUFBaUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUNoRixPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFFRCw2RUFBNkU7QUFDN0UsU0FBZ0IsV0FBVyxDQUFDLEdBQVc7SUFDckMsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4RSxDQUFDO0FB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