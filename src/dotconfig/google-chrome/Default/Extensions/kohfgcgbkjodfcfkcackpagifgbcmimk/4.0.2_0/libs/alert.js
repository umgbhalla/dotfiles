function showAlertPremTtsLimit(windowId, data = {}) {
    swal.fire({
        title: 'You\'ve reached the 20 minute daily limit for Premium Voices.',
        type: 'warning',
        html: '<div class="font-size:small">(Please login if you\'re a Paid User)</div>',
        width: 512,
        heightAuto: false,
        customClass: 'swal-tts',
        showCloseButton: true,
        showCancelButton: true,
        cancelButtonText: 'Upgrade',
        confirmButtonText: 'Continue With Free Voices',
        reverseButtons: true,
        footer: '<p style="text-align:center">You can continue to use the free voices unlimitedly.</p>'
    }).then((result) => {
        if (result.value) {
            chrome.runtime.sendMessage({fn: 'setWidgetSetting', key: 'voiceType', value: 'free', toPlay: true}, () => void chrome.runtime.lastError);
        } else if (result.dismiss === swal.DismissReason.cancel) {
            chrome.runtime.sendMessage({fn: 'showUpgradePage', type: 'general'}, () => void chrome.runtime.lastError);
        }
        closeAlertWindow(windowId);
    });
}
function showAlertPlusTtsLimit(windowId, data = {}) {
    swal.fire({
        title: 'You\'ve reached the 5 minute daily limit for Plus Voices.',
        html: '<div class="font-size:small">(Please login if you\'re a Plus User)</div>',
        type: 'warning',
        width: 512,
        heightAuto: false,
        customClass: 'swal-tts',
        showCloseButton: true,
        showCancelButton: true,
        cancelButtonText: 'Upgrade',
        confirmButtonText: 'Continue With Free Voices',
        reverseButtons: true,
        footer: '<p style="text-align:center">You can continue to use the free voices unlimitedly.</p>'
    }).then((result) => {
        if (result.value) {
            chrome.runtime.sendMessage({fn: 'setWidgetSetting', key: 'voiceType', value: 'free', toPlay: true}, () => void chrome.runtime.lastError);
        } else if (result.dismiss === swal.DismissReason.cancel) {
            let license = data.license ? data.license : 0;
            if (license < 12) {
                chrome.runtime.sendMessage({fn: 'showUpgradePage', type: 'general'}, () => void chrome.runtime.lastError);
            } else {
                chrome.runtime.sendMessage({fn: 'upgrade'}, () => void chrome.runtime.lastError);
            }
        }
        closeAlertWindow(windowId);
    });
}
function showUpgradeDialog(windowId, data = {}) {
    var showDemo = true;
    chrome.runtime.sendMessage({fn: 'previewUpgradeReq', data: data}, (res) => {
        if (chrome.runtime.lastError) { }
        if (res.error != '') {
            showDemo = false;
            let err = "Something went wrong...";
            if (data.errors[res.error] != undefined) {
                err = data.errors[res.error];
            }
            swal.update({
                type: 'error',
                title: 'Upgrade Error',
                html: err,
                cancelButtonText: 'Close',
                showConfirmButton: false
            })
        } else {
            const price = (res.resp / 100).toFixed(2);
            swal.update({
                html: "<p style=\"font-size:12px\"> (You only pay the difference in price) </p>" +
                    "<p>Plus includes all the features of Premium as well as unlimited access to all 50 Plus Voices.<p>" +
                    "<br> <b>Price: $" + price + " USD<b>",
            })
        }
    });
    swal.fire({
        type: 'question',
        title: 'Upgrade from Premium to Plus?',
        html: "<p style=\"font-size:12px\"> (You only pay the difference in price) </p>" +
            "<p>Plus includes all the features of Premium as well as unlimited access to all 50 Plus Voices.<p>" +
            "<br> <b>Price: Calculating...<b>",
        width: 512,
        heightAuto: false,
        customClass: 'swal-upgrade',
        showCloseButton: true,
        showCancelButton: true,
        cancelButtonText: 'Listen To Demo',
        confirmButtonText: 'Upgrade Now',
        reverseButtons: true,
        confirmButtonColor: '#1A7DF9',
    }).then((result) => {
        if (result.value) {
            chrome.runtime.sendMessage({fn: 'sendUpgradeReq', data: data}, (res) => {
                if (chrome.runtime.lastError) { }
                if (res.error != '') {
                    let err = "Something went wrong...";
                    if (data.errors[res.error] != undefined) {
                        err = data.errors[res.error];
                    }
                    swal.fire({
                        type: 'error',
                        title: 'Upgrade Error',
                        text: err,
                        width: 512,
                        heightAuto: false,
                        customClass: 'swal-upgrade',
                        showCloseButton: true,
                        confirmButtonText: 'Close',
                        confirmButtonColor: '#4caf50'
                    }).then(result => {
                        closeAlertWindow(windowId)
                    });
                } else {
                    swal.fire({
                        type: 'success',
                        title: 'Upgrade Complete!',
                        text: 'You have successfully been upgraded to the Plus plan!',
                        width: 512,
                        heightAuto: false,
                        customClass: 'swal-custom',
                        showCloseButton: true,
                        confirmButtonText: 'Close',
                        confirmButtonColor: '#4caf50'
                    }).then(result => {
                        closeAlertWindow(windowId)
                    });
                }
            });
        } else if (result.dismiss === swal.DismissReason.cancel) {
            if (showDemo) {
                chrome.runtime.sendMessage({fn: 'showPlusVoiceDemoPage'}, () => void chrome.runtime.lastError);
            }
            closeAlertWindow(windowId);
        } else {
            closeAlertWindow(windowId);
        }
    });
}
function showAlertGeneric(windowId, data = {}) {
    swal.fire({
        type: 'error',
        title: 'Something went wrong...',
        text: 'Please reload the extension and page, or contact us.',
        width: 512,
        heightAuto: false,
        customClass: 'swal-custom',
        showCloseButton: true,
        showCancelButton: true,
        cancelButtonText: 'Contact Us',
        confirmButtonText: 'Reload',
        confirmButtonColor: '#4caf50',
        cancelButtonColor: '#1b7df9',
        reverseButtons: true,
        footer: '<p style="text-align:center">Need help with troubleshooting? Contact us at <a style="color:#1b7df9" href="mailto:support@naturalreaders.com">support@naturalreaders.com</a></p>'
    }).then((result) => {
        if (result.value) {
            chrome.runtime.sendMessage({fn: 'reloadExtAndPage'}, () => void chrome.runtime.lastError);
        } else if (result.dismiss === swal.DismissReason.cancel) {
            chrome.runtime.sendMessage({fn: 'contactUs'}, () => void chrome.runtime.lastError);
        }
        closeAlertWindow(windowId);
    });
}
function showGoogleDrivePreviewWarning(windowId, data = {}) {
    swal.fire({
        type: 'warning',
        title: 'Reading in Preview Mode',
        text: 'Note that highlighting of the currently being read sentence and word and auto-tracking text are not supported in the preview mode. Please open and read the document in Google Docs.',
        width: 512,
        heightAuto: false,
        customClass: 'swal-custom',
        showCloseButton: true,
        showCancelButton: true,
        cancelButtonText: 'I don\'t mind. Continue to read.',
        confirmButtonText: 'Cancel',
        confirmButtonColor: '#4caf50',
        reverseButtons: true
    }).then(async (result) => {
        if (result.dismiss === swal.DismissReason.cancel) {
            chrome.runtime.sendMessage({fn: 'setShouldCheckForPreviewMode', val: false}, () => void chrome.runtime.lastError);
            chrome.runtime.sendMessage({fn: 'play', caller: 'google drive preview warning'}, () => void chrome.runtime.lastError);
            closeAlertWindow(windowId);
        } else {
            closeAlertWindow(windowId);
        }
    });
}
function showAlertUpdateAvailable(windowId, data = {}) {
    swal.fire({
        type: 'warning',
        title: 'Update',
        text: 'An update is available. Please reload the extension by pressing the "Reload" button down below.',
        width: 512,
        heightAuto: false,
        customClass: 'swal-custom',
        showCloseButton: true,
        confirmButtonText: 'Reload',
        confirmButtonColor: '#4caf50',
        footer: '<p style="text-align:center">Need help with troubleshooting? Contact us at <a style="color:#1b7df9" href="mailto:support@naturalreaders.com">support@naturalreaders.com</a></p>'
    }).then((result) => {
        closeAlertWindow(windowId);
        chrome.storage.sync.clear(function() {
            if (chrome.runtime.lastError) {
            }
        });
        chrome.runtime.sendMessage({fn: 'reloadExtension'}, () => void chrome.runtime.lastError);
    });
}
function showAlertNoFreeVoices(windowId, data = {}) {
    swal.fire({
        type: 'error',
        title: 'No Free Voices',
        text: 'Your Google Chrome browser seems to have no free voices. Please update the browser or use Premium Voices only.',
        width: 512,
        heightAuto: false,
        customClass: 'swal-custom',
        showCloseButton: true,
        confirmButtonText: 'OK',
        confirmButtonColor: '#4caf50',
        footer: '<p style="text-align:center">Need help with troubleshooting? Contact us at <a style="color:#1b7df9" href="mailto:support@naturalreaders.com">support@naturalreaders.com</a></p>'
    }).then((result) => {
        closeAlertWindow(windowId);
    });
}
function showAlertPageNotReadable(windowId) {
    let path = chrome.runtime.getURL("assets/img/rs_context_menu.png");
    swal.fire({
        title: '<div style="color:#e13236">Page Not Readable</div>',
        html: '<ol style="text-align:left"><li>Open a webpage with readable text.</li><li>Or highlight the text, right-click, and select "Read Selection"</li></ol> <img src="' + path + '" style="width:260px;height:auto">',
        width: 512,
        heightAuto: false,
        customClass: 'swal-not-readable',
        showCloseButton: true,
        showConfirmButton: false,
        footer: '<div style="text-align:center"><div style="font-size:small; padding-bottom:10px">please go to <a style="color:#1b7df9" href="https://www.naturalreaders.com/online/" target="_blank">www.naturalreaders.com</a> to check more features.</div><div><a style="color:#1b7df9" href="https://docs.naturalreaders.com/chrome-ext/introduction" target="_blank">FAQ</a> and <a style="color:#1b7df9" href="https://www.naturalreaders.com/about.html#contactus" target="_blank">Contact Us</a></div></div>'
    }).then((result) => {
        closeAlertWindow(windowId);
    });
}
function showAlertInvalidPage(windowId){
    swal.fire({
        type: 'error',
        title: 'Invalid Page',
        text: 'You are at the start or end of the document.',
        width: 512,
        heightAuto: false,
        customClass: 'swal-custom',
        showCloseButton: true,
        confirmButtonText: 'OK',
        confirmButtonColor: '#4caf50',
    }).then((result) => {
        closeAlertWindow(windowId);
    });
}
function showAlertPdf(windowId, data = {}) {
    swal.fire({
        type: 'warning',
        title: 'We noticed that you want to read a pdf, please upload the file.',
        width: 512,
        heightAuto: false,
        customClass: 'swal-pdf',
        showCloseButton: true,
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Upload File',
        confirmButtonColor: '#4caf50',
        reverseButtons: true,
        footer: '<p style="text-align:center">Need help with troubleshooting? Contact us at <a style="color:#1b7df9" href="mailto:support@naturalreaders.com">support@naturalreaders.com</a></p>'
    }).then((result) => {
        if (result.value) {
            chrome.runtime.sendMessage({fn: 'showUploadPage'}, () => void chrome.runtime.lastError);
        }
        closeAlertWindow(windowId);
    });;
}
function showAlertMp3(windowId, data = {}) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({fn: 'setConvertAlertWindowId', windowId: windowId}, () => void chrome.runtime.lastError);
        resolve();
    }).then(result => {
        return swal.fire({
            text: "To download the audio, you will be redirected to NaturalReader Online. You can edit the text there before converting. Click the mp3 icon to review the conversion settings, then 'Convert'.",
            width: 512,
            heightAuto: false,
            html: "<p>To download the audio, you will be redirected to NaturalReader Online. You can edit the text there before converting. Click the mp3 icon to review the conversion settings, then 'Convert'.</p>" +
                "<input id='notShowMp3Alert' type='checkbox'> Do not show this message again",
            customClass: 'swal-convert',
            showCloseButton: true,
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'OK',
            confirmButtonColor: '#4caf50',
            reverseButtons: true
        })
    }).then((result) => {
        if (document.getElementById('notShowMp3Alert').checked) {
            storage.set({'notShowMp3Alert': true});
        }
        if (result.value) {
            return new Promise((resolve) => {
                chrome.runtime.sendMessage({fn: 'setShouldConvert', val: true}, () => void chrome.runtime.lastError);
                resolve();
            }).then(result => {
                closeAlertWindow(windowId);
            });
        } else {
            closeAlertWindow(windowId);
        }
    });
}
function showUpgradeUnsupportedDialog(windowId, data = {}) {
    let appName = data.licType;
    if (appName === 'ios') {
        appName = 'iOS';
    } else if (appName === 'android') {
        appName = 'Android';
    }
    swal.fire({
        type: 'info',
        title: 'We noticed you\'re using an ' + appName + ' license. Please upgrade through our ' + appName + ' app.',
        width: 512,
        heightAuto: false,
        customClass: 'swal-pdf',
        showCloseButton: true,
        confirmButtonText: 'OK',
        confirmButtonColor: '#4caf50'
    }).then((result) => {
        closeAlertWindow(windowId);
    });;
}
function closeAlertWindow(windowId) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({fn: 'closeAlertWindow', windowId: windowId}, function() {
            if (chrome.runtime.lastError) {
            }
            resolve();
        });
    })
        .catch((err) => {
        });
}