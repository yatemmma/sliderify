/*
 Sliderify.js 0.0.1 Copyright (c) yatemmma.
 Available via the MIT license.
 see: https://github.com/yatemmma/Sliderify for details
*/
Function.prototype.heredoc = function() {
  return this.toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1].replace(/^\n/, '');
};

var TEMPLATE = {
  header: function() {/*
<h1><%= header %></h1>
*/},
  header_para: function() {/*
<h1><%= header %></h1>
<p><%= para %></p>
*/},
  header_bulletlist: function() {/*
<h1><%= header %></h1>
<ul>
  <% _.each(bulletlist, function(item) { %>
    <li><%= item %></li>
  <% }); %>
</ul>
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
  var templateKey = page.templateKey();
  var compiled = _.template(TEMPLATE[templateKey].heredoc());
  var $pageElement = $(compiled(page.data()));

  $wrapper = $('<div class="page '+templateKey+'" id="page-'+this.currentIndex+'">');
  $("body").empty()
           .append($wrapper.append($pageElement));
};

function Page() {
  this.config = null;
  this.items = [];
}

Page.prototype.addItem = function(item) {
  if (item[0] == 'para' && item[1].charAt(0) == "{") {
    this.config = JSON.parse(item[1].toString());
  } else {
    this.items.push(item);
  }
};

Page.prototype.isConfigOnly = function() {
  return (this.config && this.items.length == 0);
};

Page.prototype.templateKey = function() {
  var itemKeys = this.items.map(function(item) { return item[0];});
  var enabledKeys = ['header', 'para', 'bulletlist'];
  var templateKey = _.intersection(itemKeys, enabledKeys).join("_");
  return templateKey;
};

Page.prototype.data = function() {
  var data = {};
  this.items.forEach(function(item) {
    switch (item[0]) {
      case 'header':
        data[item[0]] = item[2];
        break;
      case 'para':
        data[item[0]] = item[1];
        break;
      case 'bulletlist':
        data[item[0]] = item.slice(1).map(function(x) {
          return x[1];
        });
        break;
      default:
        data[item[0]] = item[2];
        break;
    }
  });
  return data;
};

$(function() {
  var slide = new Slide();
  _slide = slide;
  slide.setKeyEvents();

  require([slide.target+'/text'], function(text) {
    var intermediate = markdown.parse(text.heredoc());

    var pages = dividePerPages(intermediate);
    if (slide.config == null && pages[0].isConfigOnly()) {
      slide.config = pages.shift().config;
    }
    slide.pages = pages;
    slide.showPage();
  });

  function dividePerPages(intermediate) {
    var items = [];
    var page = new Page();
    intermediate.shift(); // igonre first item "markdown"
    intermediate.forEach(function(content, index) {
      if (content[0] == 'hr') {
        items.push(page);
        page = new Page();
      } else {
        page.addItem(content);
      }
    });
    items.push(page);
    return items;
  }
});
