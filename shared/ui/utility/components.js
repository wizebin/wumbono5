import _ from 'underscore';
import { COMPONENT_DOM_NAME } from '../constants';
import { recurseElementsAt } from '../dom';

export function recurseElementsAtPosition(position, callback) {
  recurseElementsAt(position, (element) => {
    if (element[COMPONENT_DOM_NAME]) {
      return callback(element[COMPONENT_DOM_NAME]);
    }
  });
}

export function getNthElementAtPosition(position, nth) {
  let cur = 0;
  let result;
  recurseElementsAtPosition(position, (element) => {
    if (cur++ === nth) {
      result = element;
      return false;
    }
  });
  return result;
}

export function getAllElementsAtPosition(position) {
  const result = [];
  recurseElementsAtPosition(position, (element) => {
    result.push(element);
  });
  return result;
}

function assignOrSet(original, incoming) {
  if (typeof incoming === 'function') {
    return incoming;
  } else if (_.isObject(incoming) && original) {
    // This will change an object that is an instance of a class into a plain object!
    return Object.assign({}, original || {}, incoming);
  } else {
    return incoming;
  }
}

export function mixProps(props, ...args) {
  if (!props) props = {};
  args.forEach((propMix) => {
    _.keys(propMix).forEach((key) => {
      props[key] = assignOrSet(props[key], propMix[key]);
    });
  });
  return props;
}

export function inverseMixProps(props, ...args) {
  const result = {};
  (args.concat([props])).forEach((propMix) => {
    _.keys(propMix).forEach((key) => {
      result[key] = assignOrSet(result[key], propMix[key]);
    });
  });
  return result;
}
