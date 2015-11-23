/*
 Sliderify.js Copyright (c) yatemmma.
 Available via the MIT license.
 see: https://github.com/yatemmma/Sliderify for details
*/
Sliderify.version = '0.0.2';

Function.prototype.heredoc = function() {
  return this.toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1].replace(/^\n/, '');
};

var TEMPLATE = {
  multiple: function() {/*
<%= html %>
*/},
  single: function() {/*
<%= html %>
*/}
};

function Sliderify() {
  var queryStrings = (function() {
    var items = window.location.search.slice(1).split('&');
    var params = {}
    items.forEach(function(item) {
      var keyValue = item.split('=');
      params[keyValue[0]] = keyValue[1];
    });
    return params;
  })();

  console.log(queryStrings);
  this.target = queryStrings.slide || 'sample';
  this.currentIndex = location.hash.slice(1) || 0;
  this.pages = [];

  var $link = $('<link>').attr('rel', "stylesheet")
                         .attr('media', "all")
                         .attr('href', this.target+'/custom.css');
  $("head").append($link);
}
Sliderify.prototype.setKeyEvents = function() {
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
  $('body').on('click', function(e) {
    if (e.target.tagName == 'A') return;
    if ($('body').width()/2 - e.screenX > 0) {
      slide.prev();
    } else {
      slide.next();
    }
  });
};

Sliderify.prototype.prev = function() {
  if (this.currentIndex <= 0) return;
  this.currentIndex--;
  this.showPage();
};

Sliderify.prototype.next = function() {
  if (this.currentIndex >= this.pages.length - 1) return;
  this.currentIndex++;
  this.showPage();
};

Sliderify.prototype.showPage = function() {
  location.hash = this.currentIndex;
  var page = this.pages[this.currentIndex];
  var templateKey = page.tags.length == 1 ? 'single' : 'multiple'; //TODO: get tag from html tree.
  var data = {html: page.html.join('')};
  var compiled = _.template(TEMPLATE[templateKey].heredoc());
  var $pageElement = $(compiled(data));

  $wrapper = $('<div class="page '+templateKey+'" id="page-'+this.currentIndex+'">');
  $("body").empty()
           .append($wrapper.append($pageElement));
};

$(function() {
  _slider = new Sliderify();
  _slider.setKeyEvents();

  require([_slider.target+'/text'], function(text) {
    var intermediate = markdown.parse(text.heredoc());
    var pages = dividePerPages(intermediate);
    if (!_slider.config && pages[0].config && pages[0].html.length <= 0) {
      _slider.config = pages.shift().config;
    }
    _slider.pages = pages;
    _slider.showPage();
  });

  function dividePerPages(intermediate) {
    var pages = [];
    var page = {html: [], tags: []};
    intermediate.shift(); // igonre first item "markdown"
    intermediate.forEach(function(content, index) {
      if (content[0] == 'hr') {
        pages.push(page);
        page = {html: [], tags: []};
      } else if (content[0] == 'para'
                 && toString.call(content[1]) == "[object String]"
                 && content[1].charAt(0) == "{") {
        page.config = content[1];
      } else {
        content.forEach(function(item, index) {
          if (toString.call(item) == "[object String]") return;
          if (item[0] == 'img') {
            item[1].href = _slider.target+'/'+item[1].href;
          } else if (item[0] == 'link') {
            item[1].target = '_blank';
          }
        });
        var json = ['markdown'].concat([content]);
        page.tags.push(json[1][0]);
        var html = markdown.toHTML(json);
        page.html.push(html);
      }
    });
    pages.push(page);
    return pages;
  }
});
