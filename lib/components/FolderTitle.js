"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_exports_1 = require("mailspring-exports");
const folder_title_1 = require("../services/folder-title");
function currentTitle() {
    return (0, folder_title_1.folderTitleFor)(mailspring_exports_1.FocusedPerspectiveStore.current(), {
        accounts: mailspring_exports_1.AccountStore.accounts(),
        localized: mailspring_exports_1.localized,
        localizedRoles: (mailspring_exports_1.Category && mailspring_exports_1.Category.LocalizedStringForRole) || {},
    });
}
// Heading at the top of the thread list column ("Inbox", "Sent Mail", a custom
// folder's name, "Search Results"...). Registered in the ThreadList location,
// whose components Mailspring stacks vertically; `order: -1` in the stylesheet
// puts it above the list.
class FolderTitle extends mailspring_exports_1.React.Component {
    constructor(props) {
        super(props);
        this.unlisteners = [];
        this.onChange = () => {
            this.setState(currentTitle());
        };
        this.state = currentTitle();
    }
    componentDidMount() {
        this.unlisteners = [
            mailspring_exports_1.FocusedPerspectiveStore.listen(this.onChange),
            // Account labels can be renamed in Preferences.
            mailspring_exports_1.AccountStore.listen(this.onChange),
        ];
    }
    componentWillUnmount() {
        this.unlisteners.forEach((unlisten) => unlisten());
        this.unlisteners = [];
    }
    shouldComponentUpdate(_props, next) {
        return next.title !== this.state.title || next.subtitle !== this.state.subtitle;
    }
    render() {
        const { title, subtitle } = this.state;
        if (!title) {
            return null;
        }
        return (mailspring_exports_1.React.createElement("header", { className: "modern-ui-folder-title" },
            mailspring_exports_1.React.createElement("h1", { className: "modern-ui-folder-title__name", dir: "auto", title: title }, title),
            subtitle ? (mailspring_exports_1.React.createElement("div", { className: "modern-ui-folder-title__subtitle", dir: "auto", title: subtitle }, subtitle)) : null));
    }
}
FolderTitle.displayName = 'ModernUIFolderTitle';
FolderTitle.containerRequired = false;
exports.default = FolderTitle;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRm9sZGVyVGl0bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy9Gb2xkZXJUaXRsZS50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyREFNNEI7QUFDNUIsMkRBQTJGO0FBRTNGLFNBQVMsWUFBWTtJQUNuQixPQUFPLElBQUEsNkJBQWMsRUFBQyw0Q0FBdUIsQ0FBQyxPQUFPLEVBQUUsRUFBRTtRQUN2RCxRQUFRLEVBQUUsaUNBQVksQ0FBQyxRQUFRLEVBQUU7UUFDakMsU0FBUyxFQUFULDhCQUFTO1FBQ1QsY0FBYyxFQUFFLENBQUMsNkJBQVEsSUFBSSw2QkFBUSxDQUFDLHNCQUFzQixDQUFDLElBQUksRUFBRTtLQUNwRSxDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQsK0VBQStFO0FBQy9FLDhFQUE4RTtBQUM5RSwrRUFBK0U7QUFDL0UsMEJBQTBCO0FBQzFCLE1BQXFCLFdBQVksU0FBUSwwQkFBSyxDQUFDLFNBQW9EO0lBTWpHLFlBQVksS0FBOEI7UUFDeEMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBSFAsZ0JBQVcsR0FBc0IsRUFBRSxDQUFDO1FBd0JwQyxhQUFRLEdBQUcsR0FBRyxFQUFFO1lBQ3RCLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztRQUNoQyxDQUFDLENBQUM7UUF0QkEsSUFBSSxDQUFDLEtBQUssR0FBRyxZQUFZLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBRUQsaUJBQWlCO1FBQ2YsSUFBSSxDQUFDLFdBQVcsR0FBRztZQUNqQiw0Q0FBdUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUM3QyxnREFBZ0Q7WUFDaEQsaUNBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztTQUNuQyxDQUFDO0lBQ0osQ0FBQztJQUVELG9CQUFvQjtRQUNsQixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBRUQscUJBQXFCLENBQUMsTUFBK0IsRUFBRSxJQUFzQjtRQUMzRSxPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztJQUNsRixDQUFDO0lBTUQsTUFBTTtRQUNKLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN2QyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDWCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFDRCxPQUFPLENBQ0wscURBQVEsU0FBUyxFQUFDLHdCQUF3QjtZQUN4QyxpREFBSSxTQUFTLEVBQUMsOEJBQThCLEVBQUMsR0FBRyxFQUFDLE1BQU0sRUFBQyxLQUFLLEVBQUUsS0FBSyxJQUNqRSxLQUFLLENBQ0g7WUFDSixRQUFRLENBQUMsQ0FBQyxDQUFDLENBQ1Ysa0RBQUssU0FBUyxFQUFDLGtDQUFrQyxFQUFDLEdBQUcsRUFBQyxNQUFNLEVBQUMsS0FBSyxFQUFFLFFBQVEsSUFDekUsUUFBUSxDQUNMLENBQ1AsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUNELENBQ1YsQ0FBQztJQUNKLENBQUM7O0FBaERNLHVCQUFXLEdBQUcscUJBQXFCLEFBQXhCLENBQXlCO0FBQ3BDLDZCQUFpQixHQUFHLEtBQUssQUFBUixDQUFTO2tCQUZkLFdBQVcifQ==