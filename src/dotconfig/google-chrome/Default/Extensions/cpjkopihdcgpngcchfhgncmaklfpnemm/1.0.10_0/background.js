/*! (C) 2013-2014 "Help! progra-man" All Rights Reserved. */

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-42660707-7']);
_gaq.push(['_trackPageview', '/background.html']);

(function(){
	var incogWnd_ = null;
	var incogTabs_ = {};
	var settings_ = {};

	function load_settings() {
		chrome.storage.local.get(null, onloaded);
	}

	function onloaded(items) {
		detach();
		settings_ = {};

		if (items && items.enabled && items.setting) {
			var setting = items.setting;
			if (!setting.disabled) {
				settings_ =	{ urls: setting.urls };
			}
			if (setting.urls.length > 0) {
				attach();
			}
		}
	}

	function onBeforeRequest(detail) {
		var tabId = detail.tabId;
		if (tabId != -1 && detail.type == "main_frame" && !incogTabs_[tabId]) {
			openIncognito(detail.url, tabId);

			throw "Request was canceled. Open the 'INCOGNITO-MODE' by Progra-man !";
		}
	}
	function openIncognito(url, tabId) {
		if (incogWnd_ !== null) {
			chrome.tabs.create({windowId: incogWnd_, url: url, selected: true});
		} else {
			chrome.windows.create({url: url, incognito: true});
		}

		chrome.tabs.remove(tabId);

		_gaq.push(['_trackEvent', 'auto_secret', 'open-incognito']);
	}
	function attach() {
		detach();

		console.log("auto_secret:start");

		_gaq.push(['_trackEvent', 'auto_secret', 'attach']);

		var setting = settings_;
		
		if (setting && setting.urls.length > 0) {
			_gaq.push(['_trackEvent', 'auto_secret', 'attach', 'urls', setting.urls.length]);

			chrome.webRequest.onBeforeRequest.addListener(
					onBeforeRequest,
					{ urls: setting.urls },
					["blocking"]);
		} else {
			_gaq.push(['_trackEvent', 'auto_secret', 'attach', 'urls', 0]);
		}
	}
	function detach() {
		console.log("auto_secret:stop");

		_gaq.push(['_trackEvent', 'auto_secret', 'detach']);

		chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequest);
	}

	function onMessage(msg, sender, callback) {
		if (msg.type == "reload") {
			load_settings();
		}
	}
	function onCreatedWindow(window) {
		if (window.id && window.incognito && incogWnd_ === null) {
			incogWnd_ = window.id;
		}
	}
	function onRemovedWindow(windowId) {
		if (windowId === incogWnd_) {
			incogWnd_ = null;
		}
	}
	function onCreatedTab(tab) {
		if (tab.id != -1 && tab.incognito) {
			incogTabs_[tab.id] = tab.id;
		}
	}
	function onRemovedTab(tabId, removeInfo) {
		if (incogTabs_[tabId]) {
			delete incogTabs_[tabId];
		}
	}

	chrome.windows.onCreated.addListener(onCreatedWindow);
	chrome.windows.onRemoved.addListener(onRemovedWindow);
	chrome.tabs.onCreated.addListener(onCreatedTab);
	chrome.tabs.onRemoved.addListener(onRemovedTab);

	chrome.runtime.onMessage.addListener(onMessage);

	load_settings();

	_gaq.push(['_trackEvent', 'auto_secret', 'start']);
	var ga = document.createElement('script');
	ga.type = 'text/javascript';
	ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(ga, s);
})();