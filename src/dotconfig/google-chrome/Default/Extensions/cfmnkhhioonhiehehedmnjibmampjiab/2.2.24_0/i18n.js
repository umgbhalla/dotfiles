'use strict';

window.addEventListener('DOMContentLoaded', function (event) {

    document.querySelectorAll('[i18n]').forEach(function (element) {
        element.innerText = chrome.i18n.getMessage(element.getAttribute('i18n'));
        element.removeAttribute('i18n');
    });

    var messagePattern = /^i18n_/;

    document.querySelectorAll('[title]').forEach(function (element) {
        var title = element.getAttribute('title');
        if (messagePattern.test(title)) element.setAttribute('title', chrome.i18n.getMessage(title.slice(5)));
    });

    document.querySelectorAll('[placeholder]').forEach(function (element) {
        var placeholder = element.getAttribute('placeholder');
        if (messagePattern.test(placeholder)) element.setAttribute('placeholder', chrome.i18n.getMessage(placeholder.slice(5)));
    });
});
