import { React } from 'mailspring-exports';
import {
  AVATAR_SIZES,
  SETTING_KEYS,
  SettingKey,
  getSetting,
  observeSetting,
  resetSettings,
  setSetting,
} from '../settings';
import { ACCENT_PRESETS } from '../services/accents';
import { notificationActionStatus } from '../services/notification-delete-action';
import { t } from '../i18n';

type Values = { [K in SettingKey]: any };

function readAll(): Values {
  const values = {} as Values;
  for (const key of SETTING_KEYS) {
    values[key] = getSetting(key);
  }
  return values;
}

const fieldId = (key: string) => `modern-ui-setting-${key}`;

// Preferences › Modern UI. Uses the same markup as Mailspring's own tabs
// (section > h6 + .item, see preferences/lib/tabs/config-schema-item.tsx) so it
// picks up the native preferences styling. Values go through AppEnv.config,
// which validates them against the schema and saves them to config.json; the
// plugin applies each change as soon as it is written.
export default class SettingsTab extends React.Component<Record<string, unknown>, Values> {
  static displayName = 'ModernUISettingsTab';

  private subscriptions: Array<{ dispose(): void }> = [];

  constructor(props: Record<string, unknown>) {
    super(props);
    this.state = readAll();
  }

  componentDidMount() {
    // Also catches edits made elsewhere (config.json, another window).
    this.subscriptions = SETTING_KEYS.map((key) =>
      observeSetting(key, (value) => this.setState({ [key]: value } as any))
    );
  }

  componentWillUnmount() {
    this.subscriptions.forEach((s) => s.dispose());
    this.subscriptions = [];
  }

  private renderCheckbox(key: SettingKey, label: string, disabled = false) {
    return (
      <div className={`item${disabled ? ' modern-ui-setting-disabled' : ''}`}>
        <input
          id={fieldId(key)}
          type="checkbox"
          checked={!!this.state[key]}
          disabled={disabled}
          onChange={(e) => setSetting(key, e.target.checked)}
        />
        <label htmlFor={fieldId(key)}>{label}</label>
      </div>
    );
  }

  private renderSelect(
    key: SettingKey,
    label: string,
    options: Array<{ value: string | number; label: string }>,
    disabled = false
  ) {
    const numeric = typeof options[0].value === 'number';
    return (
      <div className={`item${disabled ? ' modern-ui-setting-disabled' : ''}`}>
        <label htmlFor={fieldId(key)} style={{ paddingRight: 8 }}>
          {label}:
        </label>
        <select
          id={fieldId(key)}
          value={this.state[key]}
          disabled={disabled}
          onChange={(e) => setSetting(key, numeric ? Number(e.target.value) : e.target.value)}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  private renderAccentPicker() {
    const current = this.state.accent;
    return (
      <div className="item">
        <div className="modern-ui-setting-label">{t('Accent color')}:</div>
        <div className="modern-ui-accent-swatches" role="radiogroup" aria-label={t('Accent color')}>
          {ACCENT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              role="radio"
              aria-checked={current === preset.id}
              aria-label={t(preset.id)}
              title={t(preset.id)}
              className={`modern-ui-accent-swatch${current === preset.id ? ' is-selected' : ''}`}
              style={{ backgroundColor: preset.color }}
              onClick={() => setSetting('accent', preset.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  render() {
    const railOff = !this.state.accountRail;
    const avatarsOff = !this.state.threadAvatars;
    const notificationsUnavailable = notificationActionStatus() === 'unavailable';

    return (
      <div className="container-modern-ui">
        <p className="modern-ui-settings-intro">
          {t('Settings apply immediately and are saved with your Mailspring preferences.')}{' '}
          {t('When the rail is hidden, this tab stays available in Preferences.')}
        </p>
        <div className="two-columns-flexbox">
          <div style={{ flex: 1 }}>
            <section>
              <h6>{t('Account rail')}</h6>
              {this.renderCheckbox('accountRail', t('Show the account rail'))}
              {this.renderCheckbox('railShowAllAccounts', t('Show the "All Accounts" entry'), railOff)}
              {this.renderCheckbox('railUnreadBadges', t('Show unread badges'), railOff)}
              {this.renderSelect(
                'accountIconStyle',
                t('Account icons'),
                [
                  { value: 'auto', label: t('Automatic (logo, initials when two accounts share a provider)') },
                  { value: 'provider', label: t('Provider logo') },
                  { value: 'initials', label: t('Initials') },
                ],
                railOff
              )}
            </section>
            <section>
              <h6>{t('Message list')}</h6>
              {this.renderCheckbox('threadAvatars', t('Show contact avatars'))}
              {this.renderSelect(
                'avatarSize',
                t('Avatar size'),
                AVATAR_SIZES.map((px) => ({ value: px, label: `${px} px` })),
                avatarsOff
              )}
              {this.renderCheckbox('folderTitle', t('Show the folder title above the list'))}
            </section>
          </div>
          <div style={{ width: 30 }} />
          <div style={{ flex: 1 }}>
            <section>
              <h6>{t('Appearance')}</h6>
              {this.renderCheckbox('darkChrome', t('Dark toolbar and sidebar'))}
              {this.renderCheckbox('lightContent', t('Modern UI colors for the list and the reader'))}
              {this.renderAccentPicker()}
            </section>
            <section>
              <h6>{t('Notifications')}</h6>
              {this.renderSelect(
                'notificationAction',
                t('Second button of new mail notifications'),
                [
                  { value: 'trash', label: t('Delete (move to Trash)') },
                  { value: 'archive', label: t('Archive (Mailspring default)') },
                ],
                notificationsUnavailable
              )}
              {notificationsUnavailable ? (
                <div className="platform-note">
                  {t(
                    'This Mailspring version does not allow changing it; notifications keep the Archive button.'
                  )}
                </div>
              ) : null}
            </section>
            <section>
              <button type="button" className="btn" onClick={resetSettings}>
                {t('Restore defaults')}
              </button>
            </section>
          </div>
        </div>
      </div>
    );
  }
}
