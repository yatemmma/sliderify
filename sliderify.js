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
  para: function() {/*
<p><%= para %></p>
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
  })();

  this.target = queryStrings.slide || 'sample';
  this.currentIndex = location.hash.slice(1) || 0;
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
  location.hash = this.currentIndex;
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
  if (item[0] == 'para' && toString.call(item[1]) == "[object String]" && item[1].charAt(0) == "{") {
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
        data[item[0]] = convert(item).slice(1).join('');
        break;
      case 'bulletlist':
        data[item[0]] = item.slice(1).map(function(x) {
          return convert(x)[1];
        });
        break;
      default:
        data[item[0]] = item[2];
        break;
    }
  });
  return data;

  function convert(items) {
    var items = items.map(function(item) {
      if (toString.call(item) == "[object Array]") {
        if (item[0] == 'link') {
          return '<a href="'+item[1].href+'" target="_blank">'+item[2]+'</a>';
        } else if (item[0] == 'img') {
          console.log(item[1]);
          return '<img src="'+_slide.target+'/'+item[1].href+'" alt="'+(item[1].image || '')+'">';
        } else {
          return item;
        }
      }
      return item.replace(/\n/g, '<br>');
    });
    return items;
  }
};

$(function() {
  _slide = new Slide();
  _slide.setKeyEvents();

  require([_slide.target+'/text'], function(text) {
    var intermediate = markdown.parse(text.heredoc());

    console.log(intermediate);
    var pages = dividePerPages(intermediate);
    if (_slide.config == null && pages[0].isConfigOnly()) {
      _slide.config = pages.shift().config;
    }
    _slide.pages = pages;
    _slide.showPage();
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
