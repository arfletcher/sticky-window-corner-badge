import Adw from 'gi://Adw';
import Gdk from 'gi://Gdk';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

const ALL_KEYS = [
    'badge-size',
    'badge-spacing',
    'offset-x',
    'offset-y',
    'badge-opacity',
    'sticky-color',
    'sticky-icon',
    'above-color',
    'above-icon',
];

export default class StickyWindowBadgePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();
        const colorUpdaters = [];

        const page = new Adw.PreferencesPage({
            title: 'General',
            icon_name: 'preferences-system-symbolic',
        });
        window.add(page);

        // Group 1: Placement, Size & Transparency
        const layoutGroup = new Adw.PreferencesGroup({
            title: 'Placement, Size and Transparency',
            description: 'Customize icon size, position, spacing, and opacity for window corner badges.',
        });
        page.add(layoutGroup);

        // Badge Icon Size Slider (8px to 48px)
        layoutGroup.add(this._createSliderRow(
            settings,
            'badge-size',
            'Badge Icon Size (px)',
            'Drag to adjust the symbolic icon size inside each badge.',
            8,
            48,
            1,
            4
        ));

        // Opacity Slider (25 to 255)
        layoutGroup.add(this._createSliderRow(
            settings,
            'badge-opacity',
            'Opacity (25–255)',
            'Drag to adjust transparency (255 is fully opaque).',
            25,
            255,
            5,
            25
        ));

        const spacingRow = Adw.SpinRow.new_with_range(0, 50, 1);
        spacingRow.set_title('Badge Spacing (px)');
        spacingRow.set_subtitle('Horizontal gap between the workspace pin and always-on-top badge.');
        settings.bind('badge-spacing', spacingRow, 'value', Gio.SettingsBindFlags.DEFAULT);
        layoutGroup.add(spacingRow);

        const offsetXRow = Adw.SpinRow.new_with_range(0, 300, 1);
        offsetXRow.set_title('Horizontal Offset X (px)');
        offsetXRow.set_subtitle('Distance from the left edge of the window.');
        settings.bind('offset-x', offsetXRow, 'value', Gio.SettingsBindFlags.DEFAULT);
        layoutGroup.add(offsetXRow);

        const offsetYRow = Adw.SpinRow.new_with_range(0, 300, 1);
        offsetYRow.set_title('Vertical Offset Y (px)');
        offsetYRow.set_subtitle('Distance from the top edge of the window.');
        settings.bind('offset-y', offsetYRow, 'value', Gio.SettingsBindFlags.DEFAULT);
        layoutGroup.add(offsetYRow);

        // Group 2: Always on Visible Workspace Badge
        const stickyGroup = new Adw.PreferencesGroup({
            title: 'Always on Visible Workspace Badge',
            description: 'Customize the color and symbolic icon name for sticky windows.',
        });
        page.add(stickyGroup);

        stickyGroup.add(this._createColorRow(settings, 'sticky-color', 'Badge Color', colorUpdaters));
        stickyGroup.add(this._createIconRow(settings, 'sticky-icon', 'Icon Name', 'view-pin-symbolic'));

        // Group 3: Always on Top Badge
        const aboveGroup = new Adw.PreferencesGroup({
            title: 'Always on Top Badge',
            description: 'Customize the color and symbolic icon name for pinned-on-top windows.',
        });
        page.add(aboveGroup);

        aboveGroup.add(this._createColorRow(settings, 'above-color', 'Badge Color', colorUpdaters));
        aboveGroup.add(this._createIconRow(settings, 'above-icon', 'Icon Name', 'go-top-symbolic'));

        // Group 4: Reset to Defaults
        const resetGroup = new Adw.PreferencesGroup();
        page.add(resetGroup);

        const resetButton = new Gtk.Button({
            label: 'Reset to Defaults',
            halign: Gtk.Align.CENTER,
            css_classes: ['destructive-action', 'pill'],
        });

        resetButton.connect('clicked', () => {
            for (const key of ALL_KEYS) {
                settings.reset(key);
            }
            for (const syncColor of colorUpdaters) {
                syncColor();
            }
        });

        resetGroup.add(resetButton);
    }

    _createSliderRow(settings, key, title, subtitle, lower, upper, step, pageStep) {
        const row = new Adw.ActionRow({
            title,
            subtitle,
        });

        const adjustment = new Gtk.Adjustment({
            lower,
            upper,
            step_increment: step,
            page_increment: pageStep,
            value: settings.get_int(key),
        });

        const scale = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            adjustment,
            digits: 0,
            draw_value: true,
            value_pos: Gtk.PositionType.LEFT,
            hexpand: true,
            valign: Gtk.Align.CENTER,
            width_request: 180,
        });

        settings.bind(key, adjustment, 'value', Gio.SettingsBindFlags.DEFAULT);
        row.add_suffix(scale);
        return row;
    }

    _createColorRow(settings, key, title, colorUpdaters) {
        const row = new Adw.ActionRow({title});

        const parseColor = () => {
            const rgba = new Gdk.RGBA();
            if (!rgba.parse(settings.get_string(key))) {
                rgba.parse('rgba(28, 113, 216, 0.92)');
            }
            return rgba;
        };

        const colorButton = new Gtk.ColorDialogButton({
            dialog: new Gtk.ColorDialog({with_alpha: true}),
            rgba: parseColor(),
            valign: Gtk.Align.CENTER,
        });

        colorButton.connect('notify::rgba', () => {
            settings.set_string(key, colorButton.get_rgba().to_string());
        });

        colorUpdaters.push(() => {
            colorButton.set_rgba(parseColor());
        });

        row.add_suffix(colorButton);
        row.set_activatable_widget(colorButton);
        return row;
    }

    _createIconRow(settings, key, title, fallbackIcon) {
        const row = new Adw.EntryRow({title});

        const previewIcon = new Gtk.Image({
            icon_name: settings.get_string(key) || fallbackIcon,
            pixel_size: 16,
        });
        row.add_suffix(previewIcon);

        settings.bind(key, row, 'text', Gio.SettingsBindFlags.DEFAULT);

        row.connect('changed', () => {
            const iconName = row.get_text().trim();
            previewIcon.set_from_icon_name(iconName || fallbackIcon);
        });

        return row;
    }
}
