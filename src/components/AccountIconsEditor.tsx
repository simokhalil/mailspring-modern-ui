import { React, Account, AccountStore } from 'mailspring-exports';
import AccountAvatar from './AccountAvatar';
import { LucideGlyph, SimpleGlyph } from './IconGlyph';
import {
  AccountIconChoice,
  AccountIconMap,
  BACKGROUND_PRESETS,
  IconSource,
  normalizeAccountIcons,
  resolveAccountAppearance,
  searchIcons,
  withAccountChoice,
} from '../services/account-icons';
import { getSetting, observeSetting, setSetting } from '../settings';
import { t } from '../i18n';

interface EditorState {
  accounts: Account[];
  icons: AccountIconMap;
  selectedId: string | null;
  query: string;
}

// Preferences › Modern UI › Account icons. Picks an icon (bundled Lucide and
// Simple Icons sets) and a background color per account. Every click writes
// the `accountIcons` setting, which the rail observes, so the rail updates
// while the user is still choosing.
export default class AccountIconsEditor extends React.Component<Record<string, unknown>, EditorState> {
  static displayName = 'ModernUIAccountIconsEditor';

  private unlisten: (() => void) | null = null;
  private subscription: { dispose(): void } | null = null;

  constructor(props: Record<string, unknown>) {
    super(props);
    const accounts = AccountStore.accounts();
    this.state = {
      accounts,
      icons: normalizeAccountIcons(getSetting('accountIcons')),
      selectedId: accounts.length ? accounts[0].id : null,
      query: '',
    };
  }

  componentDidMount() {
    // Accounts added or removed while the tab is open.
    this.unlisten = AccountStore.listen(() => {
      const accounts = AccountStore.accounts();
      this.setState((state) => ({
        accounts,
        selectedId: accounts.some((a) => a.id === state.selectedId)
          ? state.selectedId
          : accounts.length
            ? accounts[0].id
            : null,
      }));
    });
    this.subscription = observeSetting('accountIcons', (value) =>
      this.setState({ icons: normalizeAccountIcons(value) })
    );
  }

  componentWillUnmount() {
    if (this.unlisten) this.unlisten();
    if (this.subscription) this.subscription.dispose();
  }

  private selected(): Account | null {
    return this.state.accounts.find((a) => a.id === this.state.selectedId) || null;
  }

  private save(choice: AccountIconChoice | null) {
    const account = this.selected();
    if (!account) return;
    const next = withAccountChoice(
      this.state.icons,
      account.id,
      choice,
      this.state.accounts.map((a) => a.id)
    );
    this.setState({ icons: next });
    setSetting('accountIcons', next);
  }

  private chooseIcon(source: IconSource, icon: string) {
    const current = this.state.icons[this.state.selectedId] || {};
    this.save({ ...current, source, icon });
  }

  private chooseColor(color: string | null) {
    const current = { ...(this.state.icons[this.state.selectedId] || {}) };
    if (color) {
      current.backgroundColor = color;
    } else {
      delete current.backgroundColor;
    }
    this.save(current);
  }

  private renderAccounts() {
    const { accounts, icons, selectedId } = this.state;
    return (
      <div className="modern-ui-icon-editor__accounts" role="listbox" aria-label={t('Accounts')}>
        {accounts.map((account) => (
          <button
            key={account.id}
            type="button"
            role="option"
            aria-selected={account.id === selectedId}
            className={`modern-ui-icon-editor__account${account.id === selectedId ? ' is-selected' : ''}`}
            onClick={() => this.setState({ selectedId: account.id })}
          >
            <AccountAvatar
              className="modern-ui-icon-editor__account-avatar"
              appearance={resolveAccountAppearance(account, icons[account.id])}
            />
            <span className="modern-ui-icon-editor__account-text">
              <span className="modern-ui-icon-editor__account-label">{account.label || account.emailAddress}</span>
              {account.label !== account.emailAddress ? (
                <span className="modern-ui-icon-editor__account-email">{account.emailAddress}</span>
              ) : null}
            </span>
          </button>
        ))}
      </div>
    );
  }

  private renderColors(choice: AccountIconChoice) {
    const current = choice.backgroundColor || null;
    return (
      <div className="modern-ui-icon-editor__colors" role="radiogroup" aria-label={t('Background color')}>
        <button
          type="button"
          role="radio"
          aria-checked={!current}
          title={t('Automatic')}
          className={`modern-ui-color-swatch modern-ui-color-swatch--auto${!current ? ' is-selected' : ''}`}
          onClick={() => this.chooseColor(null)}
        >
          A
        </button>
        {BACKGROUND_PRESETS.map((color) => (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={current === color}
            title={color}
            className={`modern-ui-color-swatch${current === color ? ' is-selected' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => this.chooseColor(color)}
          />
        ))}
      </div>
    );
  }

  private renderGrids(choice: AccountIconChoice) {
    const { lucide, simple } = searchIcons(this.state.query);
    const tile = (source: IconSource, id: string, label: string, glyph: any) => {
      const selected = choice.source === source && choice.icon === id;
      return (
        <button
          key={`${source}:${id}`}
          type="button"
          title={label}
          aria-label={label}
          aria-pressed={selected}
          className={`modern-ui-icon-tile${selected ? ' is-selected' : ''}`}
          onClick={() => this.chooseIcon(source, id)}
        >
          {glyph}
        </button>
      );
    };

    if (lucide.length === 0 && simple.length === 0) {
      return <div className="modern-ui-icon-editor__empty">{t('No icon matches this search.')}</div>;
    }
    return (
      <div className="modern-ui-icon-editor__grids">
        {lucide.length ? (
          <div className="modern-ui-icon-editor__group">
            <div className="modern-ui-icon-editor__group-title">{t('Icons')} · Lucide</div>
            <div className="modern-ui-icon-grid">
              {lucide.map((icon) =>
                tile('lucide', icon.id, icon.label, <LucideGlyph icon={icon} className="modern-ui-icon-tile__glyph" />)
              )}
            </div>
          </div>
        ) : null}
        {simple.length ? (
          <div className="modern-ui-icon-editor__group">
            <div className="modern-ui-icon-editor__group-title">{t('Brands')} · Simple Icons</div>
            <div className="modern-ui-icon-grid">
              {simple.map((icon) =>
                tile(
                  'simple-icons',
                  icon.id,
                  icon.label,
                  <SimpleGlyph icon={icon} className="modern-ui-icon-tile__glyph" />
                )
              )}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  render() {
    const account = this.selected();
    if (!account) {
      return null;
    }
    const choice = this.state.icons[account.id] || {};
    const customized = !!(choice.icon || choice.backgroundColor);

    return (
      <div className="modern-ui-icon-editor">
        {this.renderAccounts()}
        <div className="modern-ui-icon-editor__panel">
          <div className="modern-ui-icon-editor__preview">
            <span className="modern-ui-icon-editor__preview-rail">
              <AccountAvatar
                className="modern-ui-icon-editor__preview-avatar"
                appearance={resolveAccountAppearance(account, choice)}
              />
            </span>
            <span className="modern-ui-icon-editor__preview-text">
              <span className="modern-ui-icon-editor__account-label">{account.label || account.emailAddress}</span>
              <span className="modern-ui-icon-editor__account-email">
                {customized ? t('Custom icon') : t('Automatic icon (provider logo, else initials)')}
              </span>
            </span>
            <button
              type="button"
              className="btn modern-ui-icon-editor__reset"
              disabled={!customized}
              onClick={() => this.save(null)}
            >
              {t('Reset')}
            </button>
          </div>

          <div className="modern-ui-icon-editor__label">{t('Background color')}</div>
          {this.renderColors(choice)}

          <input
            type="search"
            className="modern-ui-icon-editor__search"
            placeholder={t('Search icons…')}
            aria-label={t('Search icons…')}
            value={this.state.query}
            onChange={(e) => this.setState({ query: e.target.value })}
          />
          {this.renderGrids(choice)}
          <p className="modern-ui-icon-editor__credits">
            {t('Icons: Lucide (ISC license) and Simple Icons (CC0). Logos are trademarks of their owners.')}
          </p>
        </div>
      </div>
    );
  }
}
