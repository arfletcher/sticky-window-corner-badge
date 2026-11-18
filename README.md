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

### From Source (Recommended)
1. Navigate to your local GNOME Shell extensions directory:
   ```bash
   cd ~/.local/share/gnome-shell/extensions/sticky-window-corner-badge@local
   ```
2. Compile the schema, package, and install the extension:
   ```bash
   make install
   ```
3. Log out and log back in (required on Wayland), then enable the extension:
   ```bash
   make enable
   ```

### From Pre-Built Bundle (`.zip`)
```bash
gnome-extensions install --force sticky-window-corner-badge@local.shell-extension.zip
```
Log out and log back in, then run `make enable` (or `gnome-extensions enable sticky-window-corner-badge@local`).

## Configuration

Open the extension settings via **Extension Manager** or run:
```bash
make prefs
```

### Available Options
* **Badge Icon Size (px):** Slider (`8`–`48` px, default `14`).
* **Opacity (25–255):** Slider (`25`–`255`, default `255`).
* **Badge Spacing (px):** Horizontal gap between badges (`0`–`50` px, default `6`).
* **Horizontal / Vertical Offset (px):** Distance from the window's top-left corner (`0`–`300` px, default `8`).
* **Badge Colors & Icons:** Custom RGBA background colors and GNOME symbolic icon names (defaults: `view-pin-symbolic` and `go-top-symbolic`).
* **Reset to Defaults:** Restores all settings to their initial values.

## Testing in a Nested Wayland Session

You can test the extension safely without logging out of your main session using a nested GNOME Shell instance.

### Quick Test via `make`
Launches a `1280x800` nested Wayland shell, enables the extension, and opens a test window (`gnome-text-editor` by default):
```bash
make test
```
To launch a different app inside the nested session:
```bash
make test TEST_APP=nautilus
```

### Manual Test via `dbus-run-session`
1. Start an isolated D-Bus and nested Wayland GNOME Shell instance (check the terminal output for the assigned Wayland display name, typically `wayland-1`):
   ```bash
   env MUTTER_DEBUG_DUMMY_MODE_SPECS=1280x800 dbus-run-session -- gnome-shell --nested --wayland
   ```
2. Launch an application inside the nested window from a second terminal by passing `WAYLAND_DISPLAY`:
   ```bash
   WAYLAND_DISPLAY=wayland-1 gnome-text-editor &
   ```
3. Enable the extension inside the nested shell (either via a terminal opened inside the nested window or in a single `dbus-run-session` block):
   ```bash
   dbus-run-session -- bash -c '
     gnome-shell --nested --wayland &
     sleep 2
     gnome-extensions enable sticky-window-corner-badge@local
     WAYLAND_DISPLAY=wayland-1 gnome-text-editor &
     wait
   '
   ```
4. Focus the test window, press **Alt + Space** (or click **Right Ctrl** first to capture keyboard shortcuts inside the nested window), and toggle **Always on Visible Workspace** or **Always on Top**. *(Note: On GNOME 49+, replace `--nested --wayland` with `--devkit`.)*

## Makefile Targets

| Command | Description |
| :--- | :--- |
| `make` | Compiles the GSettings schema and builds `sticky-window-corner-badge@local.shell-extension.zip`. |
| `make compile` | Compiles `schemas/gschemas.compiled` from the XML schema. |
| `make pack` | Packages the extension into a distributable `.shell-extension.zip` archive. |
| `make install` | Packages and installs the extension bundle locally. |
| `make enable` / `make disable` | Enables or disables the extension in GNOME Shell. |
| `make prefs` | Compiles the schema and opens the preferences window (with terminal logging). |
| `make test` | Launches an isolated nested Wayland GNOME Shell session with a test app (`TEST_APP=gnome-text-editor`). |
| `make clean` | Removes compiled schema binaries and `.zip` build artifacts. |

## License

MIT
