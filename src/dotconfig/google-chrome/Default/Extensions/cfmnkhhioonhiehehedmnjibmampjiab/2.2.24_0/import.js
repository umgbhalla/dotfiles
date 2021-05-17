'use strict';

chrome.runtime.onMessage.addListener(function (request, sender, respond) {
    switch (request.message) {
        case SM_MESSAGE_START_POLLING:
            startPolling(request.importId).then(function (url) {
                respond(url);
            });
            return true;
    }
});

function startPolling(importId) {
    var attempts = 0,
        interval = 1000;

    return new Promise(function (resolve, reject) {

        setTimeout(attempt, 1);

        function attempt() {
            poll(importId).then(function (url) {
                attempts++;
                if (url) {

                    resolve(url + '?import=' + importId);
                } else {

                    setTimeout(attempt, interval += 1000);
                }
            }).catch(function (error) {

                document.documentElement.classList.add('error');
                reject();
            });
        }
    });
}

function poll(importId) {
    return new Promise(function (resolve, reject) {
        fetch(Startme.apiURL('/import/poll/' + importId), {
            credentials: 'include'
        }).then(function (response) {

            if (response.status != 200 && response.status != 201) return reject();

            response.json().then(function (data) {
                if (response.status == 201) {
                    return resolve(data.location);
                } else switch (data.status) {
                    case 'work':

                        return resolve();
                    case 'error':
                        return reject(data.message);
                    default:
                        reject();
                }
            });
        }).catch(reject);
    });
}
