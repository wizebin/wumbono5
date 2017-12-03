import _ from 'underscore';

export function upperFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function upperAllFirst(str) {
  return str.split(' ').map(function(st) {
    return upperFirst(st);
  }).join(' ');
}

export function makereadable(str) {
  if (_.isEmpty(str))
    return str;
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/(?:\r\n|\r|\n)/g, '<br/>').replace(/(?:[\t ])/g, '&nbsp;&nbsp;');
}

export function makereadableline(str) {
  if (_.isEmpty(str))
    return str;
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/(?:\r\n|\r|\n)/g, ' ');
}

export function randomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

String.prototype.escapeSpecialChars = function() {
  return this.replace(/\\\\/g,'\\\\')
    .replace(/\\n/g, '\\n')
    .replace(/\\'/g, "\\'")
    .replace(/\\"/g, '\\"')
    .replace(/\\&/g, '\\&')
    .replace(/\\r/g, '\\r')
    .replace(/\\t/g, '\\t')
    .replace(/\\b/g, '\\b')
    .replace(/\\f/g, '\\f');
};

export function randomString() {
  var chars = []; // 97 - 122 lower case // 65 - 90 upper case
  for(var a = 0; a < Math.floor(Math.random() * 10) + 5; a++) {
    chars.push(Math.floor(Math.random() * (122 - 97)) + 97);
  }

  return String.fromCharCode.apply(this, chars);
}

export function getEvaluatedString(str) {
  const exp = new RegExp('`', 'g');
  const escaped = `\`${str.replace(exp,'\\`')}\``;
  const ret = eval(escaped);
  return ret;
}

// https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
export function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
    return String.fromCharCode('0x' + p1);
  }));
}

export function b64DecodeUnicode(str) {
  return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}
