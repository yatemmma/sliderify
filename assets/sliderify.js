var params = getQueryStrings();
var _name = params.slide || 'sample';
var _currentPageIndex = 0;
var _contents = [];
var _slideConfig = null;

function getQueryStrings() {
    var url = window.location.search;
    var items = url.slice(1).split('&');
    var params = {}
    items.forEach(function(item) {
      var keyValue = item.split('=');
      params[keyValue[0]] = keyValue[1];
    });
    return params;
}

function Page() {
  this.config = {};
  this.items = [];
}
Page.prototype.setConfig = function(config) {
  this.config = config;
}
Page.prototype.addItem = function(item) {
  this.items.push(item);
}
Page.prototype.type = function() {
  return this.items.map(function(item) {
    return item[0];
  }).join('_');
}

$(function() {
  $(window).keyup(function(e) {
    switch (e.keyCode) {
      case 37: // left
      case 38: // up
        prev();
        break;
      case 39: // right
      case 40: // down
        next();
        break;
    }
  });

  require([_name+'/document'], function(document) {
    var $link = $('<link>');
    $link.attr('rel',"stylesheet");
    $link.attr('media',"all");
    $link.attr('href',_name+'/custom.css');
    $("head").append($link);

    var text = document.toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1].replace(/^\n/, "");
    console.log(markdown.parse(text));
    console.log(markdown.parse(text).toString());
    _contents = toJson(markdown.parse(text));
    console.log(_contents);
    showPage(_currentPageIndex);

    var compiled = _.template("<div>hello: <%= name %></div>");
    $("#header").append($(compiled({name: 'momotaro'})));
  });
});

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

function prev() {
  if (_currentPageIndex <= 0) return;
  showPage(--_currentPageIndex);
}

function next() {
  if (_currentPageIndex >= _contents.length - 1) return;
  showPage(++_currentPageIndex);
}

function showPage(index) {
  var page = _contents[index];
  $('.page').hide();

  var type = page.type();

  eval('setContent_'+type).call(this, page);
  $('#'+type).show();
}

function setContent_header(page) {
  var $page = $('#header');
  $page.find('.header').text('xxxx');
}

// function setContent_notfound(c) {}
//
// function setContent_title(c) {
//   var $page = $('#title');
//   $page.find('.title').text(c.title);
// }
//
// function setContent_desc(c) {
//   var $page = $('#desc');
//   $page.find('.title').text(c.title);
//   $page.find('.desc').text(c.desc);
// }
//
// function setContent_list(c) {
//   var $page = $('#list');
//   $page.find('.title').text(c.title);
//   $page.find('.list').empty();
//   for (i in c.list) {
//     $page.find('.list').append($('<li>').text(c.list[i]));
//   }
// }
//
// function setContent_introduction(c) {
//   var $page = $('#introduction');
//   $page.find('.image').empty()
//                       .append($('<img>').attr({src:_name+'/'+c.image}));
//   $page.find('.name').text(c.name);
//   $page.find('.account').text(c.account);
//   $page.find('.desc').text(c.desc);
// }
