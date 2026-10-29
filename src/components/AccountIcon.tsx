import { React, Account } from 'mailspring-exports';
import { RetinaImg } from 'mailspring-component-kit';
import Avatar from './Avatar';
import RailTooltip from './RailTooltip';
import { initialsFor, sanitizeCssColor, strongColorsFor } from '../services/identity';

const TOOLTIP_DELAY_MS = 350;
let nextTooltipId = 0;

// Providers whose logo ships inside Mailspring (static/images/preferences/
// ic-settings-account-<provider>@2x.png). "imap" only has a generic icon, so
// generic IMAP accounts use initials.
const PROVIDER_LOGOS = new Set([
  'gmail',
  'office365',
  'outlook',
  'yahoo',
  'icloud',
  'fastmail',
  'gmx',
  'yandex',
  'eas',
]);

export type AccountIconStyle = 'auto' | 'provider' | 'initials';

interface AccountIconProps {
  // null renders the "All accounts" entry.
  account: Account | null;
  selected: boolean;
  unread: number;
  label: string;
  description?: string | null;
  // Whether another account uses the same provider. In "auto" mode, two Gmail
  // accounts would otherwise get the same logo.
  providerShared: boolean;
  iconStyle: AccountIconStyle;
  onSelect: (account: Account | null) => void;
  onContextMenu: (account: Account | null) => void;
}

interface AccountIconState {
  tooltipAt: { left: number; top: number } | null;
}

function accountInitials(account: Account) {
  const label = (account.label || '').trim();
  // A custom label ("Work", "Perso") identifies the account better than the
  // owner's name, which is usually the same for all of them.
  if (label && !label.includes('@')) {
    return initialsFor(label, account.emailAddress);
  }
  return initialsFor(null, account.emailAddress);
}

function AllAccountsGlyph() {
  return (
    <svg className="modern-ui-account-icon__glyph" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M3 11.5 5.2 5.3A1.5 1.5 0 0 1 6.6 4.3h6.8a1.5 1.5 0 0 1 1.4 1l2.2 6.2v3.7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 15.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M3.4 11.5h3.9l1 1.7h3.4l1-1.7h3.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default class AccountIcon extends React.PureComponent<AccountIconProps, AccountIconState> {
  static displayName = 'ModernUIAccountIcon';

  state: AccountIconState = { tooltipAt: null };

  private button = React.createRef<HTMLButtonElement>();
  private tooltipTimer: ReturnType<typeof setTimeout> | null = null;
  private tooltipId = `modern-ui-rail-tooltip-${nextTooltipId++}`;

  componentWillUnmount() {
    if (this.tooltipTimer) {
      clearTimeout(this.tooltipTimer);
    }
  }

  private showTooltipSoon = () => {
    if (this.tooltipTimer || this.state.tooltipAt) {
      return;
    }
    this.tooltipTimer = setTimeout(() => {
      this.tooltipTimer = null;
      const el = this.button.current;
      if (!el || !el.isConnected) {
        return;
      }
      const rect = el.getBoundingClientRect();
      this.setState({ tooltipAt: { left: rect.right + 10, top: rect.top + rect.height / 2 } });
    }, TOOLTIP_DELAY_MS);
  };

  private hideTooltip = () => {
    if (this.tooltipTimer) {
      clearTimeout(this.tooltipTimer);
      this.tooltipTimer = null;
    }
    if (this.state.tooltipAt) {
      this.setState({ tooltipAt: null });
    }
  };

  private onClick = () => {
    this.hideTooltip();
    this.props.onSelect(this.props.account);
  };

  private onContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    this.hideTooltip();
    this.props.onContextMenu(this.props.account);
  };

  private renderVisual() {
    const { account, iconStyle, providerShared } = this.props;
    if (!account) {
      return (
        <span className="modern-ui-account-icon__visual modern-ui-account-icon__visual--all">
          <AllAccountsGlyph />
        </span>
      );
    }

    // Account has no picture of its own in Mailspring's model, so the order is:
    // the provider logo bundled with Mailspring, then initials.
    const hasLogo = PROVIDER_LOGOS.has(account.provider);
    const useLogo =
      hasLogo && (iconStyle === 'provider' || (iconStyle === 'auto' && !providerShared));
    if (useLogo) {
      return (
        <span className="modern-ui-account-icon__visual modern-ui-account-icon__visual--logo">
          <RetinaImg
            name={`ic-settings-account-${account.provider}.png`}
            fallback="ic-settings-account-imap.png"
            mode={RetinaImg.Mode.ContentPreserve}
            alt=""
          />
        </span>
      );
    }

    const colors = strongColorsFor((account.emailAddress || account.id || '').toLowerCase());
    // Respect the color picked for the account in Preferences > Accounts.
    const custom = sanitizeCssColor(account.color);
    return (
      <Avatar
        className="modern-ui-account-icon__visual"
        initials={accountInitials(account)}
        colors={custom ? { background: custom, foreground: '#FFFFFF' } : colors}
      />
    );
  }

  render() {
    const { selected, unread, label, description } = this.props;
    const { tooltipAt } = this.state;
    const badge = unread > 0 ? (unread > 99 ? '99+' : `${unread}`) : null;

    return (
      <button
        ref={this.button}
        type="button"
        className={`modern-ui-account-icon${selected ? ' is-selected' : ''}`}
        aria-label={badge ? `${label} (${unread})` : label}
        aria-current={selected ? 'page' : undefined}
        aria-describedby={tooltipAt ? this.tooltipId : undefined}
        onClick={this.onClick}
        onContextMenu={this.onContextMenu}
        onMouseEnter={this.showTooltipSoon}
        onMouseLeave={this.hideTooltip}
        onFocus={this.showTooltipSoon}
        onBlur={this.hideTooltip}
      >
        <span className="modern-ui-account-icon__indicator" aria-hidden="true" />
        {this.renderVisual()}
        {badge ? (
          <span className="modern-ui-account-icon__badge" aria-hidden="true">
            {badge}
          </span>
        ) : null}
        <RailTooltip id={this.tooltipId} anchor={tooltipAt} title={label} description={description} />
      </button>
    );
  }
}
