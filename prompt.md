Create a complete, production-ready GNOME Shell extension named "Sticky Window Corner Badge" (UUID: `sticky-window-corner-badge@local`) compatible with GNOME Shell 45, 46, 47, 48, 49, 50, and 51 using modern ES Modules (`import ... from`).

### Overview & Behavior
1. **Floating Window Badges:** For every tracked `Meta.Window`, create a horizontal `St.BoxLayout` container holding two clickable `St.Button` badges with `St.Icon` children:
   - **Always on Visible Workspace Badge (Left):** Visible only when `metaWindow.is_on_all_workspaces()` is `true`. Clicking it calls `metaWindow.unstick()` (or `stick()`). Default icon: `view-pin-symbolic`. Default background color: `rgba(28, 113, 216, 0.92)`.
   - **Always on Top Badge (Right):** Visible only when `metaWindow.above` is `true`. Clicking it calls `metaWindow.unmake_above()` (or `make_above()`). Default icon: `go-top-symbolic`. Default background color: `rgba(38, 162, 105, 0.92)`.
2. **Positioning & Visibility:**
   - Position the `St.BoxLayout` at `frameRect.x + offsetX` and `frameRect.y + offsetY` using `metaWindow.get_frame_rect()`.
   - Hide the container when neither state is active, when `metaWindow.minimized` is `true`, or when `Main.overview.visible` is `true`.
   - Connect to `notify::on-all-workspaces`, `notify::above`, `notify::minimized`, `position-changed`, `size-changed`, `unmanaged`, `global.display` (`window-created`, `restacked`), `global.workspace_manager` (`active-workspace-changed`), and `Main.overview` (`showing`, `hidden`). Disconnect all signals cleanly in `disable()`.
3. **Window-Aware Z-Order Stacking:**
   - Add the badge container to `global.window_group` (NOT `Main.layoutManager.uiGroup`) so badges never float over unrelated windows stacked above the target window.
   - Sync stacking order on updates and `restacked` events using `global.window_group.set_child_above_sibling(container, windowActor)`.

### GSettings Schema (`schemas/org.gnome.shell.extensions.sticky-window-corner-badge.gschema.xml`)
Use schema ID `org.gnome.shell.extensions.sticky-window-corner-badge` and path `/org/gnome/shell/extensions/sticky-window-corner-badge/` with these 9 keys:
- `badge-size` (`i`, default `14`): Icon size in pixels.
- `badge-spacing` (`i`, default `6`): Horizontal spacing in pixels between badges.
- `offset-x` (`i`, default `8`): Horizontal offset from the window's top-left corner.
- `offset-y` (`i`, default `8`): Vertical offset from the window's top-left corner.
- `badge-opacity` (`i`, default `255`): Container opacity (`25` to `255`).
- `sticky-color` (`s`, default `'rgba(28, 113, 216, 0.92)'`): Background color for the workspace pin badge.
- `sticky-icon` (`s`, default `'view-pin-symbolic'`): Symbolic icon name for the workspace pin badge.
- `above-color` (`s`, default `'rgba(38, 162, 105, 0.92)'`): Background color for the always-on-top badge.
- `above-icon` (`s`, default `'go-top-symbolic'`): Symbolic icon name for the always-on-top badge.

### Preferences Window (`prefs.js`)
Build a GTK4 / Libadwaita (`Adw`) preferences window using `ExtensionPreferences`:
- **Placement, Size and Transparency Group:**
  - `Gtk.Scale` sliders inside `Adw.ActionRow` for **Badge Icon Size (px)** (`8`–`48`, step `1`) and **Opacity (25–255)** (`25`–`255`, step `5`) with `draw_value: true`.
  - `Adw.SpinRow.new_with_range()` controls for **Badge Spacing (px)** (`0`–`50`), **Horizontal Offset X (px)** (`0`–`300`), and **Vertical Offset Y (px)** (`0`–`300`).
- **Always on Visible Workspace Badge & Always on Top Badge Groups:**
  - `Gtk.ColorDialogButton` (with `with_alpha: true`) inside an `Adw.ActionRow` for each badge's color.
  - `Adw.EntryRow` with a live `Gtk.Image` suffix preview for each badge's symbolic icon name.
- **Reset to Defaults:**
  - A centered pill button (`destructive-action`, `pill`) at the bottom that calls `settings.reset(key)` on all 9 keys and refreshes the `Gtk.ColorDialogButton` RGBA states.
- Avoid unescaped `&` characters in `Adw` titles/subtitles so Pango markup never throws parsing warnings.

### Deliverables
Provide complete, copy-pasteable contents for:
1. `metadata.json`
2. `schemas/org.gnome.shell.extensions.sticky-window-corner-badge.gschema.xml`
3. `stylesheet.css` (pill-shaped badges with `border-radius: 99px`, `padding: 5px`, subtle border, box-shadow, and hover transitions)
4. `extension.js`
5. `prefs.js`
6. `README.md` (with `glib-compile-schemas` and `gnome-extensions pack` commands)
