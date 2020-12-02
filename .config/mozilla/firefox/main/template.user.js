// startup
// 1 - start at about:blank, 1 - start at home page,
// 2 - load last visited, 3 - restore session
user_pref("browser.startup.page", 0);
user_pref("browser.sessionstore.resume_session_once", false);
user_pref("browser.sessionstore.resume_from_crash", false);
user_pref("browser.sessionstore.warnOnQuit", false);
user_pref("browser.shell.checkDefaultBrowser", false);

// tabs
user_pref("browser.ctrlTab.recentlyUsedOrder", false);
user_pref("browser.tabs.warnOnClose", false);

// downloads
user_pref("browser.download.dir", "${HOME}/Downloads");
user_pref("browser.download.useDownloadDir", "true");

// TODO application actions

// browsing
user_pref("general.smoothScroll", false);
user_pref("toolkit.scrollbox.smoothScroll", false);
user_pref("browser.newtabpage.activity-stream.asrouter.userprefs.cfr.features", false);
user_pref("browser.newtabpage.activity-stream.asrouter.userprefs.cfr.addons", false);

// new windows and tabs
user_pref("startup.homepage_welcome_url", "about:welcome");
user_pref("browser.startup.homepage", "about:home");

// firefox home content
user_pref("browser.newtabpage.activity-stream.showSearch", false);
user_pref("browser.newtabpage.activity-stream.feeds.topsites", false);
user_pref("browser.newtabpage.activity-stream.feeds.sections", false);
user_pref("browser.newtabpage.activity-stream.feeds.section.highlights", false);
user_pref("browser.newtabpage.activity-stream.feeds.snippets", false);
user_pref("browser.newtabpage.activity-stream.improvesearch.topSiteSearchShortcuts", false);

// TODO
// default search engine can NO LONGER be set in about:config due to
// third-party plugins setting the default search engine

// TODO search shortcuts

// logins and passwords
user_pref("signon.autofillForms", false);
user_pref("signon.autofillForms.http", false);
user_pref("signon.autofillForms.autocompleteOff", true);
user_pref("signon.management.page.vulnerable-passwords.enabled", false);
user_pref("signon.management.page.breach-alerts.enabled", false);
user_pref("signon.privateBrowsingCapture.enabled", false);
user_pref("signon.generation.available", false);
user_pref("signon.rememberSignons", false);

// forms and autofill
user_pref("browser.formfill.enable", false);
user_pref("extensions.formautofill.addresses.enabled", false);
user_pref("extensions.formautofill.creditCards.enabled", false);

// address bar
user_pref("browser.search.suggest.enabled", false);
user_pref("browser.urlbar.suggest.bookmark", false);
user_pref("browser.urlbar.suggest.openpage", false);
user_pref("browser.urlbar.suggest.topsites", false);
user_pref("browser.urlbar.suggest.history", false);
user_pref("browser.urlbar.suggest.searches", false);

// permissions
// popups
user_pref("dom.disable_open_during_load", false);

// firefox data and collection use - see telemetry

// deceptive content and dangerous software protection
// stop monitoring downloads!
user_pref("browser.safebrowsing.downloads.remote.enabled", false);
user_pref("browser.safebrowsing.downloads.enabled", false);

//
// miscellaneous
//

// about:config warning
user_pref("browser.aboutConfig.showWarning", false);

// opengl
user_pref("gfx.webrender.all", true);

// enable stylesheets
user_pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);

// disabling junk Mozilla defaults
user_pref("browser.messaging-system.whatsNewPanel.enabled", false);
user_pref("extensions.htmlaboutaddons.recommendations.enabled", false);

// telemetry and privacy
user_pref("toolkit.telemetry.reportingpolicy.firstRun", false);
user_pref("toolkit.telemetry.enabled", false);
user_pref("browser.newtabpage.activity-stream.feeds.telemetry", false);
user_pref("devtools.onboarding.telemetry.logged", false);
user_pref("toolkit.telemetry.updatePing.enabled", false);
user_pref("browser.newtabpage.activity-stream.feeds.telemetry", false);
user_pref("browser.newtabpage.activity-stream.telemetry", false);
user_pref("browser.ping-centre.telemetry", false);
user_pref("toolkit.telemetry.bhrPing.enabled", false);
user_pref("toolkit.telemetry.enabled", false);
user_pref("toolkit.telemetry.firstShutdownPing.enabled", false);
user_pref("toolkit.telemetry.hybridContent.enabled", false);
user_pref("toolkit.telemetry.newProfilePing.enabled", false);
user_pref("toolkit.telemetry.reportingpolicy.firstRun", false);
user_pref("toolkit.telemetry.shutdownPingSender.enabled", false);
user_pref("toolkit.telemetry.unified", false);
user_pref("toolkit.telemetry.updatePing.enabled", false);
user_pref("toolkit.telemetry.reportingpolicy.firstRun", false);
user_pref("toolkit.telemetry.unified", false);
user_pref("toolkit.telemetry.archive.enabled", false);
user_pref("toolkit.telemetry.cachedClientID", "");
user_pref("devtools.onboarding.telemetry.logged", false);
user_pref("toolkit.telemetry.bhrPing.enabled", false);
user_pref("datareporting.healthreport.uploadEnabled", false);
user_pref("datareporting.policy.dataSubmissionEnabled", false);
user_pref("datareporting.sessions.current.clean", true);
user_pref("services.sync.prefs.sync.app.shield.optoutstudies.enabled", false);
user_pref("services.sync.prefs.sync.browser.discovery.enabled", false);
user_pref("services.sync.prefs.sync.browser.formfill.enable", false);
user_pref("services.sync.engine.passwords", false);
// disable history recording
// user_pref("places.history.enabled", false);
// telemetry master
user_pref("app.normandy.enabled", false);
user_pref("privacy.trackingprotection.enabled", true);
user_pref("browser.send_pings", false);
user_pref("browser.send_pings.require_same_host", true);
// why are websites reading battery info?
user_pref("dom.battery.enabled", false);
// cookies
user_pref("network.cookie.alwaysAcceptSessionCookies", false);
// only site cookies - no third party cookies
user_pref("network.cookie.cookieBehavior", 1);
// prevent sites from disabling context menu
// user_pref("dom.event.contextmenu.enabled", false);
// sites should not be able to see installed plugins
user_pref("plugins.enumerable_names", "");
// disable geolocation
user_pref("geo.enabled", false);
user_pref("geo.wifi.uri", "");
user_pref("browser.search.geoip.url", "");
// plugins not following popup rules
user_pref("privacy.popups.disable_from_plugins", 2);

// syncing
user_pref("services.sync.declinedEngines", "passwords,addresses,creditcards");

// https
user_pref("dom.security.https_only_mode", true);

// UI customization
//       \"library-button\",
user_pref("browser.uiCustomization.state", "{
  \"placements\": {
    \"nav-bar\": [
      \"urlbar-container\",
      \"downloads-button\"
    ],
    \"PersonalToolbar\": []
  },
  \"currentVersion\": 16
}");
// user_pref("browser.display.background_color", "${FF_BG}");
// user_pref("browser.display.foreground_color", "${FF_FG}");

// devtools
user_pref("devtools.toolbox.host", "right");
user_pref("devtools.editor.keymap", "vim"); // bindings for all devtools file editing

// media
user_pref("dom.media.autoplay.autoplay-policy-api", false);
user_pref("media.autoplay.enabled", false);
user_pref("media.block-autoplay-until-in-foreground", true);
// play drm-controlled content
user_pref("media.eme.enabled", true);

// pocket
user_pref("extensions.pocket.enabled", false);
user_pref("extensions.pocket.onSaveRecs", false);
user_pref("extensions.pocket.site", "");
user_pref("extensions.pocket.oAuthConsumerKey", "");
user_pref("extensions.pocket.api", "");

// downloads
// display download panel on download
user_pref("browser.download.panel.shown", true);
// always display download icon in bar
user_pref("browser.download.autohideButton", false);

// reducing memory footprint
// I never need to "undo" tabs - just open a new one
user_pref("browser.sessionstore.max_tabs_undo", 0);
// max urls you can traverse with forward/back
user_pref("browser.sessionhistory.max_entries", 5);
// animations
user_pref("browser.tabs.animate", false);
user_pref("browser.download.animateNotifications", false);
user_pref("toolkit.cosmeticAnimations.enabled", false);
// hide fullscreen warning
user_pref("full-screen-api.warning.timeout", 0);

// fix using gtk to render inputs and make text unreadable
// user_pref("browser.display.use_system_colors", false);
// user_pref("widget.content.allow-gtk-dark-theme", false);
// user_pref("widget.content.gtk-theme-override", "${THEME}:light");

// disable spell check
user_pref("layout.spellcheckDefault", 0);

// extensions
user_pref("extensions.update.enabled", false);
user_pref("extensions.logging.enabled", false);
user_pref("extensions.update.autoUpdateEnabled", false);

// move Firefox disk cache completely to RAM because gotta go fast am i right
user_pref("browser.cache.disk.parent_directory", "/run/user/${UID}/firefox");
user_pref("browser.cache.memory.enable", true);
user_pref("browser.cache.disk.enable", false);
