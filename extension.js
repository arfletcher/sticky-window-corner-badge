import St from 'gi://St';
import Meta from 'gi://Meta';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

export default class StickyWindowBadgeExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._trackedWindows = new Map();

        for (const actor of global.get_window_actors()) {
            this._trackActor(actor);
        }

        this._windowCreatedId = global.display.connect('window-created', (_display, metaWindow) => {
            const actor = metaWindow.get_compositor_private();
            if (actor) {
                this._trackActor(actor);
            }
        });

        this._workspaceChangedId = global.workspace_manager.connect('active-workspace-changed', () => {
            this._updateAllBadges();
        });

        this._restackedId = global.display.connect('restacked', () => {
            this._syncAllStacking();
        });

        this._settingsChangedId = this._settings.connect('changed', () => {
            this._updateAllBadges();
        });
    }

    disable() {
        if (this._windowCreatedId) {
            global.display.disconnect(this._windowCreatedId);
            this._windowCreatedId = null;
        }
        if (this._workspaceChangedId) {
            global.workspace_manager.disconnect(this._workspaceChangedId);
            this._workspaceChangedId = null;
        }
        if (this._restackedId) {
            global.display.disconnect(this._restackedId);
            this._restackedId = null;
        }
        if (this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
            this._settingsChangedId = null;
        }

        for (const [metaWindow, data] of this._trackedWindows.entries()) {
            this._untrackWindow(metaWindow, data);
        }
        this._trackedWindows.clear();
        this._settings = null;
    }

    _updateAllBadges() {
        for (const data of this._trackedWindows.values()) {
            data.updateBadges();
        }
    }

    _syncAllStacking() {
        for (const data of this._trackedWindows.values()) {
            data.syncStacking();
        }
    }

    _trackActor(actor) {
        const metaWindow = actor.get_meta_window();
        if (!metaWindow || this._trackedWindows.has(metaWindow)) {
            return;
        }

        // Skip popup, menu, and other ephemeral window types
        const windowType = metaWindow.window_type;
        if (windowType === Meta.WindowType.POPUP_MENU ||
            windowType === Meta.WindowType.DROPDOWN_MENU ||
            windowType === Meta.WindowType.MENU ||
            windowType === Meta.WindowType.TOOLTIP ||
            windowType === Meta.WindowType.NOTIFICATION ||
            windowType === Meta.WindowType.SPLASHSCREEN) {
            return;
        }

        const initialSize = this._settings.get_int('badge-size');

        const container = new St.BoxLayout({
            style_class: 'window-badges-box',
            reactive: false,
        });

        // 1. Always on Visible Workspace Badge
        const stickyIcon = new St.Icon({
            icon_name: this._settings.get_string('sticky-icon') || 'view-pin-symbolic',
            icon_size: initialSize,
        });

        const stickyBadge = new St.Button({
            child: stickyIcon,
            style_class: 'sticky-window-badge',
            reactive: true,
            can_focus: false,
            track_hover: true,
        });

        stickyBadge.connect('clicked', () => {
            if (metaWindow.is_on_all_workspaces()) {
                metaWindow.unstick();
            } else {
                metaWindow.stick();
            }
        });

        // 2. Always on Top Badge
        const aboveIcon = new St.Icon({
            icon_name: this._settings.get_string('above-icon') || 'go-top-symbolic',
            icon_size: initialSize,
        });

        const aboveBadge = new St.Button({
            child: aboveIcon,
            style_class: 'above-window-badge',
            reactive: true,
            can_focus: false,
            track_hover: true,
        });

        aboveBadge.connect('clicked', () => {
            if (metaWindow.above) {
                metaWindow.unmake_above();
            } else {
                metaWindow.make_above();
            }
        });

        container.add_child(stickyBadge);
        container.add_child(aboveBadge);
        global.window_group.add_child(container);

        const syncStacking = () => {
            if (container.get_parent() === global.window_group && actor.get_parent() === global.window_group) {
                global.window_group.set_child_above_sibling(container, actor);
            }
        };

        const updateBadges = () => {
            const isSticky = metaWindow.is_on_all_workspaces();
            const isAbove = metaWindow.above;
            const canShow = !metaWindow.minimized && !Main.overview.visible;

            stickyBadge.visible = isSticky;
            aboveBadge.visible = isAbove;

            const anyVisible = canShow && (isSticky || isAbove);
            container.visible = anyVisible;

            if (anyVisible) {
                const iconSize = this._settings.get_int('badge-size');
                const spacing = this._settings.get_int('badge-spacing');
                const offsetX = this._settings.get_int('offset-x');
                const offsetY = this._settings.get_int('offset-y');
                const opacity = this._settings.get_int('badge-opacity');

                const stickyColor = this._settings.get_string('sticky-color');
                const stickyIconName = this._settings.get_string('sticky-icon').trim() || 'view-pin-symbolic';
                const aboveColor = this._settings.get_string('above-color');
                const aboveIconName = this._settings.get_string('above-icon').trim() || 'go-top-symbolic';

                stickyIcon.icon_name = stickyIconName;
                stickyIcon.icon_size = iconSize;
                stickyBadge.set_style(`background-color: ${stickyColor};`);

                aboveIcon.icon_name = aboveIconName;
                aboveIcon.icon_size = iconSize;
                aboveBadge.set_style(`background-color: ${aboveColor};`);

                container.set_style(`spacing: ${spacing}px;`);
                container.opacity = opacity;

                const frameRect = metaWindow.get_frame_rect();
                container.set_position(frameRect.x + offsetX, frameRect.y + offsetY);
                syncStacking();
            }
        };

        const signals = [
            metaWindow.connect('notify::on-all-workspaces', updateBadges),
            metaWindow.connect('notify::above', updateBadges),
            metaWindow.connect('notify::minimized', updateBadges),
            metaWindow.connect('position-changed', updateBadges),
            metaWindow.connect('size-changed', updateBadges),
        ];

        const overviewShowingId = Main.overview.connect('showing', updateBadges);
        const overviewHiddenId = Main.overview.connect('hidden', updateBadges);

        const unmanagedSignalId = metaWindow.connect('unmanaged', () => {
            const data = this._trackedWindows.get(metaWindow);
            if (data) {
                this._untrackWindow(metaWindow, data);
                this._trackedWindows.delete(metaWindow);
            }
        });

        this._trackedWindows.set(metaWindow, {
            container,
            signals,
            overviewShowingId,
            overviewHiddenId,
            unmanagedSignalId,
            updateBadges,
            syncStacking,
        });

        updateBadges();
    }

    _untrackWindow(metaWindow, data) {
        for (const id of data.signals) {
            metaWindow.disconnect(id);
        }
        Main.overview.disconnect(data.overviewShowingId);
        Main.overview.disconnect(data.overviewHiddenId);
        metaWindow.disconnect(data.unmanagedSignalId);
        if (data.container) {
            data.container.destroy();
        }
    }
}
