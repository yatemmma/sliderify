'use strict'

const Sliderify = require("./sliderify");

window.onload = () => {
  new Sliderify();
}

Function.prototype.heredoc = function() {
  return this.toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1].replace(/^\n/, '');
};
