function get_post_markdown() {
      // save post content to main
      let main = document.createElement('div');
      main.innerHTML = document.querySelectorAll('[data-test-id="post-content"]')[0].innerHTML;
      // remove sidebar
      main.firstElementChild.firstElementChild.remove();
      // remove footer
      main.firstElementChild.lastElementChild.remove();

      // convert post to markdown
      let turndown = new TurndownService();
      let markdown = turndown.turndown(main)

      return markdown;
}