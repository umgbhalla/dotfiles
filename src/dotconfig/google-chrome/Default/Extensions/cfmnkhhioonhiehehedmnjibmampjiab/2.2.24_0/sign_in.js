'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

document.addEventListener('DOMContentLoaded', function () {
    watchMessages();
    loadSignInIframe();
});

function watchMessages() {
    window.addEventListener('message', function (event) {
        var message = _typeof(event.data) == 'object' ? event.data : { message: event.data };
        switch (message.message) {
            case SM_MESSAGE_SIGNED_IN:
                chrome.runtime.sendMessage(message);
                break;
        }
    });
}

function loadSignInIframe(params) {
    document.getElementById('signInFrame').setAttribute('src', Startme.apiURL('/extension/sign_in'));
}
