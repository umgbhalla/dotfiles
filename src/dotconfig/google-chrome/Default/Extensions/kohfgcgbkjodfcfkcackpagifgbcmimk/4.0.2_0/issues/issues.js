function ReportIssues() {
    let self = this;
    const container = document.getElementById('nr-bug-container');
    const urlcontainer = document.getElementById('nr-bug-url-content');
    const doccontainer = document.getElementById('nr-bug-doc-content');
    const bugcontainer = document.getElementById('nr-bug-issue-content');
    const sendIssueBtn = document.getElementById('send');
    const url = document.getElementById('nr-bug-url');
    const texts = document.getElementById('nr-bug-text');
    const msg = document.getElementById('nr-bug-issues');
    const closeBtn = document.getElementById('close');
    const footerClose = document.getElementById('footerClose');
    footerClose.style.display = 'none';
    const goBackBtn = document.getElementById('goBack');
    goBackBtn.style.display = 'none';
    const result = document.getElementById('result');
    result.style.display = 'none';
    const success = document.getElementById('nr-bug-success');
    const fail = document.getElementById('nr-bug-fail');
    const issueContent = document.getElementById('bug-content');
    const openInfo = document.getElementById('openInfo');
    const info = document.getElementById('info');
    info.style.display = 'none';
    const closeInfo = document.getElementById('closeInfo');
    closeInfo.style.display = 'none';
    self.issue = {};
    openInfo.onclick = ()=>{
        issueContent.style.display = 'none';
        info.style.display = 'block';
        openInfo.style.display = 'none';
        sendIssueBtn.style.display = 'none';
        closeInfo.style.display = 'block';
    }
    closeInfo.onclick = ()=>{
        issueContent.style.display = 'block';
        info.style.display = 'none';
        openInfo.style.display = 'block';
        sendIssueBtn.style.display = 'block';
        closeInfo.style.display = 'none';
    }
    closeBtn.onclick = () => {
        window.close();
    }
    footerClose.onclick = () => {
        window.close();
    }
    goBackBtn.onclick = goBackToIssue;
    function goBackToIssue() {
        result.style.display = 'none';
        footerClose.style.display = 'none';
        issueContent.style.display = 'block';
        goBackBtn.style.display = 'none';
        sendIssueBtn.style.display = 'block';
        openInfo.style.display = 'block';
    }
    sendIssueBtn.onclick = () => {
        self.issue['msg'] = msg.value;
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://zbmbj9907e.execute-api.us-east-1.amazonaws.com/prod/issue');
        xhr.onreadystatechange = function() {
            issueContent.style.display = 'none';
            result.style.display = 'block';
            footerClose.style.display = 'block';
            sendIssueBtn.style.display = 'none';
            openInfo.style.display = 'none';
            if (this.readyState === XMLHttpRequest.DONE && this.status >= 400) {
                fail.style.display = 'block';
                success.style.display = 'none';
                goBackBtn.style.display = 'block';
            }
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                success.style.display = 'block';
                fail.style.display = 'none';
            }
        };
        xhr.onerror = function(err) {
            issueContent.style.display = 'none';
            result.style.display = 'block';
            success.style.display = 'none';
            fail.style.display = 'block';
            goBackBtn.style.display = 'block';
            footerClose.style.display = 'block';
            sendIssueBtn.style.display = 'none';
            openInfo.style.display = 'none';
        };
        const body = JSON.stringify(self.issue);
        try {
            xhr.send(body);
        } catch (e) {
        }
    }
    function initIssue() {
        chrome.runtime.sendMessage({fn: 'getIssue'}, function(issue) {
            self.issue = {
                voiceType: issue.voiceType,
                freeVoice: issue.freeVoice,
                premVoice: issue.premVoice,
                plusVoice: issue.plusVoice,
                email: issue.email,
                app: 'ext',
                speed: issue.speed,
                volume: issue.volume,
                textSource: issue.docType,
                provider: 'ext',
                index: issue.index,
                originalText: issue.originalText,
                proccessedText: issue.proccessedText,
                userAgent: navigator.userAgent,
                appVersion: issue.appVersion,
                os: issue.os,
                platform: issue.platform
            }
            if (!issue.docType || issue.docType === 'html') {
                self.issue['webpageUrl'] = issue.tab.url;
                setContainer('url');
                url.value = self.issue['webpageUrl'];
            } else {
                self.issue['docTexts'] = issue.texts;
                setContainer('doc');
                texts.value = self.issue['docTexts'];
            }
        });
    }
    initIssue();
    function setContainer(type) {
        if (type === 'url') {
            container.classList.remove('nr-doc');
            doccontainer.style.display = 'none';
            urlcontainer.style.display = 'flex';
            bugcontainer.style.height = 'calc(100% - 60px)';
        } else {
            container.classList.add('nr-doc');
            doccontainer.style.display = 'flex';
            urlcontainer.style.display = 'none';
            bugcontainer.style.height = 'calc(100% - 120px)';
        }
    }
}
var reportIssues = reportIssues || new ReportIssues();