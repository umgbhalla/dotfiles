// opengl
user_pref("gfx.webrender.all", true);

// enable stylesheets
user_pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);

// disabling junk Mozilla defaults
user_pref("browser.messaging-system.whatsNewPanel.enabled", false);
user_pref("extensions.htmlaboutaddons.recommendations.enabled", false);

// telemetry !!!
user_pref("toolkit.telemetry.reportingpolicy.firstRun", false);
user_pref("toolkit.telemetry.enabled", false);

// downloads
user_pref("browser.download.dir", "${HOME}/Downloads");
user_pref("browser.download.useDownloadDir", "true");

// syncing
user_pref("services.sync.declinedEngines", "passwords,addresses,creditcards");

// autofill
user_pref("dom.payments.defaults.saveAddress", false);
user_pref("extensions.formautofill.addresses.enabled", false);
user_pref("dom.payments.defaults.saveCreditCard", false);
user_pref("extensions.formautofill.creditCards.enabled", false);

// UI customization
user_pref("browser.uiCustomization.state", "{\"placements\":{\"widget-overflow-fixed-list\":[],\"nav-bar\":[\"back-button\",\"forward-button\",\"stop-reload-button\",\"home-button\",\"urlbar-container\",\"downloads-button\",\"library-button\",\"sidebar-button\",\"fxa-toolbar-menu-button\",\"_testpilot-containers-browser-action\",\"adblockultimate_adblockultimate_net-browser-action\",\"_react-devtools-browser-action\"],\"toolbar-menubar\":[\"menubar-items\"],\"TabsToolbar\":[\"tabbrowser-tabs\",\"new-tab-button\",\"alltabs-button\"],\"PersonalToolbar\":[\"managed-bookmarks\",\"personal-bookmarks\"]},\"seen\":[\"developer-button\",\"_testpilot-containers-browser-action\",\"adblockultimate_adblockultimate_net-browser-action\",\"_react-devtools-browser-action\"],\"dirtyAreaCache\":[\"nav-bar\",\"toolbar-menubar\",\"TabsToolbar\",\"PersonalToolbar\"],\"currentVersion\":16,\"newElementCount\":3}");
user_pref("browser.display.background_color", "${FF_BG}");

// devtools
user_pref("devtools.toolbox.host", "right");
user_pref("devtools.editor.keymap", "vim"); // bindings for all devtools file editing

// media
user_pref("dom.media.autoplay.autoplay-policy-api", false);

// extensions
user_pref("extensions.update.enabled", false);
