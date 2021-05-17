/*! (C) 2013-2014 "Help! progra-man" All Rights Reserved. */

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-42660707-7']);
_gaq.push(['_trackPageview', '/options.html']);

(function() {
	function localize(opt_context) {
		$("*", opt_context).each(function() {
			var item = $(this);
			var id = item.attr("id") || item.attr("name");
			var msg;
			if (id) {
				msg = chrome.i18n.getMessage(id);
				if (msg) {
					var ph = item.attr("placeholder");
					if (ph) {
						item.attr("placeholder", msg);
					} else {
						item.text(msg);
					}
				}
			}
		});
	}

	function trim(str) {
		str = str || "";
		return str.replace(/(^\s+)|(\s+$)/g, "");
	}

	function normalize_newline(str) {
		return str.replace(/(\r\n|\r|\n)/g, "\n");
	}

	function split_of_newlines(str) {
		return str.split("\n");
	}

	function join_lines(lines) {
		var text = "";
		var len = lines.length;
		for (var i = 0; i < len; i++) {
			text += lines[i] + "\r\n";
		}
		return text;
	}

	function is_match_url_filter(url) {
		if (!url)
			return false;
		return url.search(/^(\*|https?|ftp):\/\/((\*\.)?[^*\/]+|\*)(\/[^ ]*)$/i) != -1 ||
				url.search(/^file:\/\/(\/[^ ]*)$/i) != -1 ||
				url === "<all_urls>";
	}

	function onloaded(items) {
		if (items && items.setting) {
			var setting = items.setting;
			$(".setting .urls").val(join_lines(setting.urls));
		}
		var enabledDisabled = $(".enabled-disabled");
		if (items.enabled || items.enabled === undefined) {
			enabledDisabled.addClass("enabled");
		} else {
			enabledDisabled.removeClass("enabled");
		}
		$(".save_button").addClass("disabled");
	}

	function showSavedMessage(message) {
		var msg = $(".saved-message");
		msg.text(message);
		msg.css({"display": "inline-block", "opacity": "1"});
		$(".save_button").addClass("disabled");

		setTimeout(
			function() {
				msg.animate({"opacity": "0"}, 1500,
					function() {
						msg.css({"display": "none", "opacity": "1"});
					}
				);
			}, 1000
		);
	}

	function onsaved() {
		showSavedMessage(chrome.i18n.getMessage("saved"));
		chrome.runtime.sendMessage({type: "reload"});
	}

	function getEnabled() {
		var e = $(".enabled-disabled.enabled");
		if (e.size()) {
			return true;
		}
		return false;
	}

	function getSetting() {
		var urls = normalize_newline(trim($(".urls").val()));
		var lines = split_of_newlines(urls);
		var len = lines.length;
		var nomalized_lines = [];
		for (var i = 0; i < len; i++) {
			var l = trim(lines[i]);
			if (l !== "") {
				nomalized_lines.push(l);
			}
		}
		var setting = null;
		if (nomalized_lines.length > 0) {
			setting = {
					disabled: false,
					urls: nomalized_lines
				};
		}
		return setting;
	}

	function hasError() {
		var has_error = false;
		$("#settings_holder .settings").each(
			function() {
				if ($(".url_error", this).text() !== "") {
					has_error = true;
					return false;
				}
			}
		);
		return has_error;
	}

	function loadOptions() {
		chrome.storage.local.get(null, onloaded);
	}

	function saveOptions() {
		if (hasError()) {
			showSavedMessage(chrome.i18n.getMessage("has_error"));
			return;
		}
		var items = {
			version: "0.4.23",
			saveDate: (new Date()).toString(),
			enabled: getEnabled(),
			setting: getSetting()
		};

		chrome.storage.local.set(items, onsaved);
	}

	function dirty() {
		$(".save_button").removeClass("disabled");
	}

	localize();
	loadOptions();

	function onChange_urls() {
		var val = normalize_newline(trim($(this).val()));

		var lines = split_of_newlines(val);
		var len = lines.length;
		var err_msg = $(this).next();
		
		var msg = "";
		for (var i = 0; i < len; i++) {
			var line = trim(lines[i]);
			if (line !== "") {
				if (!is_match_url_filter(lines[i])) {
					msg += (i + 1) + chrome.i18n.getMessage("invalid_url") + "<br>";
				}
			}
		}
		err_msg.html(msg);
		dirty();
	}
	function onClick_enabled() {
		var e = $(".enabled-disabled:not(.enabled)");
		if (e.size()) {
			$(".enabled-disabled").addClass("enabled");
			dirty();
			_gaq.push(['_trackEvent', 'options', 'click', 'enabled']);
		}
	}
	function onClick_disabled() {
		var e = $(".enabled-disabled.enabled");
		if (e.size()) {
			$(".enabled-disabled").removeClass("enabled");
			dirty();
			_gaq.push(['_trackEvent', 'options', 'click', 'disabled']);
		}
	}
	function onClick_save() {
		if ($(this).hasClass("disabled")) {
			return;
		}
		saveOptions();
		_gaq.push(['_trackEvent', 'options', 'click', 'save']);
	}
	function onClick_load() {
		loadOptions();
		_gaq.push(['_trackEvent', 'options', 'click', 'reset']);
	}

	$(".settings .urls").bind("input", onChange_urls);

	$(".enabled-disabled .radio.enabled").click(onClick_enabled);
	$(".enabled-disabled .radio.disabled").click(onClick_disabled);
	$(".save_button").click(onClick_save);
	$(".reset_button").click(onClick_load);

	$("html head title").text(chrome.i18n.getMessage("app_title"));

	_gaq.push(['_trackEvent', 'options', 'start']);
	var ga = document.createElement('script');
	ga.type = 'text/javascript';
	ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(ga, s);
})();
