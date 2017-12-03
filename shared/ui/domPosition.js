import mouse from './domMouse';

export function getMousePos() {
  return mouse.currentPos();
}

export function getElementScroll(elem) {
  return { x: elem.pageXOffset || elem.scrollLeft, y: elem.pageYOffset || elem.scrollTop };
}

export function setElementScroll(elem, position) {
  if (elem.pageXOffset !== undefined) {
    elem.pageXOffset = position.x;
    elem.pageYOffset = position.y;
  } else {
    elem.scrollLeft = position.x;
    elem.scrollTop = position.y;
  }
}

export function getElementSize(elem) {
  var box = elem.getBoundingClientRect();
  return { w: box.right - box.left, h: box.bottom - box.top };
}

export function getElementScrollSize(elem) {
  return { w: elem.scrollWidth, h: elem.scrollHeight };
}

export function getElementPos(elem) {
  var box = elem.getBoundingClientRect();
  return { x: box.left, y: box.top };
}

export function getOffsetRect(elem) {
  var box = elem.getBoundingClientRect();
  var body = document.body;
  var docElem = document.documentElement;
  var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
  var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
  var clientTop = docElem.clientTop || body.clientTop || 0;
  var clientLeft = docElem.clientLeft || body.clientLeft || 0;
  var top  = box.top +  scrollTop - clientTop;
  var left = box.left + scrollLeft - clientLeft;

  return { x: Math.round(left), y: Math.round(top), w: box.right - box.left, h: box.bottom - box.top };
}

export function getPositionInParent(elem) {
  if (elem && elem.parentElement) {
    var elemOff = getOffsetRect(elem);
    var parOff = getOffsetRect(elem.parentElement);
    var parScroll = getElementScroll(elem.parentElement);
    return { x: elemOff.x - parOff.x + parScroll.x, y: elemOff.y - parOff.y + parScroll.y, w: elemOff.w, h: elemOff.h };
  }
  return undefined;
}

export function getPositionInAncestor(elem, ancestor) {
  if (ancestor === elem || elem === null) {
    return { x: 0, y: 0};
  }
  var pos = getPositionInParent(elem, ancestor, elem.parentElement);
  var recursed = getPositionInAncestor(elem.parentElement, ancestor);
  var box = elem.getBoundingClientRect();
  return { x: pos.x + recursed.x, y: pos.y + recursed.y, w: box.right - box.left, h: box.bottom - box.top };
}

export function getRelativeMousePos(elem) {
  var mouse = getMousePos();
  var off = getOffsetRect(elem);
  var scroll = getElementScroll(elem);
  return {x: mouse.x - off.x + scroll.x, y: mouse.y - off.y + scroll.y};
}
