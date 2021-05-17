'use strict';

window.StartmeOverlay = new function (window) {
    var _this = this;

    chrome.runtime.onMessage.addListener(function (request, sender, respond) {
        switch (request.message) {
            case SM_MESSAGE_CLOSE_OVERLAY:
                _this.close();
                return;
        }
    });

    this.show = function (url) {

        this.close();

        var iframe = document.createElement('iframe');
        iframe.id = SM_OVERLAY_ID;
        iframe.setAttribute('src', url);
        document.documentElement.appendChild(iframe);

        document.documentElement.setAttribute(SM_OVERLAY_MARKER_ATTRIBUTE, 'visible');
    };

    this.close = function () {
        var overlay = document.getElementById(SM_OVERLAY_ID);
        if (overlay) {
            overlay.parentNode.removeChild(overlay);
        }

        document.documentElement.removeAttribute(SM_OVERLAY_MARKER_ATTRIBUTE);
    };
}(window);
