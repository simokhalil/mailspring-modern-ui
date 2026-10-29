import { React } from 'mailspring-exports';
import { IdentityColors } from '../services/identity';

interface AvatarProps {
  initials: string;
  colors: IdentityColors;
  photo?: string | null;
  className?: string;
  title?: string;
}

// A circle showing a photo when one is available, else initials on a color.
// Sized by the stylesheet, so the same component fits every layout.
export default function Avatar({ initials, colors, photo, className, title }: AvatarProps) {
  const classes = `modern-ui-avatar${photo ? ' modern-ui-avatar--photo' : ''}${
    className ? ` ${className}` : ''
  }`;
  if (photo) {
    return (
      <span className={classes} title={title} aria-hidden="true">
        <img src={photo} alt="" draggable={false} />
      </span>
    );
  }
  return (
    <span
      className={classes}
      title={title}
      aria-hidden="true"
      style={{ backgroundColor: colors.background, color: colors.foreground }}
    >
      {initials}
    </span>
  );
}
