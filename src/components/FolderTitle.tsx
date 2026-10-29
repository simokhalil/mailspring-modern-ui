import {
  React,
  localized,
  AccountStore,
  Category,
  FocusedPerspectiveStore,
} from 'mailspring-exports';
import { folderTitleFor, FolderTitle as FolderTitleValue } from '../services/folder-title';

function currentTitle(): FolderTitleValue {
  return folderTitleFor(FocusedPerspectiveStore.current(), {
    accounts: AccountStore.accounts(),
    localized,
    localizedRoles: (Category && Category.LocalizedStringForRole) || {},
  });
}

// Heading at the top of the thread list column ("Inbox", "Sent Mail", a custom
// folder's name, "Search Results"...). Registered in the ThreadList location,
// whose components Mailspring stacks vertically; `order: -1` in the stylesheet
// puts it above the list.
export default class FolderTitle extends React.Component<Record<string, unknown>, FolderTitleValue> {
  static displayName = 'ModernUIFolderTitle';
  static containerRequired = false;

  private unlisteners: Array<() => void> = [];

  constructor(props: Record<string, unknown>) {
    super(props);
    this.state = currentTitle();
  }

  componentDidMount() {
    this.unlisteners = [
      FocusedPerspectiveStore.listen(this.onChange),
      // Account labels can be renamed in Preferences.
      AccountStore.listen(this.onChange),
    ];
  }

  componentWillUnmount() {
    this.unlisteners.forEach((unlisten) => unlisten());
    this.unlisteners = [];
  }

  shouldComponentUpdate(_props: Record<string, unknown>, next: FolderTitleValue) {
    return next.title !== this.state.title || next.subtitle !== this.state.subtitle;
  }

  private onChange = () => {
    this.setState(currentTitle());
  };

  render() {
    const { title, subtitle } = this.state;
    if (!title) {
      return null;
    }
    return (
      <header className="modern-ui-folder-title">
        <h1 className="modern-ui-folder-title__name" dir="auto" title={title}>
          {title}
        </h1>
        {subtitle ? (
          <div className="modern-ui-folder-title__subtitle" dir="auto" title={subtitle}>
            {subtitle}
          </div>
        ) : null}
      </header>
    );
  }
}
