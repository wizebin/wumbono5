import { createGhost } from './ui';

module.exports = function jsx(jsxObject) {
  return createGhost(jsxObject.attributes.name, jsxObject.elementName, null, jsxObject.attributes, jsxObject.children);
};