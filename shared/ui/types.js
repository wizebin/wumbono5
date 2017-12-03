export function isString(input) {
  return typeof input === 'string' || input instanceof String;
}

export function isNumber(input) {
  return typeof input === 'number' || input instanceof Number;
}

export function isObject(input) {
  return Object.prototype.toString.call(input) === '[object Object]';
}

export function isFunc(input) {
  return Object.prototype.toString.call(input) === '[object Function]';
}

export function isDomNode(input) {
  if (typeof Node === 'object') {
    return input instanceof Node;
  }
  return (
    input &&
    typeof input === 'object' &&
    typeof input.nodeType === 'number' &&
    typeof input.nodeName === 'string'
  );
}

export function isDomElement(input) {
  if (typeof HTMLElement === 'object') {
    return input instanceof HTMLElement;
  }
  return (
    input &&
    typeof input === 'object' &&
    input !== null &&
    input.nodeType === 1 &&
    typeof input.nodeName === 'string'
  );
}

export function isDom(input) {
  return isDomNode(input) || isDomElement(input);
}

export function isArray(input) {
  return Object.prototype.toString.call(input) === '[object Array]';
}
