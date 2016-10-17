const markdown = require("markdown").markdown
const Progress = require("./progress")

class Sliderify {
  constructor() {
    const params = this.parseQueryStrings();
    const key = params.slide || "sample";
    this.loadCustomCSS(key);
    this.loadPages(key)
        .then((pages)=>{
          this.pages = pages;
          this.appendPages(pages);
          this.addEvents();
          
          this.progress = new Progress(this.pages.length, params.limit, params.time);
          this.progress.process();
          if (params.progress === "true") this.toggleProgress();
          
          this.current = location.hash.slice(1) || 1;
          this.showCurrentPage();
        });
  }
  
  appendPages(pages) {
    pages.forEach((html, i) => {
      const page = document.createElement("div");
      page.innerHTML = `<div class="box">${pages[i]}</div>`;
      page.id = `p${i+1}`;
      page.className = "page hidden";
      document.querySelector("#slide").appendChild(page);
    });
  }
  
  loadCustomCSS(key) {
    const element = document.createElement("link");
    element.rel = "stylesheet";
    element.media = "all";
    element.href = `${key}/custom.css`;
    document.head.appendChild(element);
  }
  
  parseMarkdown(raw) {
    const intermediate = markdown.parse(raw, 'Maruku');
    let html = markdown.toHTML(intermediate);
    html = html.replace(/(\<code\>)/gi, "<pre>$1");
    html = html.replace(/(\<\/code\>)/gi, "$1</pre>");
    html = html.replace(/(\<a href=)/gi, "<a target='_blank' href=");
    return html;
  }
  
  loadPages(key) {
    return new Promise((resolve, reject)=>{
      this.loadMarkdown(key)
          .then(()=>{
            const html = this.parseMarkdown(d.heredoc());
            const pages = html.split("<hr/>");
            resolve(pages);
          });  
    });
  }
  
  loadMarkdown(key) {
    const element = document.createElement("script");
    element.type = "text/javascript";
    element.src = `${key}/md.js`;
    document.body.appendChild(element);
    
    function isElementExitst(callback) {
      if (typeof(d) === "undefined") {
        setTimeout(()=>{
          isElementExitst(callback);
        }, 100);
      } else {
        callback();
      }
    }
    return new Promise((resolve, reject)=>{
      isElementExitst(resolve);
    });
  }
  
  parseQueryStrings() {
    const items = window.location.search.slice(1).split('&');
    const params = {}
    items.forEach((item) => {
      var keyValue = item.split('=');
      params[keyValue[0]] = keyValue[1];
    });
    return params;
  }
  
  addEvents() {
    window.onhashchange = () => {
      this.jump(location.hash.slice(1));
    }
    document.addEventListener('keydown', (e) => {
      e = e || window.event;
      switch (e.keyCode) {
        case 37: // left
        case 38: // up
          this.prev();
          break;
        case 39: // right
        case 40: // down
          this.next();
          break;
        case 70: // f
          this.fullScreen();
          break;
        case 80: // p
        case 83: // s
          this.toggleProgress();
      }
    });
  }
  
  pageCount() {
    return this.pages.length;
  }
  
  next() {
    if (this.current >= this.pageCount()) {
      return;
    }
    this.togglePage(this.current);
    this.current++;
    this.showCurrentPage();
  }
  
  prev() {
    if (this.current <= 1) {
      return;
    }
    this.togglePage(this.current);
    this.current--;
    this.showCurrentPage();
  }
  
  jump(index) {
    this.togglePage(this.current);
    this.current = index;
    this.showCurrentPage();
  }
  
  showCurrentPage() {
    this.current;
    this.togglePage(this.current);
    location.hash = this.current;
    this.progress.setProgress("#progress-page", this.pageCount(), this.current);
  }
  
  togglePage(index) {
    const element = document.querySelector(`#p${index}`);
    if (element.classList.contains("current")) {
      element.classList.remove("current");
      element.classList.add("hidden");
    } else {
      element.classList.remove("hidden");
      element.classList.add("current");
    }
  }
  
  toggleProgress() {
    const element = document.querySelector("#progress");
    if (element.classList.contains("hidden")) {
      element.classList.remove("hidden");  
    } else {
      element.classList.add("hidden");
    }
  }
  
  fullScreen() {
    const el = document.querySelector(".current");
    const request = el.requestFullscreen
                 || el.webkitRequestFullScreen
                 || el.mozRequestFullScreen
                 || el.msRequestFullscreen;
    request.call(el);
  }
}

module.exports = Sliderify
