'use strict';

window.addEventListener('DOMContentLoaded', function () {

    var iframe = document.getElementById('smi');

    chrome.runtime.sendMessage({ message: SM_MESSAGE_OPEN_URL }, function (response) {
        iframe.src = response.url;

        setTimeout(function () {
            showSpinner();
        }, 200);
    });

    window.addEventListener("message", function (event) {
        if (event.data === SM_MESSAGE_NOT_SIGNED_IN) {
            chrome.runtime.sendMessage({ message: SM_MESSAGE_NOT_SIGNED_IN });
        }
    });
});

function showSpinner() {
    var loader = document.getElementById('loader');

    if (!loader) return;

    loader.classList.add('visible');
}
