# Sticky Window Corner Badge

A lightweight GNOME Shell extension that displays clickable floating status badges in the top-left corner of windows set to **Always on Visible Workspace** or **Always on Top**.

## Features

* **Visual Window Indicators:** Displays a pushpin badge when a window is pinned across all workspaces (`Always on Visible Workspace`) and an upward arrow badge when pinned above other windows (`Always on Top`).
* **One-Click Toggling:** Click either floating badge directly on the window corner to toggle that state off without opening the window menu.
* **Window-Aware Stacking:** Badges attach to the window layer (`global.window_group`) and stay synced with each window's z-order, hiding cleanly underneath overlapping windows and during the Activities Overview.
* **Live Customization:** Adjust badge icon size, opacity, spacing, X/Y corner offsets, background colors, and symbolic icons in real time via the built-in preferences dialog.

## Compatibility

Supports **GNOME Shell 45, 46, 47, 48, 49, 50, and 51**.

## Installation

### From Bundle (`.zip`)
```bash
gnome-extensions install --force sticky-window-corner-badge@local.shell-extension.zip
```
Log out and log back in, then enable the extension:
```bash
gnome-extensions enable sticky-window-corner-badge@local
```

### Manual Installation from Source
1. Copy the extension folder to your local GNOME Shell extensions directory:
   ```bash
   mkdir -p ~/.local/share/gnome-shell/extensions/sticky-window-corner-badge@local
   cp -r metadata.json extension.js prefs.js stylesheet.css schemas/ ~/.local/share/gnome-shell/extensions/sticky-window-corner-badge@local/
   ```
2. Compile the GSettings schema:
   ```bash
   glib-compile-schemas ~/.local/share/gnome-shell/extensions/sticky-window-corner-badge@local/schemas/
   ```
3. Log out and log back in (on Wayland), then enable the extension:
   ```bash
   gnome-extensions enable sticky-window-corner-badge@local
   ```

## Configuration

Open the extension settings via **Extension Manager** or from the terminal:
```bash
gnome-extensions prefs sticky-window-corner-badge@local
```

### Available Options
* **Badge Icon Size (px):** Slider (`8`–`48` px, default `14`).
* **Opacity (25–255):** Slider (`25`–`255`, default `255`).
* **Badge Spacing (px):** Horizontal gap between badges (`0`–`50` px, default `6`).
* **Horizontal / Vertical Offset (px):** Distance from the window's top-left corner (`0`–`300` px, default `8`).
* **Badge Colors & Icons:** Custom RGBA background colors and GNOME symbolic icon names (defaults: `view-pin-symbolic` and `go-top-symbolic`).
* **Reset to Defaults:** Restores all settings to their initial values.

## Packaging

To build a distributable `.shell-extension.zip` archive from the extension folder:
```bash
cd ~/.local/share/gnome-shell/extensions/sticky-window-corner-badge@local
gnome-extensions pack --force --extra-source=schemas/org.gnome.shell.extensions.sticky-window-corner-badge.gschema.xml
```

## License

MIT
