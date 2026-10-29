import { React, Account } from 'mailspring-exports';
import AccountAvatar from './AccountAvatar';
import RailTooltip from './RailTooltip';
import { AccountIconChoice, resolveAccountAppearance } from '../services/account-icons';

const TOOLTIP_DELAY_MS = 350;
let nextTooltipId = 0;

interface AccountIconProps {
  // null renders the "All accounts" entry.
  account: Account | null;
  selected: boolean;
  unread: number;
  label: string;
  description?: string | null;
  // The account's entry in the `accountIcons` setting, if any.
  choice?: AccountIconChoice | null;
  onSelect: (account: Account | null) => void;
  onContextMenu: (account: Account | null) => void;
}

interface AccountIconState {
  tooltipAt: { left: number; top: number } | null;
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
    const { account, choice } = this.props;
    if (!account) {
      return (
        <span className="modern-ui-account-icon__visual modern-ui-account-icon__visual--all">
          <AllAccountsGlyph />
        </span>
      );
    }
    return (
      <AccountAvatar
        className="modern-ui-account-icon__visual"
        appearance={resolveAccountAppearance(account, choice)}
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
