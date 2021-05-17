'use strict';

document.documentElement.classList.toggle('embedded', window.parent != window);

document.body.addEventListener('click', function (event) {
    if (event.target != document.body) return;
    closeWhenEmbedded();
});
var closeButton = document.getElementById('closeButton');

if (closeButton) closeButton.addEventListener('click', closeOverlay);

document.addEventListener('keydown', function (event) {
    if (event.keyCode == 27) closeWhenEmbedded();
});

function closeWhenEmbedded() {
    if (document.documentElement.classList.contains('embedded')) closeOverlay();
}

function closeOverlay() {
    window.close;
}
