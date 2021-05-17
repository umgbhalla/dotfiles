function Pdf() {
	let self = this;
	self.checkPDF = checkPDF;
	self.isOnlinePdf = isOnlinePdf;
	self.localInstructions = '<p>Warning: We noticed you want to read a pdf, to read pdf\'s please upload the file <a class="pdf-instr" target="_blank" href="https://www.naturalreaders.com/online/?action=upload">here</a> </p>';
	self.downloadPdf = downloadPdf;
	self.tabId = null;
	self.remotePdf = null;
	self.getRemotePdf = getRemotePdf;
	self.setFile = setFile;
	self.pdfName = 'NR.pdf';
	function init() {
		chrome.tabs.onCreated.addListener(function(tab) {
			injectPdfBarForOnlinePdf();
		});
		chrome.tabs.onActivated.addListener(async function(activeInfo) {
			injectPdfBarForOnlinePdf();
		});
		chrome.windows.onFocusChanged.addListener(function(windowId) {
			chrome.tabs.query({active: true, lastFocusedWindow: true}, async function(tabs) {
				if (tabs[0]) {
					injectPdfBarForOnlinePdf();
				}
			});
		});
		browser.webNavigation.onCommitted.addListener(async function(details) {
			if (details.transitionType !== 'auto_subframe' && details.transitionType !== 'manual_subframe') {
				injectPdfBarForOnlinePdf();
			}
		});
		chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
			if (self[request['fn']]) {
				self[request.fn](request, sender, sendResponse);
			}
		});
	}
	function getUrlInfo(tab) {
		let urlInfo = {origin: 'no origin', href: 'no href'};
		if (tab.url) {
			let url = new URL(tab.url);
			let origin = url.origin;
			let href = url.href;
			urlInfo = {origin, href}
		}
		return urlInfo;
	}
	function ifPDF() {
		return utils.getActiveTab().then(tab => {
			let urlInfo = getUrlInfo(tab);
			if (tab && tab.url && tab.url.match(/\.pdf$/)) {
				if (tab.url.match(/file(.)+.pdf$/)) {
					return Promise.resolve({pdf: true, type: 'local', tabId: tab['id'], urlInfo});
				} else {
					return Promise.resolve({pdf: true, type: 'online', tabId: tab['id'], urlInfo});
				}
			} else {
				return Promise.resolve({pdf: false, urlInfo});
			}
		});
	}
	function checkPDF() {
		return ifPDF()
			.then(res => {
				if (res.pdf) {
					return Promise.resolve({isPdf: true, tabId: res.tabId, urlInfo: res.urlInfo});
				} else {
					return Promise.resolve({isPdf: false, tabId: res.tabId, urlInfo: res.urlInfo});
				}
			})
	}
	function injectPdfBar(tabId) {
		chrome.tabs.sendMessage(tabId, {fn: "getHasPdfBar"}, function(hasPdfBar) {
			if (chrome.runtime.lastError) {
				chrome.tabs.executeScript(tabId, {file: "injected/nr-ext-pdf/nr-ext-pdf.js"}, () => {
					if (chrome.runtime.lastError) {
					}
					chrome.tabs.sendMessage(tabId, {fn: "injectPdfBar"}, () => void chrome.runtime.lastError);
				});
			}
			if (!hasPdfBar) {
				chrome.tabs.sendMessage(tabId, {fn: "injectPdfBar"}, () => void chrome.runtime.lastError);
			}
		});
	}
	function injectPdfBarForOnlinePdf() {
		return ifPDF()
			.then((res) => {
				if (res.pdf && res.type === 'online' && res.urlInfo && !res.urlInfo.href.includes('naturalreaders.com/online/')) {
					injectPdfBar(res.tabId);
				}
			})
			.catch((err) => {
			});
	}
	function isOnlinePdf() {
		return ifPDF()
			.then((res) => {
				if (res.pdf && res.type === 'online') {
					return Promise.resolve(true);
				} else {
					return Promise.resolve(false);
				}
			})
			.catch(err => {
			});
	}
	function downloadPdf(request, sender, sendResponse) {
		const url = request.url;
		const xhr = new XMLHttpRequest();
		xhr.open("GET", url);
		xhr.responseType = "blob";
		xhr.onload = function() {
			chrome.tabs.create(
				{
					url: "https://www.naturalreaders.com/online/?action=openRemotePdf",
				},
				(tab) => {
					self.tabId = tab.id;
					self.remotePdf = xhr.response;
					const splitUrl = url.split("/");
					self.pdfName = splitUrl[splitUrl.length - 1];
				}
			);
		};
		xhr.send();
	}
	function setFile(request, sender, sendResponse) {
		const url = request.url;
		const xhr = new XMLHttpRequest();
		xhr.open("GET", url);
		xhr.responseType = "blob";
		xhr.onload = function() {
			chrome.tabs.create(
				{
					url: "https://www.naturalreaders.com/online/?action=openRemotePdf",
				},
				(tab) => {
					self.tabId = tab.id;
					self.remotePdf = xhr.response;
					self.pdfName = request.fileName;
				}
			);
		};
		xhr.send();
	}
	function getRemotePdf(sendResponse) {
		if (self.tabId && self.remotePdf) {
			chrome.tabs.executeScript(
				self.tabId,
				{
					code: `const blobURL = "${URL.createObjectURL(self.remotePdf)}"; const pdfName = "${self.pdfName}"`,
				},
				function() {
					chrome.tabs.executeScript(self.tabId, {
						code: `(${sendRemotePdfToPW})()`
					},
						() => {
							new Promise(resolve => {
								chrome.runtime.onMessage.addListener(function listener(request) {
									if (request.msg === 'sendRemotePdfResponse') {
										const res = request.res;
										chrome.runtime.onMessage.removeListener(listener);
										resolve(res);
									}
								});
							}).then(res => {
								sendResponse(res);
								self.remotePdf = null;
								self.tabId = null;
							})
						}
					)
				}
			)
		}
	}
	function sendRemotePdfToPW() {
		const xhr = new XMLHttpRequest();
		xhr.open("GET", blobURL);
		xhr.responseType = "blob";
		xhr.onload = function() {
			const url = URL.createObjectURL(xhr.response);
			chrome.runtime.sendMessage({msg: 'sendRemotePdfResponse', res: {blobUrl: url, pdfName}}, () => void chrome.runtime.lastError)
			self.pdfName = 'NR.pdf';
			url;
		};
		xhr.send();
	}
	init();
}
const pdfDoc = new Pdf();