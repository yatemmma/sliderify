var params = getQueryStrings();
var _name = params.slide || 'sample';
var _currentPageIndex = 0;
var _contents = [];

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
  require([_name+'/contents'], function(contents) {
    _contents = contents();
    showPage(_currentPageIndex);
  });
});

function prev() {
  if (_currentPageIndex <= 0) return;
  showPage(--_currentPageIndex);
}

function next() {
  if (_currentPageIndex >= _contents.length - 1) return;
  showPage(++_currentPageIndex);
}

function showPage(index) {
  var c = _contents[index];
  $('.page').hide();
  if (!c) c = {type:'notfound'};
  eval('setContent_'+c.type).call(this, c);
  $('#'+c.type).show();
}

function setContent_notfound(c) {}

function setContent_title(c) {
  var $page = $('#title');
  $page.find('.title').text(c.title);
}

function setContent_desc(c) {
  var $page = $('#desc');
  $page.find('.title').text(c.title);
  $page.find('.desc').text(c.desc);
}

function setContent_list(c) {
  var $page = $('#list');
  $page.find('.title').text(c.title);
  $page.find('.list').empty();
  for (i in c.list) {
    $page.find('.list').append($('<li>').text(c.list[i]));
  }
}

function setContent_introduction(c) {
  var $page = $('#introduction');
  $page.find('.image').empty()
                      .append($('<img>').attr({src:_name+'/'+c.image}));
  $page.find('.name').text(c.name);
  $page.find('.account').text(c.account);
  $page.find('.desc').text(c.desc);
}
