var doc = doc && doc.type === 'googleDriveDoc' ? doc : new function() {
  this.type = 'googleDriveDoc';
  let self = this;
  let textsToRead = [];
  let sentenceIndex = 0;
  let viewport = $(".drive-viewer-paginated-scrollable").get(0);
  let pages = $(".drive-viewer-paginated-page");
  self.getCurrentIndex = function() {
    for (let i = 0; i < pages.length; i++) if (pages.eq(i).position().top > viewport.scrollTop + $(viewport).height() / 2) break;
    return i - 1;
  }
  this.getTexts = function(op = 'all') {
    return new Promise(async (resolve) => {
      await reset();
      resolve();
    })
      .then(async () => {
        let promises = [];
        promises.push(await parse(op));
        return Promise.all(promises);
      })
      .then(() => {
        return new Promise((resolve) => {
          resolve(textsToRead);
        });
      })
      .catch((err) => {
      });
  }
  function parse(op = 'all') {
    if (op === 'all') {
      let oldScrollTop = viewport.scrollTop;
      return getTextsOfPage(getCurrentIndex())
        .then(() => {
          viewport.scrollTop = oldScrollTop;
          return Promise.resolve();
        });
    } else {
      return parseAllPages();
    }
  }
  function parseAllPages() {
    return new Promise(async (resolve) => {
      let oldScrollTop = viewport.scrollTop;
      for (let i = 0; i < pages.length; i++) {
        await getTextsOfPage(i);
      }
      viewport.scrollTop = oldScrollTop;
      resolve();
    })
      .catch((err) => {
      });
  }
  function getTextsOfPage(index, op = 'all') {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({'fn': 'setPageIndex', index}, () => void chrome.runtime.lastError);
      let page = pages.get(index);
      if (page) {
        viewport.scrollTop = $(page).position().top;
        return tryGetTexts(getTexts.bind(page), 3000)
          .then((result) => {
            if (op === 'all') {
              result = processSentencesByLength(result);
            }
            textsToRead = textsToRead.concat(result);
            resolve();
          });
      } else {
        resolve();
      }
    })
      .catch((err) => {
      });
  }
  function reset() {
    return Promise.resolve()
      .then(() => {
        textsToRead = [];
        sentenceIndex = 0;
      }).catch(err => {
      });
  }
  function getTexts() {
    let texts = $("p", this).get()
      .map(getInnerText)
      .filter(isNotEmpty);
    return fixParagraphs(texts);
  }
}
