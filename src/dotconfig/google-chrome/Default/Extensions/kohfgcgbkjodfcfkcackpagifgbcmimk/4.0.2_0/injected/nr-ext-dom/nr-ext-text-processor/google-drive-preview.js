var doc = doc && doc.type === 'googleDrivePreview' ? doc : new function() {
  let self = this;
  self.type = "googleDrivePreview";
  let textsToRead = [];
  let viewport, pages;
  let pageIndex = 0;
  self.getPageIndex = getPageIndex;
  self.getPages = getPages;
  self.getCurrentIndex = getCurrentIndex;
  self.scrollToAdjacentPage = function(direction) {
    return new Promise((resolve) => {
      let page = null;
      if (direction === 'next') {
        if (pageIndex < pages.length - 1 && pageIndex !== -1) {
          page = pages[pageIndex + 1];
        } else {
          resolve("ERR");
        }
      } else {
        if (pageIndex > 0) {
          page = pages[pageIndex - 1];
        } else if (pageIndex === -1) {
          page = pages[pages.length - 2];
        }
        else {
          resolve("ERR");
        }
      }
      viewport.scrollTop = $(page).position().top;
      resolve();
    })
      .catch((err) => {
      });
  }
  self.scrollToPage = function(index) {
    return new Promise((resolve) => {
      let page = null;
      if (index >= 0 && index < pages.length) {
        page = pages[index];
      } else {
        resolve("ERR");
      }
      viewport.scrollTop = $(page).position().top;
      resolve();
    })
      .catch((err) => {
      });
  }
  function getCurrentIndex() {
    let d = $("[role=document]:visible").eq(0);
    viewport = d.parent().get(0);
    pages = d.children().slice(d.children().first().is("[role=button]") ? 2 : 1);
    let index = 0;
    for (let i = 0; i < pages.length; i++) {
      if (pages.eq(i).position().top > viewport.scrollTop + $(viewport).height() / 2) {
        index = i;
        break;
      }
    }
    return index - 1;
  }
  self.getTexts = function(op = 'all') {
    pageIndex = getCurrentIndex();
    chrome.runtime.sendMessage({'fn': 'setPageIndex', index: pageIndex}, () => void chrome.runtime.lastError);
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
        return Promise.resolve([]);
      });
  }
  this.parseForConvertToPdf = function() {
    return new Promise(async (resolve) => {
      getCurrentIndex();
      let elements = [];
      let oldScrollTop = viewport.scrollTop;
      for (let i = 0; i < pages.length; i++) {
        elements = elements.concat(await parseForConvertToPdfHelper(i));
      }
      viewport.scrollTop = oldScrollTop;
      resolve(elements);
    })
      .then((elements) => {
        return elements;
      })
      .catch((err) => {
      });
  }
  function parseForConvertToPdfHelper(index = 0) {
    return new Promise((resolve) => {
      let page = pages.get(index);
      if (page) {
        viewport.scrollTop = $(page).position().top;
        let checkPageInView = setInterval(async function() {
          if (pages.get(getCurrentIndex()) === page) {
            clearInterval(checkPageInView);
            resolve($("p", page).get());
          }
        }, 500);
      } else {
        resolve();
      }
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
  function reset() {
    return Promise.resolve()
      .then(() => {
        textsToRead = [];
      }).catch(err => {
      });
  }
  function getTextsOfPage(index, op = 'all') {
    let page = pages.get(index);
    return new Promise((resolve) => {
      if (page) {
        viewport.scrollTop = $(page).position().top;
        let checkPageInView = setInterval(async function() {
          if (pages.get(getCurrentIndex()) === page) {
            clearInterval(checkPageInView);
            return tryGetTexts(getTexts.bind(page), 3000)
              .then(function(result) {
                if (op === 'all') {
                  result = processSentencesByLength(result);
                }
                textsToRead = textsToRead.concat(result);
                resolve();
              })
          }
        }, 500);
      }
    })
      .catch((err) => {
      });
  }
  function getTexts() {
    let texts = $("p", this).get()
      .map(getInnerText)
      .filter(isNotEmpty);
    return fixParagraphs(texts);
  }
  function getPages() {
    return pages;
  }
  function getPageIndex() {
    return pageIndex;
  }
}
