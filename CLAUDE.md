# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sticky Window Corner Badge** (`sticky-window-corner-badge@local`) is a GNOME Shell extension (supporting GNOME Shell 45–51) written in modern ES Modules (`import ... from`). It renders clickable floating status badges over the top-left corner of windows marked **Always on Visible Workspace** (`metaWindow.is_on_all_workspaces()`) and **Always on Top** (`metaWindow.above`).

## File Structure

- `metadata.json`: Extension manifest, UUID (`sticky-window-corner-badge@local`), supported shell versions (`45`–`51`), and GSettings schema ID (`org.gnome.shell.extensions.sticky-window-corner-badge`).
- `extension.js`: Main GNOME Shell runtime logic (`StickyWindowBadgeExtension`). Tracks `Meta.Window` actors, manages clickable `St.Button` badges inside a horizontal `St.BoxLayout`, syncs z-order stacking, and reacts live to GSettings changes.
- `prefs.js`: GTK4 / Libadwaita (`Adw`) preferences window (`StickyWindowBadgePreferences`) providing live sliders, spin buttons, `Gtk.ColorDialogButton` color pickers, symbolic icon entry rows with previews, and a reset-to-defaults button.
- `stylesheet.css`: GNOME Shell CSS styling for pill-shaped badge buttons (`border-radius: 99px`, shadows, hover borders).
- `schemas/org.gnome.shell.extensions.sticky-window-corner-badge.gschema.xml`: GSettings schema defining 9 keys (`badge-size`, `badge-spacing`, `offset-x`, `offset-y`, `badge-opacity`, `sticky-color`, `sticky-icon`, `above-color`, `above-icon`).
- `README.md`: End-user documentation, installation, and packaging instructions.

## Build, Test, and Packaging Commands

### Compile GSettings Schema
Run after any edit to `schemas/*.gschema.xml`:
```bash
glib-compile-schemas schemas/
```

### Verify Compiled Schema Keys
```bash
gsettings --schemadir schemas/ list-keys org.gnome.shell.extensions.sticky-window-corner-badge
```

### Package Distributable Bundle (`.zip`)
```bash
gnome-extensions pack --force --extra-source=schemas/org.gnome.shell.extensions.sticky-window-corner-badge.gschema.xml
```

### Test in an Isolated Nested Wayland Session (GNOME 48)
```bash
env MUTTER_DEBUG_DUMMY_MODE_SPECS=1280x800 dbus-run-session -- bash -c '
  gnome-shell --nested --wayland &
  sleep 2
  gnome-extensions enable sticky-window-corner-badge@local
  WAYLAND_DISPLAY=wayland-1 gnome-text-editor &
  wait
'
```
*(Note: On GNOME 49+, `--nested` was replaced with `--devkit`.)*

### Open Preferences Window Directly (Prints Stack Traces to Terminal)
```bash
gnome-extensions prefs sticky-window-corner-badge@local
```

## Critical Architecture & Pitfalls

1. **Window Z-Order Stacking (`global.window_group`):**
   - Always add the badge `St.BoxLayout` container to `global.window_group`—**never** `Main.layoutManager.uiGroup`. Adding to `uiGroup` causes badges to float above unrelated overlapping windows.
   - Keep each badge container directly above its owning window actor by calling `global.window_group.set_child_above_sibling(container, actor)` inside `updateBadges()` and on `global.display` `restacked` events.

2. **Pango Markup in Libadwaita (`prefs.js`):**
   - `Adw.PreferencesGroup` and `Adw.ActionRow` parse titles/subtitles as Pango markup. Never use unescaped `&` characters (use `and` instead of `&`) or GTK will fail to render the string and abort loading `prefs.js`.

3. **GSettings Schema Caching:**
   - Once `gnome-shell` loads `gschemas.compiled`, it caches the schema in memory until the `gnome-shell` process restarts. After adding or modifying schema keys, recompile with `glib-compile-schemas schemas/` and restart the nested session (or log out/in on Wayland).

4. **Strict Signal & Actor Cleanup (`disable()`):**
   - Every signal connected to `Meta.Window`, `global.display`, `global.workspace_manager`, `Main.overview`, and `this._settings` must be tracked and disconnected in `disable()`, and all `St.BoxLayout` containers must be `.destroy()`-ed to meet GNOME extension review rules.
