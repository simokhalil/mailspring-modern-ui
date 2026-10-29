// Extracts an embedded contact photo from the data Mailspring keeps in
// Contact#info. Only photos stored inside the contact itself are returned:
// remote URLs (Google People API photos, CardDAV PHOTO;VALUE=uri:https://...)
// are ignored on purpose, because loading them would send requests to a third
// party each time the thread list renders.

const MAX_PHOTO_LENGTH = 400 * 1024; // characters of base64, ~300 KB of image

const IMAGE_TYPES: { [key: string]: string } = {
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
};

function safeDataUri(value: string): string | null {
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
export function unfoldVCard(vcf: string): string[] {
  return vcf.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '').split('\n');
}

export function photoFromVCard(vcf: string | null | undefined): string | null {
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
export function photoFromContactInfo(info: any): string | null {
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
