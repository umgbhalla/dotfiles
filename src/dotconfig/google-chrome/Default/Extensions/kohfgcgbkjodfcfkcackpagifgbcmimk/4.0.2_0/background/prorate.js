let prorate = {
    upgradeDialog: null,
    windowId: '',
    init: function() {
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            if (request.fn in prorate) {
                prorate[request.fn](request, sender, sendResponse);
                return true;
            }
        });
    },
    previewUpgradeReq: function(request, sender, sendResponse) {
        let data = request.data;
        let apiEndpoint = 'https://ransxfmm6c.execute-api.us-east-1.amazonaws.com/Prod/preview';
        let body = {email: data.email, liccodeCurr: data.liccodeCurr, liccodeNew: data.liccodeNew};
        return fetch(apiEndpoint, {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }).then(response => {
            if (response.ok) {
                return response.json()
                    .then(function(res) {
                        sendResponse(res);
                        return res;
                    })
            } else {
                sendResponse(response);
                return response;
            }
        }).catch(err => {
            alert(err);
        });
    },
    sendUpgradeReq: function(request, sender, sendResponse) {
        let data = request.data;
        let apiEndpoint = 'https://ransxfmm6c.execute-api.us-east-1.amazonaws.com/Prod/modify';
        let body = {email: data.email, liccodeCurr: data.liccodeCurr, liccodeNew: data.liccodeNew};
        return fetch(apiEndpoint, {
            method: 'PUT',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }).then(response => {
            if (response.ok) {
                return response.json()
                    .then(function(res) {
                        sendResponse(res);
                        return res;
                    })
            } else {
                return response.json()
                    .then(function(res) {
                        alert(res)
                        sendResponse(res);
                        return res;
                    });
            }
        }).catch(err => {
            sendResponse({'error': err});
            return {'error': err};
        });
    },
    showUpgradePage: function(request, sender, sendResponse) {
        let url = '';
        if (request.type === 'general') {
            url = 'https://www.naturalreaders.com/webapp.html#upgrade'
        } else if (request.type === 'prem') {
            url = 'https://www.naturalreaders.com/checkout/plans?plan=personal'
        } else {
            url = 'https://www.naturalreaders.com/checkout/plans?plan=plus'
        }
        chrome.tabs.create({url: url});
    },
}
prorate.init();
