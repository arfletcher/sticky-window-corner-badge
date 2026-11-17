UUID = sticky-window-corner-badge@local
SCHEMA_DIR = schemas
SCHEMA_XML = $(SCHEMA_DIR)/org.gnome.shell.extensions.sticky-window-corner-badge.gschema.xml
SCHEMA_BIN = $(SCHEMA_DIR)/gschemas.compiled
BUNDLE = $(UUID).shell-extension.zip
TEST_APP ?= gnome-text-editor

.PHONY: all compile pack install enable disable prefs test clean

all: compile pack

compile: $(SCHEMA_BIN)

$(SCHEMA_BIN): $(SCHEMA_XML)
	glib-compile-schemas $(SCHEMA_DIR)/

pack: compile
	gnome-extensions pack --force --extra-source=$(SCHEMA_XML)

install: pack
	gnome-extensions install --force $(BUNDLE)

enable:
	gnome-extensions enable $(UUID)

disable:
	gnome-extensions disable $(UUID)

prefs: compile
	gnome-extensions prefs $(UUID)

test: compile
	env MUTTER_DEBUG_DUMMY_MODE_SPECS=1280x800 dbus-run-session -- bash -c '\
		gnome-shell --nested --wayland & \
		sleep 2; \
		gnome-extensions enable $(UUID); \
		WAYLAND_DISPLAY=wayland-1 $(TEST_APP) & \
		wait \
	'

clean:
	rm -f $(SCHEMA_BIN) $(BUNDLE)
