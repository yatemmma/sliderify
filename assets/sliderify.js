/*
 sliderify.js 0.0.1 Copyright (c) yatemmma.
 Available via the MIT license.
 see: https://github.com/yatemmma/sliderify for details
*/

var _slideConfig = null;

Function.prototype.heredoc = function() {
  return this.toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1].replace(/^\n/, "");
};

var Template = {
  aaa: function() {/*
<div>
  hello: <%= name %>
</div>
<a>xxx</a>
*/}
};

function Slide() {
  var queryStrings = (function() {
    var items = window.location.search.slice(1).split('&');
    var params = {}
    items.forEach(function(item) {
      var keyValue = item.split('=');
      params[keyValue[0]] = keyValue[1];
    });
    return params;
  });

  this.target = queryStrings.slide || 'sample';
  this.currentIndex = queryStrings.page || 0;
  this.pages = [];

  var $link = $('<link>').attr('rel', "stylesheet")
                         .attr('media', "all")
                         .attr('href', this.target+'/custom.css');
  $("head").append($link);
}

Slide.prototype.setConfig = function(item) {
  console.log("config!"); //TODO
};

Slide.prototype.setItems = function(items) {
  this.pages = items.map(function(item) {
  return item; //TODO
  });
};

Slide.prototype.setKeyEvents = function() {
  var slide = this;
  $(window).keyup(function(e) {
    switch (e.keyCode) {
      case 37: // left
      case 38: // up
        slide.prev();
        break;
      case 39: // right
      case 40: // down
        slide.next();
        break;
    }
  });
};

Slide.prototype.prev = function() {
  if (this.currentIndex <= 0) return;
  this.currentIndex--;
  this.showPage();
};

Slide.prototype.next = function() {
  if (this.currentIndex >= this.pages.length - 1) return;
  this.currentIndex++;
  this.showPage();
};

Slide.prototype.showPage = function() {
  var page = this.pages[this.currentIndex];

  var compiled = _.template(page.template().heredoc());
  var $pageElement = $(compiled(page.data()));

  $("body").empty()
           .append($pageElement);
};


function Page() {
  this.config = null;
  this.items = [];
}
Page.prototype.setConfig = function(item) {
  this.config = item; //TODO
};
Page.prototype.addItem = function(item) {
  this.items.push(item); //TODO
};
Page.prototype.type = function() {
  return this.items.map(function(item) {
    return item[0];
  }).join('_');
};
Page.prototype.template = function() {
  return Template.aaa; //TODO
};
Page.prototype.data = function() {
  return {name: 'momotaro'}; //TODO
};
Page.prototype.isConfigOnly = function() {
  return true; //TODO
};

$(function() {
  var slide = new Slide();
  slide.setKeyEvents();

  require([slide.target+'/text'], function(text) {
    var intermediate = markdown.parse(text.heredoc());

    var items = dividePerPages(intermediate);
    if (!slide.config && items[0].isConfigOnly()) {
      slide.setConfig = items.shift();
    }
    slide.setItems(items);
    // console.log(intermediate);
    console.log(slide.pages);
    slide.showPage();

  });
});

function dividePerPages(intermediate) {
  var items = [];
  var page = new Page();
  intermediate.shift(); // igonre first item "markdown"
  intermediate.forEach(function(content, index) {
    switch (content[0]) {
      case 'hr':
        items.push(page);

        // if (!_slideConfig && page.items == 0) {
        //   _slideConfig = page;
        // } else {
        //   codes.push(page);
        // }
        // page = new Page();
        break;
        console.log(content);
      case 'para':
        page.addItem(content);
        // var text = content[1];
        // if (text.charAt(0) == "{") {
        //   page.setConfig(text);
        // } else {
        //   page.addItem(content);
        // }
        console.log(content);
        break;
      default:
        page.addItem(content);
        console.log(content);
        break;
    }
  });
  items.push(page);
  return items;

  // var page = new Page();
  // contents.shift(); // igonre first item "markdown"
  // contents.forEach(function(content, index) {
  //   switch (content[0]) {
  //     case 'hr':
  //       if (!_slideConfig && page.items == 0) {
  //         _slideConfig = page;
  //       } else {
  //         codes.push(page);
  //       }
  //       page = new Page();
  //       break;
  //     case 'para':
  //       var text = content[1];
  //       if (text.charAt(0) == "{") {
  //         page.setConfig(text);
  //       } else {
  //         page.addItem(content);
  //       }
  //       break;
  //     default:
  //       page.addItem(content);
  //       console.log(content);
  //       break;
  //   }
  // });
  // codes.push(page);
  // return codes;
}

function toJson(contents) {
  var codes = [];
  var page = new Page();
  contents.shift(); // igonre first item "markdown"
  contents.forEach(function(content, index) {
    switch (content[0]) {
      case 'hr':
        if (!_slideConfig && page.items == 0) {
          _slideConfig = page;
        } else {
          codes.push(page);
        }
        page = new Page();
        break;
      case 'para':
        var text = content[1];
        if (text.charAt(0) == "{") {
          page.setConfig(text);
        } else {
          page.addItem(content);
        }
        break;
      default:
        page.addItem(content);
        console.log(content);
        break;
    }
  });
  codes.push(page);
  return codes;
}
