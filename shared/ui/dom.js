import _ from 'underscore';
import { isObject, isString, isDomElement, isFunc } from './types';

export function adopt(parent, element) {
  if (parent) {
    if (isString(parent)) {
      const parent = document.getElementById(parent);
      parent && parent.appendChild(element);
    } else if (parent.appendChild) {
      parent.appendChild(element);
    }
  }
}

export function appendElement(parent, child) {
  parent.appendChild(child);
}

export function abandon(element) {
  element.parentElement && element.parentElement.removeChild(element);
}

export function prependElement(parent, child) {
  if (parent.firstChild !== null) {
    parent.insertBefore(child, parent.firstChild);
  } else{
    parent.appendChild(child);
  }
}

export function getPageWidth() {
  if (self.innerHeight) {
    return self.innerWidth;
  }
  if (document.documentElement && document.documentElement.clientHeight) {
    return document.documentElement.clientWidth;
  }
  if (document.body) {
    return document.body.clientWidth;
  }
}

export function removeAllChildren(element) {
  while (element && element.lastChild) element.removeChild(element.lastChild);
}

export function removeChild(parent, child) {
  parent.removeChild(child);
}

export function createDomElement(element, props) {
  const ret = document.createElement(element);
  if (ret && props) {
    applyPropsToElement(ret, props);
  }
  return ret;
}

export function applyDomStyles(element, styles) {
  _.keys(styles).forEach((key) => {
    element.style[key] = styles[key];
  });
}

export function setDomStyles(element, styles) {
  element.style.cssText = '';
  applyDomStyles(element, styles);
}

export function removeDomStyle(element, styleName) {
  element.style.removeProperty(styleName);
}

export function getDomStyle(element, styleName) {
  return element.style[styleName];
}

const passValues = {
  autoFocus: { name: 'autofocus' },
  name: { name: 'name' },
  href: { name: 'href' },
  src: { name: 'src' },
  checked: { name: 'checked' },
  type: { name: 'type' },
  placeholder: { name: 'placeholder' },
  maxLength: { name: 'maxLength' },
  className: { name: 'className' },
  innerHTML: { name: 'innerHTML' },
  scrollLeft: { name: 'scrollLeft' },
  scrollTop: { name: 'scrollTop' },
  style: { name: 'style' },
  title: { name: 'title' },
  value: { name: 'value', onlyInput: true },
  text: { name: 'text' },
  label: { name: 'label' },
  autoCapitalize: { name: 'autocapitalize', onlyInput: true },
  autoCorrect: { name: 'autocorrect', onlyInput: true },
  selected: {name: 'selected' },
};

const passEvents = {
  onClick: { name: 'onclick' },
  onContextMenu: { name: 'oncontextmenu' },
  onDblClick: { name: 'ondblclick' },
  onMouseDown: { name: 'onmousedown' },
  onMouseEnter: { name: 'onmouseenter' },
  onMouseLeave: { name: 'onmouseleave' },
  onMouseMove: { name: 'onmousemove' },
  onMouseOver: { name: 'onmouseover' },
  onMouseOut: { name: 'onmouseout' },
  onMouseUp: { name: 'onmouseup' },
  onKeyDown: { name: 'onkeydown' },
  onKeyPress: { name: 'onkeypress' },
  onKeyUp: { name: 'onkeyup' },
  onChange: { name: 'onchange', onlyInput: true },
  onInput: { name: 'oninput', onlyInput: true },
  onFocus: { name: 'onfocus' },
  onDrag: { name: 'ondrag' },
  onDragEnd: { name: 'ondragend' },
  onDragEnter: { name: 'ondragenter' },
  onDragLeave: { name: 'ondragleave' },
  onDragOver: { name: 'ondragover' },
  onDragStart: { name: 'ondragstart' },
  onDrop: { name: 'ondrop' },
  onTouchStart: { name: 'ontouchstart' },
  onTouchEnd: { name: 'ontouchend' },
  onTouchCancel: { name: 'ontouchcancel' },
  onTouchMove: { name: 'ontouchmove' },
  onAnimationStart: { name: 'animationstart' },
  onAnimationIteration: { name: 'animationiteration' },
  onAnimationEnd: { name: 'animationend' },
  onTransitionEnd: { name: 'transitionend' },
};

export const propWhiteList = {
  ...passValues,
  ...passEvents,
};

// const passFuncs = {
//   blur: 'blur',
//   focus: 'focus',
//   removeAttribute: 'removeAttribute',
//   scrollIntoView: 'scrollIntoView',
// };

function isInputElement(el) {
  return (
    el instanceof HTMLInputElement ||
    el instanceof HTMLSelectElement ||
    el instanceof HTMLTextAreaElement
  );
}

function keyForFieldname(el, key, verifyProps = true) {
  if (verifyProps) {
    const isWhiteListed = (_.has(propWhiteList, key));
    if (!isWhiteListed) return undefined;

    const verifiedInputStatus = propWhiteList[key].onlyInput ? isInputElement(el) : true;
    if (!verifiedInputStatus) return undefined;
  }
  return propWhiteList[key] ? propWhiteList[key].name : key;
}

export function applyPropsToElement(el, props, verifyProps = true) {
  if (props != undefined) {
    var keys = _.keys(props);
    keys.forEach(function(key) {
      const betterKey = keyForFieldname(el, key, verifyProps);
      if (betterKey) {
        if (isObject(props[key])) {
          var subKeys = _.keys(props[key]);
          if (!el[betterKey]) el[betterKey] = {};
          subKeys.forEach(function(innerKey) {
            el[betterKey][innerKey] = props[key][innerKey];
          });
        } else {
          el[betterKey] = props[key];
        }
      }
    },this);
  }
}

export function applyChildrenToElement(el, children) {
  if (children) {
    if (Array.isArray(children)) {
      children.forEach(function(child) {
        var tempchild = isDomElement(child) ? child : child.view;
        if (tempchild) el.appendChild(tempchild);
      }, this);
    } else if (isString(children)) {
      el.value = children;
      el.innerHTML = children;
    } else if (isObject(children)) {
      var keys = _.keys(children);
      if (!el.kids) el.kids = {}; // named children
      keys.forEach(function(key) {
        var child = isDomElement(children[key]) ? children[key] : children[key].view;
        if (child) {
          el.appendChild(child);
          el.kids[key] = child;
        }
      },this);
    } else {
      el.innerHTML = JSON.stringify(children);
    }
  }
}

function spawn(element, parent, props, children) {
  var el = null;
  if (isString(element)) {
    el = document.createElement(element);
    adopt(parent, el);
    applyChildrenToElement(el, children);
  } else if (isFunc(element)) {
    el = new element(parent, props);
    if (el && el.view) {
      applyChildrenToElement(el.view, children);
    }
  } else {
    return null;
  }
  applyPropsToElement(el, props);
  return el;
}

export function spawnFromHtml(code, parent, props, children) {
  var tmp = spawn('div', null, {}, code);
  if (tmp.children.length === 1) {
    var el = tmp.children[0];
    applyPropsToElement(el, props);
    adopt(parent, el);
    applyChildrenToElement(el, children);
    return el;
  }
  return undefined;
}

export function getChildren(element) {
  if (isDomElement(element)) {
    return [].slice.call(element.children);
  } else if (isDomElement(element.view)) {
    return [].slice.call(element.view.children);
  }
  return [];
}

export function getRecursiveChildren(element, depth) {
  if (depth === undefined) depth = 0;
  if (depth > 10) return [];
  var kids = getChildren(element);
  var ret = kids;
  kids.forEach(function(child) {
    ret = ret.concat(getRecursiveChildren(child, depth++));
  });
  return ret;
}

//http://stackoverflow.com/a/20584396
export function nodeScriptReplace(node) {
  if ( nodeScriptIs(node) === true ) {
    node.parentNode.replaceChild( nodeScriptClone(node) , node );
  }
  else {
    let i = 0;
    let children = node.childNodes;
    while ( i < children.length ) {
      nodeScriptReplace( children[i++] );
    }
  }
  return node;
}

export function nodeScriptIs(node) {
  return node.tagName === 'SCRIPT';
}

export function nodeScriptClone(node) {
  var script  = document.createElement('script');
  script.text = node.innerHTML;
  for(var i = node.attributes.length - 1; i >= 0; i--) {
    script.setAttribute( node.attributes[i].name, node.attributes[i].value );
  }
  return script;
}

export function fixElementScripts(elid) {
  nodeScriptReplace(document.getElementById(elid));
}

export function setElementContentWithScripts(element, content) {
  if (element == null)
    return false;
  if (typeof element === 'string') {
    element = document.getElementById(element);
  }
  element.innerHTML = content;
  nodeScriptReplace(element);
  return true;
}

export function addEnterCallback(element, callback, keycode) {
  element.addEventListener('keyup', (event) => {
    if (event.keyCode === (keycode || 13)) {
      callback && callback(event, element);
    }
  });
}

export function findElementZ(element) {
  if (element !== undefined) {
    if (element.style && element.style.zIndex) {
      return parseInt(element.style.zIndex);
    }
    return findElementZ(element.parentElement);
  }
  return 0;
}

export function recurseElementsAt(position, func) {
  const element = document.elementFromPoint(position.x, position.y);

  if (!element || element === document.body || element === document.html) return;

  if (func(element) !== false) {
    const visibility = element.style.visibility;
    element.style.visibility = 'hidden';
    recurseElementsAt(position, func);
    element.style.visibility = visibility;
  }
}

export function slowElementsUnder(position) {
  const ret = [];
  recurseElementsAt(position, element => ret.push(element));
  return ret;
}

export function clone(element) {
  const ret = element.cloneNode(true);
  abandon(ret);
  return ret;
}

export function getElementOrdinal(element) {
  if (!element.parentElement) return undefined;
  return Array.prototype.indexOf.call(element.parentElement.children, element);
}

export function setElementOrdinal(element, ordinal) {
  if (!element.parentElement) return false;
  if (getElementOrdinal(element) === ordinal) return true;

  const children = element.parentElement.children;

  if (children.length >= ordinal - 1) {
    if (children.length === 0 || children[children.length - 1] !== element) {
      element.parentElement.appendChild(element);
    }
  } else {
    if (children[ordinal] !== element) {
      element.parentElement.insertBefore(element, element.parentElement.children[ordinal]);
    }
  }
  return true;
}
