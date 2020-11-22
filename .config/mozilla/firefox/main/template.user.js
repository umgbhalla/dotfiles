// startup
user_pref("browser.sessionstore.resume_session_once", true);
user_pref("browser.sessionstore.resume_from_crash", true);
user_pref("browser.shell.checkDefaultBrowser", false);

// tabs
user_pref("browser.ctrlTab.recentlyUsedOrder", false);

// downloads
user_pref("browser.download.dir", "${HOME}/Downloads");
user_pref("browser.download.useDownloadDir", "true");

// TODO application actions

// browsing
user_pref("general.smoothScroll", false);
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
user_pref("signon.rememberSignons", false);

// forms and autofill
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
user_pref("datareporting.healthreport.uploadEnabled", false);
user_pref("datareporting.policy.dataSubmissionEnabled", false);
user_pref("datareporting.sessions.current.clean", true);
user_pref("services.sync.prefs.sync.app.shield.optoutstudies.enabled", false);
user_pref("services.sync.prefs.sync.browser.discovery.enabled", false);
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
      \"downloads-button\",
      \"_testpilot-containers-browser-action\",
      \"adblockultimate_adblockultimate_net-browser-action\",
      \"_react-devtools-browser-action\"
    ],
    \"PersonalToolbar\": []
  },
  \"currentVersion\": 16
}");
user_pref("browser.display.background_color", "${FF_BG}");
user_pref("browser.display.foreground_color", "${FF_FG}");

// devtools
user_pref("devtools.toolbox.host", "right");
user_pref("devtools.editor.keymap", "vim"); // bindings for all devtools file editing

// media
user_pref("dom.media.autoplay.autoplay-policy-api", false);
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
// user_pref("browser.tabs.animate", false);
// user_pref("browser.download.animateNotifications", false);

// extensions
user_pref("extensions.update.enabled", false);
user_pref("extensions.logging.enabled", false);
user_pref("extensions.update.autoUpdateEnabled", false);
// TODO extensions.webextensions.uuids
// extensions. enabledAddons
// user_pref("extensions.webextensions.uuids", "{\"default-theme@mozilla.org\":\"b0773b60-c95e-4349-a479-ed229fda20c8\",\"ddg@search.mozilla.org\":\"c4ab20be-9bda-4f88-bed8-26fa5145e8b7\",\"@testpilot-containers\":\"217140a1-0821-4728-b48a-5b5a170d01bf\"}");
// user_pref("extensions.webextensions.uuids", "{\"doh-rollout@mozilla.org\":\"af86dde3-3012-4b52-b226-932f40771bc2\",\"formautofill@mozilla.org\":\"b77278e9-1462-4226-b2f6-38e5a8e0f4e6\",\"screenshots@mozilla.org\":\"ba8a7714-a1fe-478d-bbea-3d832d5f609c\",\"webcompat-reporter@mozilla.org\":\"f2c7b270-8853-4958-bb73-164170ab0ac9\",\"webcompat@mozilla.org\":\"893e226b-97f5-4812-9689-47c825241d54\",\"default-theme@mozilla.org\":\"b0773b60-c95e-4349-a479-ed229fda20c8\",\"google@search.mozilla.org\":\"9e2fd104-4352-4baf-8531-a3679ed1656b\",\"amazondotcom@search.mozilla.org\":\"90ba61bc-77ca-463e-8500-193ee8f4c715\",\"wikipedia@search.mozilla.org\":\"1371e244-86f7-4820-8db7-bbab04440530\",\"bing@search.mozilla.org\":\"6f78b06c-fbff-478c-9880-08ba366bf328\",\"ddg@search.mozilla.org\":\"c4ab20be-9bda-4f88-bed8-26fa5145e8b7\",\"ebay@search.mozilla.org\":\"8f3829c7-abb2-4b9c-b4fc-ac2681cdfb39\",\"@testpilot-containers\":\"217140a1-0821-4728-b48a-5b5a170d01bf\"}");
