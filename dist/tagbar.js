(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Tagbar = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var VK_BACKSPACE = 8;
var VK_RETURN = 13;
var VK_SPACE = 32;
var VK_LEFT = 37;
var VK_UP = 38;
var VK_DOWN = 40;
var VK_DELETE = 46;


var Tagbar = function (options) {
  this.container = document.getElementById(options.container);

  this.onAdd = typeof options.onAdd === 'function' ? options.onAdd : function () {
  };
  this.onRemove = typeof options.onRemove === 'function' ? options.onRemove : function () {
  };
  this.onSuggest = typeof options.onSuggest === 'function' ? options.onSuggest : function () {
  };

  this.tags = [];
  this.selectedTag = 0;
  this.prevPos = -1;
  this.sugs = [];
  this.selectedSug = null;

  this.createNodes();
  this.attachEventListeners();

  this.resizeInput();

  this.container.appendChild(this.node);
};

module.exports = Tagbar;

Tagbar.prototype.createNodes = function() {
  this.node = document.createElement('div');

  this.node.className = 'tagbar';

  this.oList = document.createElement('span');
  this.oList.className = 'list';
  this.node.appendChild(this.oList);

  this.oInput = document.createElement('input');
  this.oInput.type = "text";
  this.oInput.setAttribute('autocomplete', 'off');
  this.oInput.setAttribute('autocorrect', 'off');
  this.oInput.setAttribute('autocapitalize', 'off');
  this.oInput.setAttribute('spellcheck', 'false');

  var oSpan = document.createElement('span');
  oSpan.className = 'input';
  oSpan.appendChild(this.oInput);

  this.oSugs = document.createElement('div');
  this.oSugs.className = 'sugs';
  oSpan.appendChild(this.oSugs);

  this.node.appendChild(oSpan);
};

Tagbar.prototype.attachEventListeners = function () {
  this.node.addEventListener('click', this.onNodeClick.bind(this));
  this.oInput.addEventListener('input', this.onInput.bind(this));
  this.oInput.addEventListener('keydown', this.onKeydown.bind(this));
  this.oInput.addEventListener('keyup', this.onKeyup.bind(this));
  this.oList.addEventListener('click', this.onListClick.bind(this));
  this.oSugs.addEventListener('click', this.onSugsClick.bind(this) );
  window.addEventListener('mousedown', this.onWindowDown.bind(this));
  window.addEventListener('touchstart', this.onWindowDown.bind(this));
};

Tagbar.prototype.destroy = function() {
  this.detachEventListeners();
  this.container.removeChild(this.node);
  this.node = null;
};

Tagbar.prototype.detachEventListeners = function () {
  window.removeEventListener('mousedown', this.onWindowDown);
  window.removeEventListener('touchstart', this.onWindowDown);
};

Tagbar.prototype.onNodeClick = function () {
  var tagbar = this;
  tagbar.deselectTag();
  tagbar.oInput.focus();
};

Tagbar.prototype.onInput = function () {
  var tagbar = this;

  tagbar.deselectTag();

  var query = tagbar.oInput.value;

  if (query.length) {
    tagbar.search(query);
  } else {
    tagbar.hideSugs();
  }
};

Tagbar.prototype.onWindowDown = function(e) {
  var tagbar = this;

  var node = e.target;

  var inside = false;

  while (node) {
    if (node == tagbar.node) {
      inside = true;
      break;
    }
    node = node.parentNode;
  }

  if (!inside) {
    tagbar.deselectTag();
    tagbar.hideSugs();

    if (tagbar.oInput.value.length > 0) {
      var newTag = tagbar.oInput.value.split(' ')[0];
      tagbar.addTag(newTag);
      tagbar.oInput.value = '';
      tagbar.resizeInput();
    }
  }

};

Tagbar.prototype.androidBackspace = function (code) {
  if (code == 229 || code == 0) {
    if (this.oInput.value.length == 0) {
      return true;
    }
  }
  return false;
};

Tagbar.prototype.onKeydown = function (e) {
  var tagbar = this;

  if (e.which === VK_UP) {
    tagbar.selectPrevSug();
    e.preventDefault();
  } else if (e.which === VK_DOWN) {
    tagbar.selectNextSug();
    e.preventDefault();
  } else if (e.which === VK_RETURN || e.which === VK_SPACE || e.target.value.indexOf(' ') >= 0) {
    e.preventDefault();

    var newTag;

    tagbar.hideSugs();

    if (tagbar.selectedSug) {
      newTag = tagbar.selectedSug.tag;
    } else {
      newTag = e.target.value.split(' ')[0];
    }

    tagbar.addTag(newTag);
    e.target.value = '';
    tagbar.resizeInput();
  } else if (e.which == VK_LEFT) {
    var pos = this.getCaretPos(tagbar.oInput);

    if (pos == 0 && tagbar.prevPos == 0) {
      if (tagbar.tags.length) {
        tagbar.selectTag(tagbar.tags[tagbar.tags.length - 1]);
      }
    }

    tagbar.prevPos = pos;

  } else if (e.which == VK_BACKSPACE || tagbar.androidBackspace(e.which)) { //samsung android chrome all characters are = 229

    if (tagbar.selectedTag) {
      tagbar.removeTag(tagbar.selectedTag);
      tagbar.selectedTag = null;
    } else if (tagbar.oInput.value.length == 0) {
      if (tagbar.tags.length) {
        tagbar.selectTag(tagbar.tags[tagbar.tags.length - 1]);
      }
    }
  } else if (e.which == VK_DELETE) {
    if (tagbar.selectedTag) {
      tagbar.removeTag(tagbar.selectedTag);
      tagbar.selectedTag = null;
      e.preventDefault();
      //tagbar.oInput.focus();
    }
  }

  if ((e.which != VK_DELETE && e.which != VK_LEFT) && tagbar.selectedTag) {
    if (tagbar.oInput.value.length > 0) {
      tagbar.deselectTag();
    }
  }
};

Tagbar.prototype.onKeyup = function () {
  var tagbar = this;
  tagbar.resizeInput();
};

Tagbar.prototype.onListClick = function (e) {
  var tagbar = this;

  tagbar.oInput.focus();
  if (e.target != tagbar.oList && e.target.nodeName == 'SPAN') {
    var tag = tagbar.findTagByNode(e.target);
    tagbar.selectTag(tag);
    e.stopPropagation();
  }
};

Tagbar.prototype.onSugsClick = function (e) {
  var tagbar = this;

  var sug = tagbar.getSugByNode(e.target);
  if (sug) {
    tagbar.addTag(sug.tag);
    tagbar.oInput.value = '';
    tagbar.resizeInput();
    tagbar.hideSugs();
    tagbar.focus();
  }
  e.stopPropagation();
};

Tagbar.prototype.getCaretPos = function(input) {
  var pos = 0;

  if (document.selection) {
    var selection = document.selection.createRange();
    selection.moveStart('character', -input.value.length);
    pos = selection.text.length;
  } else if (input.selectionStart || input.selectionStart == '0') {
    pos = input.selectionStart;
  }

  return pos;
};

Tagbar.prototype.hasTag = function (name) {
  for (var i = 0; i < this.tags.length; i++) {
    var tag = this.tags[i];
    if (tag.name == name) {
      return true;
    }
  }
  return false;
};

Tagbar.prototype.addTag = function (name) {
  name = name.toLowerCase();

  if (!name.length) return;

  if (this.hasTag(name)) {
    return;
  }

  this.tags.push({
    name: name,
    node: null
  });

  this.render();

  this.onAdd(name);
};

Tagbar.prototype.setTags = function (names) {
  this.tags = [];
  for (var i = 0; i < names.length; i++) {
    var name = names[i];

    this.tags.push({
      name: name,
      node: null
    });
  }

  this.render();
};

Tagbar.prototype.removeTag = function (tag) {
  var n = this.tags.indexOf(tag);
  if (n >= 0) {
    this.tags.splice(n, 1);

    this.render();

    this.onRemove(tag.name);
  }
};

Tagbar.prototype.getTagList = function () {
  var list = [];
  for (var i = 0; i < this.tags.length; i++) {
    list.push(this.tags[i].name);
  }

  return list;
};

Tagbar.prototype.render = function () {
  this.selectedTag = null;

  while (this.oList.firstChild) {
    this.oList.removeChild(this.oList.firstChild);
  }

  var oList = document.createDocumentFragment();

  for (var i = 0; i < this.tags.length; i++) {
    var tag = this.tags[i];

    var span = document.createElement('span');
    var text = document.createTextNode(tag.name);
    span.appendChild(text);
    span.setAttribute('title', tag.name);
    oList.appendChild(span);

    text = document.createTextNode(' ');
    oList.appendChild(text);

    tag.node = span;
  }

  this.oList.appendChild(oList);

  if (this.tags.length) {
    this.oInput.setAttribute('placeholder', '');
  } else {
    this.oInput.setAttribute('placeholder', 'tags');
  }
};

Tagbar.prototype.findTagByNode = function (node) {
  for (var i = 0; i < this.tags.length; i++) {
    var tag = this.tags[i];
    if (tag.node == node) {
      return tag;
    }
  }
  return 0;
};

Tagbar.prototype.selectTag = function (tag) {

  if (this.selectedTag) {
    this.selectedTag.node.className = '';
    this.selectedTag = null;
  }
  tag.node.className = 'selected';
  this.selectedTag = tag;
};

Tagbar.prototype.deselectTag = function () {
  if (this.selectedTag) {
    this.selectedTag.node.className = '';
    this.selectedTag = null;
  }
};

Tagbar.prototype.resizeInput = function () {
  var len = this.oInput.value.length;
  if (len < 4) len = 4;
  this.oInput.setAttribute('size', len + 1);
};

Tagbar.prototype.focus = function () {
  this.oInput.focus();
};

Tagbar.prototype.renderSugs = function (tags) {
  this.sugs = [];
  this.selectedSug = null;

  var oTmp = document.createDocumentFragment();

  var n = 0;

  for (var i = 0; i < tags.length && n < 6; i++) {
    var tag = tags[i];

    if (this.hasTag(tag)) continue;

    var oTag = document.createElement('div');

    oTag.appendChild(document.createTextNode(tag));

    oTmp.appendChild(oTag);

    this.sugs.push({
      tag: tag,
      node: oTag
    });

    n++;
  }

  this.oSugs.innerHTML = '';

  this.oSugs.appendChild(oTmp);

  if (tags.length) {
    this.showSugs();
  } else {
    this.hideSugs();
  }
};

Tagbar.prototype.search = function (query) {
  var tagbar = this;

  this.onSuggest(query, function (tags) {
    tagbar.renderSugs(tags);
  });
};

Tagbar.prototype.selectNextSug = function () {
  if (!this.sugs.length) return;

  var i = 0;

  if (this.selectedSug) {
    this.selectedSug.node.className = '';
    i = this.sugs.indexOf(this.selectedSug);
    i++;
  }

  if (i < this.sugs.length) {
    this.selectedSug = this.sugs[i];
  }

  this.selectedSug.node.className = 'selected';
};

Tagbar.prototype.selectPrevSug = function () {
  var i = -1;

  if (this.selectedSug) {
    this.selectedSug.node.className = '';
    i = this.sugs.indexOf(this.selectedSug);
    i--;
  }

  if (i >= 0) {
    this.selectedSug = this.sugs[i];
    this.selectedSug.node.className = 'selected';
  } else {
    this.selectedSug = null;
  }
};

Tagbar.prototype.getSugByNode = function (node) {
  for (var i = 0; i < this.sugs.length; i++) {
    var sug = this.sugs[i];
    if (sug.node == node) {
      return sug;
    }
  }
  return null;
};

Tagbar.prototype.showSugs = function () {
  this.oSugs.className = 'sugs';
};

Tagbar.prototype.hideSugs = function () {
  this.oSugs.className = 'sugs hide';
};

},{}]},{},[1])(1)
});