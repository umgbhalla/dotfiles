'use strict'

// get markdown from page on popup load
chrome.tabs.executeScript({ code: 'get_post_markdown()' }, function (result) {
  process_posts(result);
});

function process_posts(markdown) {
  // place code in HTML element for use
  let code = document.createElement('code');
  code.textContent = markdown;

  // insert posts in popup window
  let post_chooser = document.getElementById('post_chooser');
  post_chooser.appendChild(code);

  let br = document.createElement('br');
  post_chooser.appendChild(br);

  // copy markdown to clipboard
  copy_text(markdown);
};

async function copy_text(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
}