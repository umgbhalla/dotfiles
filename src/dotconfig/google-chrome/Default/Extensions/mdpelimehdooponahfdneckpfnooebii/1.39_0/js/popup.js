
var groupName;
const groupNameField = document.getElementById("groupName");


document.addEventListener('click', function (e) {
    switch (e.target.id) {
     
        case "WAXP_EXPORT":
                    var exportType = document.getElementById('exportType').value;
                    if (groupName) {
                        var configOptions = getConfigOptions();
                        sendMessageToWAXP(JSON.stringify(configOptions));
                        if (!configOptions.EXPORT_TYPE.includes('instant'))
                            document.getElementById('stopButton').classList.toggle('hidden');
                    }else if(exportType.includes('chatlist') || exportType.includes('label')){
                        sendMessageToWAXP(JSON.stringify({
                            'EXPORT_TYPE': exportType,
                            'NAME_PREFIX': document.getElementById('namePrefix').value,
                        }));
                    }else {
                        alert("Please select a group to continue.");
                    }
                    licenseStatusUpdate();
            break;
        case "stopButton":
            sendMessageToWAXP('stopAutoScroll');
            document.getElementById('stopButton').classList.toggle('hidden');
            break;
        case "gearIcon":
            document.getElementById('moreOptions').classList.toggle("hidden");
            break;
        case "activateLicense":
            activateLicense(document.getElementById('licenseKey').value);
            break;
        case String(e.target.id.match(/^page\d/)):
            addActiveClass(e.target.id);
    }
});

function activateLicense(key){
    document.getElementById('loading_container').innerHTML = `<video id="loading" src=${chrome.extension.getURL('/video/loading-animation.mp4')} autoplay muted loop height="20px"></video>`

    fetch("https://api.gumroad.com/v2/licenses/verify", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    product_permalink: "NrWaW",
                    license_key: key,
                    increment_uses_count: false,
                }),
            })
            .then((res) => res.json())
            .then(function (data) {
                if (
                    data.success &&
                    data.purchase.refunded === false &&
                    data.purchase.chargebacked === false
                ) {
                    chrome.storage.local.get("licenseStatus", function(res){
                        var l = {
                            key: data.purchase.license_key,
                            TRIAL_USAGE_COUNT: res.licenseStatus.TRIAL_USAGE_COUNT
                        }
                        chrome.storage.local.set({"licenseStatus":l});
                    })

                    document.getElementById('loading').classList.add('hidden');
                    document.getElementById('loading_container').innerText = "\n🟢 License Activated";
                    setTimeout(function(){
                        document.getElementById('loading_container').innerText = "";

                    },1500);
                    document.getElementById('status').innerText = "🟢 License Activated";
                    document.getElementById('WAXP_EXPORT').disabled = false;
                    return true;
                } else {
                    document.getElementById('loading').classList.add('hidden');
                    document.getElementById('loading_container').innerText = "\n 🔴 Invalid License Key";
                    // chrome.storage.local.remove("licenseStatus");
                    return false;
                }
            })
            .catch(function (err) {
                alert("Some error occured. Try again.")
                console.log("ERROR OCCURED USER");
            });
}

function getConfigOptions() {
    return {
        'EXPORT_TYPE': document.getElementById('exportType').value,
        'NAME_PREFIX': document.getElementById('namePrefix').value,
        'SCROLL_INTERVAL': document.getElementById('scrollInterval').value,
        'SCROLL_INCREMENT': document.getElementById('scrollIncrement').value
    }
}

function addActiveClass(id) {
    document.querySelectorAll(".tab").forEach(function (node) {
        node.classList.remove('active');
    })
    document.querySelectorAll(".pageContent").forEach(function (node) {
        node.classList.add('hidden');
    });
    document.getElementById(id).classList.add('active');
    document.getElementById(id + 'Content').classList.remove('hidden');
}

function sendMessageToWAXP(message) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            contentScriptQuery: message
        }, function (response) {
            //nothing for now..just send message
        });
    });
}


function updateSelectedModeHelperText(){
    const exportType = document.getElementById('exportType').value;
    if(groupName == undefined) {
        document.getElementsByClassName('selectedGroupWrapper')[0].innerHTML = "<b style='color:#F44336;'>Failed to run extension.<br> Please reload the page.</b>"
        document.getElementById('WAXP_EXPORT').disabled = true;
    }else if(exportType.includes('group')){
      groupNameField.innerText = `Selected Group: ${groupName}`;
    }else if(exportType.includes('chatlist')){
        groupNameField.innerText = `Chatlist export may take a while for very large chat lists.`;
    }else if(exportType.includes('label')){
        groupNameField.innerText = `Make sure to open the label drawer \n and wait till the labelled messaged are loaded.`;
    }
}


function licenseStatusUpdate(){
    chrome.storage.local.get("licenseStatus", function(res){
        if(res.licenseStatus.key){
            document.getElementById('paidUserInfo').classList.remove('hidden');
            document.getElementById('trialUserInfo').classList.add('hidden');
            document.getElementById('licenseKey').value = res.licenseStatus.key;
            document.getElementById('status').innerText = "🟢 License Activated";
        }else if(res.licenseStatus.TRIAL_USAGE_COUNT >= 3){ //Temporarily testing a different trial mode
            document.getElementById('status').innerText = "🔴 Free Trial Over";
            document.getElementById('WAXP_EXPORT').disabled = true;
        }
    })
}

(function init(){
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
    
        if (!tabs[0].url.match(/https{0,1}:\/\/web.whatsapp.com\//)) {
            chrome.tabs.create({
                url: "https://web.whatsapp.com"
            });
        }
    
        chrome.tabs.sendMessage(tabs[0].id, {
            contentScriptQuery: "currentGroup"
        }, function (response) {
            groupName = response;
        });
    });
    licenseStatusUpdate();
    document.getElementById('exportType').addEventListener('change', updateSelectedModeHelperText);
    setTimeout(updateSelectedModeHelperText, 800);

    document.getElementById('versionNumber').innerText = `v${chrome.runtime.getManifest().version}`;

})();
