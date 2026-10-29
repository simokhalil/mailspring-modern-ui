import { React } from 'mailspring-exports';
import { RetinaImg } from 'mailspring-component-kit';
import Avatar from './Avatar';
import { LucideGlyph, SimpleGlyph } from './IconGlyph';
import { AccountAppearance } from '../services/account-icons';

// One account's round icon, as resolved by resolveAccountAppearance. Shared by
// the rail and the settings editor so the preview is exactly what the rail shows.
export default function AccountAvatar({
  appearance,
  className,
}: {
  appearance: AccountAppearance;
  className?: string;
}) {
  const base = `modern-ui-account-avatar${className ? ` ${className}` : ''}`;

  if (appearance.kind === 'lucide' || appearance.kind === 'simple-icons') {
    return (
      <span
        className={`${base} modern-ui-account-avatar--glyph`}
        style={{ backgroundColor: appearance.background, color: appearance.foreground }}
      >
        {appearance.kind === 'lucide' ? (
          <LucideGlyph icon={appearance.icon} className="modern-ui-account-avatar__glyph" />
        ) : (
          <SimpleGlyph icon={appearance.icon} className="modern-ui-account-avatar__glyph" />
        )}
      </span>
    );
  }

  if (appearance.kind === 'provider') {
    return (
      <span
        className={`${base} modern-ui-account-avatar--logo`}
        style={appearance.background ? { backgroundColor: appearance.background } : undefined}
      >
        <RetinaImg
          name={`ic-settings-account-${appearance.provider}.png`}
          fallback="ic-settings-account-imap.png"
          mode={RetinaImg.Mode.ContentPreserve}
          alt=""
        />
      </span>
    );
  }

  return (
    <Avatar
      className={base}
      initials={appearance.initials}
      colors={{ background: appearance.background, foreground: appearance.foreground }}
    />
  );
}
