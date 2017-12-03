import _ from 'underscore';
import * as types from './types';
import * as dom from './dom';
import * as position from './domPosition';
import { COMPONENT_DOM_NAME } from './constants';
import { createFromGhost } from './ui'; // This cyclical dependency may screw up mocha
import Ghost from './ghost';

let nextId = 0;

let ioMeasure = null;
if (typeof(window) !== 'undefined') {
  window.ioMeasure = {};
  ioMeasure = window.ioMeasure;

  window.averageIoMeasure = function(measureTotal = false, thenClear = false) {
    const result = _.keys(ioMeasure).map((key) => {
      const item = ioMeasure[key];
      let total = 0;
      if (!item.timing) item.timing = [];
      for(const time in item.timing) {
        total += item.timing[time];
      }
      return {
        ...item,
        key,
        avgTime: item.timing.length > 0 ? (total / item.timing.length) : 0,
        totalTime: total,
        renders: item.timing.length,
      };
    }).sort((first, second) => {
      return measureTotal ? second.totalTime - first.totalTime : second.avgTime - first.avgTime;
    });

    if (thenClear) ioMeasure = {};

    return result;
  };
} else {
  global.ioMeasure = {};
  ioMeasure = window.ioMeasure;
}

function setTiming(element, timing) {
  if (!ioMeasure[element.id]) ioMeasure[element.id] = {};
  const el = ioMeasure[element.id];
  if (!el.element) el.element = element;
  if (!el.timing) el.timing = [];
  el.timing.push(timing);
}

export default class component {
  static transformProps(props) {
    return props;
  }
  static getName() {
    return 'component';
  }
  constructor(host, parent, props, children, name) {
    const id = (props && props.id) || nextId++;
    this.queueIndex = 0;
    this.ordinalChild = 0;
    if (host) {
      if (types.isDom(host)) {
        this.dom = host;
        this.applyProps(props);
      } else if (types.isString(host)) {
        this.dom = dom.createDomElement(host, props);
      } else if (types.isObject(host) && host.type) {
        this.dom = dom.createDomElement(host.type, props);
        this.setContent(host);
      } else {
        this.dom = dom.createDomElement('div', props);
      }
    }
    this.host = host;
    this.setId(id);
    this.children = [];
    this.namedChildren = {};
    this.childMap = {};
    // this.namedChildren = {};
    this.type = (this.dom && this.dom.nodeName || '').toLowerCase();
    // if (name) {
    this.setName(name);
    // } else {
    //   this.setName((parent ? this.type + parent.getQueueIndex() : this.type + id));
    //   this.autonamed = true;
    // }
    if (!props || !props.className && this.type !== 'svg') {
      this.applyProps({ className: this.constructor.name });
    }
    this.conceive(children);
    this.eventHandlers = [];
    this.props = {};
    this.swapVisibleStyle = null;
    this.hidden = false;
    this.mounted = false;
    this.setParent(parent || null);
    if (document.body.contains(this.dom)) {
      this.onMounted();
    }
    this.state = {};
    this.setProps(props, true);
  }

  calculateChildMap() {
    this.childMap = (this.children || []).reduce((childMap, child, index) => {
      childMap[child.id] = index;
      return childMap;
    }, {});
  }

  abandon(child, circulate = true, calculateMap = true) {
    if (circulate) child.setParent(null, false);
    this.children.splice(this.childMap[child.id], 1);
    calculateMap && this.calculateChildMap();
    if (_.has(this.namedChildren, child.getName())) {
      delete(this.namedChildren[child.getName()]);
    }
    if (child.parent === this) dom.removeChild(this.dom, child.dom);
  }

  setProps(props, norender) {
    if (props) {
      if (props.id && props.id !== this.props.id) {
        this.setId(props.id);
      }
      if (props.style && !_.isEqual(props.style, this.props.style)) {
        this.setStyle(props.style);
      }
      // if (props.value && props.value !== this.props.value) {
      //   this.applyProps({ value: props.value });
      // }
      /// XXX: TODO: Remove this equality check!!! Speed speed speed
      if (!_.isEqual(this.props, props)) {
        const that = this;
        this.applyProps(this.props ? _.omit(props, function(value, key) { return that.props[key] === value; }) : props);
      }
      if (props.noMousedownBubble && !this.mouseListener) {
        this.mouseListener = this.listenForEvent('mousedown', this.stopEvent);
        this.touchListener = this.listenForEvent('touchstart', this.stopEvent);
        // this.touchMoveListener = this.listenForEvent('touchmove', this.stopEvent);
        this.clickListener = this.listenForEvent('click', this.stopEvent);
      } else if (!props.noMousedownBubble) {
        if (this.clickListener) {
          this.unlisten(this.clickListener);
          this.clickListener = null;
        }
        if (this.mouseListener) {
          this.unlisten(this.mouseListener);
          this.mouseListener = null;
        }
        if (this.touchListener) {
          this.unlisten(this.touchListener);
          this.touchListener = null;
        }
      }
    }
    this.componentWillReceiveProps(props);
    const shouldUpdate = !norender && this.shouldPropsUpdate(props, this.state);
    this.props = Object.assign(this.props || {}, props);
    // this.applyProps(props);
    // this.componentDidUpdate();
    if (shouldUpdate) this.rerender();
  }

  replaceProps(props) {
    this.setProps(props);
    this.props = props;
  }

  applyProps(props) {
    if (this.dom) {
      dom.applyPropsToElement(this.dom, props, true);
    }
  }

  applyStyle(style) {
    if (this.dom) {
      dom.applyDomStyles(this.dom, style);
    }
  }

  appendChild(child, circulate = true) {
    if (!child) return undefined;
    if (!(child instanceof component)) {
      return this.appendChild(new component(child));
      ///XXX: todo: spawn/create instead here
    }
    if (!this.hasChild(child)) {
      this.children.push(child);
      this.childMap[child.id] = this.children.length - 1;
      // this.namedChildren[child.getName()] = child;
      if (child.getName()) this.namedChildren[child.getName()] = child;
    }
    if (circulate && child.parent !== this) child.setParent(this, false);
    dom.appendElement(this.dom, child.dom);
    child.canClean = false;
    return child;
  }

  bubble = (eventName, ...args) => {
    const toBubble = this[eventName] ? this[eventName](...args) : true;

    if (toBubble !== false && this.parent) {
      this.parent.bubble(eventName, ...args);
    }
  }

  clearChildren() {
    this.children.forEach(child => this.abandon(child, true, false));
    this.namedChildren = {};
    this.calculateChildMap();
  }

  componentWasCreated() {this.rerender();}
  componentDidMount() {}
  componentDidUpdate() {}
  componentDidRender() {}
  componentWillReceiveProps() {}
  // shouldComponentUpdate() { return true; }
  shouldStateUpdate(state) { return !_.isEqual(this.state, state); }
  shouldPropsUpdate(props) { return !_.isEqual(this.props, props); }

  conceive(children) {
    if (children) {
      if (_.isArray(children)) {
        children.forEach(child => this.conceive(child), this);
        return this; // XXX: This can cause cyclical reference bugs if used improperly!
      } else if (_.isString(children)) {
        this.setContent(children);
        return this; // XXX: This can cause cyclical reference bugs if used improperly!
      } else if (children instanceof component) {
        return this.appendChild(children);
      } else if (children instanceof Ghost) {
        return createFromGhost(children, this);
      }
    }
  }

  clearEventHandlers() {
    if (this.eventHandlers) {
      this.eventHandlers.forEach((handler) => {
        const eventContainer = handler.onWindow ? window : this.dom;
        eventContainer.removeEventListener(handler.name, handler.callback, handler.capture);
      });
      this.eventHandlers = [];
    }
  }

  clone(parent, props, copyProps = false, cloneChildren = true, currentLevel = 0, maxLevel = undefined) {
    let host = this.host;
    if (types.isDom(host)) {
      host = dom.clone(host);
    }
    const result = new component(host, null, { ...(copyProps ? this.props : { style: this.props.style || {} }), ...props });
    if (cloneChildren && (maxLevel === undefined || currentLevel < maxLevel)) {
      if (this.content) {
        result.setValue(this.content);
      }
      this.children.forEach((child) => {
        child.clone(result, {}, copyProps, cloneChildren, currentLevel + 1, maxLevel);
      });
    }
    result.setParent(parent);
    return result;
  }

  getChildArray() {
    return this.children;
  }

  getDropData() {
    return this.constructor.name;
  }

  getName() {
    return this.name;
  }

  getState() {
    return this.state;
  }

  getStyle(stylename) {
    return dom.getDomStyle(this.dom, stylename);
  }

  getScroll() {
    return position.getElementScroll(this.dom);
  }

  setScroll(scroll) {
    return position.setElementScroll(this.dom, scroll);
  }

  getValue() {
    if (this.type === 'input' || this.type === 'select' || this.type === 'textarea') {
      return this.dom.value;
    } else {
      return this.dom.innerHTML;
    }
  }

  hasChild(child) {
    return _.has(this.childMap, child.id);
  }

  getChild(childName) {
    return this.namedChildren[childName];
  }

  queueClean() {
    this.ntrickle('startClean', 1);
    this.queueIndex = 0;
    this.ordinalChild = 0;
    this.preventClean();
  }

  getNextOrdinal() {
    return this.ordinalChild++;
  }

  resetOrdinalInParent(force) {
    if (this.parent && (force || (this.parent.props && this.parent.props.mustOrdinal))) {
      dom.setElementOrdinal(this.dom, this.parent.getNextOrdinal());
    }
  }

  getQueueIndex() {
    return this.queueIndex++;
  }

  startClean() {
    this.canClean = true;
  }

  preventClean() {
    this.canClean = false;
  }

  getCleanable() {
    return this.canClean;
  }

  finalizeClean() {
    this.ntrickle('removeIfClean', 1);
  }

  removeIfClean() {
    if (this.canClean) {
      this.setParent(null, true);
    }
  }

  show(toShow) {
    if (toShow) {
      if (this.hidden !== false) {
        if (this.swapVisibleStyle) {
          this.applyStyle({ display: this.swapVisibleStyle });
          this.swapVisibleStyle = null;
        } else {
          this.removeStyle('display');
        }
        this.hidden = false;
      }
    } else {
      if (this.hidden !== true) {
        if (!this.swapVisibleStyle) {
          this.swapVisibleStyle = this.getStyle('display');
        }
        this.applyStyle({ display: 'none' });
        this.hidden = true;
      }
    }
  }

  shown() {
    return !this.hidden;
  }

  setId(id) {
    this.id = id;
    this.dom.id = id;
  }

  listenForEvent(eventName, callback, onWindow = false, capture = false) {
    const eventContainer = onWindow ? window : this.dom;
    if (eventContainer) {
      eventContainer.addEventListener(eventName, callback || this, capture);
      this.eventHandlers.push({ onWindow, name: eventName, callback: callback || this, capture });
      return this.eventHandlers[this.eventHandlers.length - 1];
    }
    return undefined;
  }

  handleEvent(event) {
    return event;
  }

  stopEvent(evt) {
    evt.cancelBubble = true;
  }

  onReceiveDrop(/*element*/) {}
  onMount() {}
  onResize() { }
  onUnmount() {this.clearEventHandlers();}
  onResized = () => { this.trickle('onResize'); };
  onUnmounted = () => { this.trickle('onUnmount'); };
  onReceivedDrop = (element) => {
    this.bubble('onReceiveDrop', element);
  }
  onMounted = () => {
    this.children.forEach(child => child.onMounted());
    if (this.mounted) {
      // if the component was already mounted and we somehow got here, resize this and children
      this.onResized();
    } else {
      this.onMount();
      this.componentDidMount();
      this.mounted = true;
    }
  };

  position() {
    return position.getElementPos(this.dom);
  }

  renameChild(prevName, nextName, child) {
    if (prevName) {
      delete(this.namedChildren[prevName]);
    }
    const existingChild = this.namedChildren[nextName];
    if (existingChild) {
      if (existingChild && existingChild !== child) {
        this.parent.abandon(existingChild);
      }
    }
    this.namedChildren[nextName] = child;
  }

  rerender(unclearable) {
    // const startTime = performance.now();
    if (!unclearable) this.queueClean();
    const ghost = this.render();
    if (_.isArray(ghost)) {
      ghost.forEach(item => createFromGhost(item, this));
    } else if (ghost instanceof Ghost) {
      createFromGhost(ghost, this);
    } else if (ghost) {
      this.conceive(ghost);
    }
    this.componentDidRender();
    if (!unclearable) this.finalizeClean();
    // setTiming(this, performance.now() - startTime);
  }

  render() {
    this.children.forEach(child => child.rerender());
  }

  removeStyle(styleName) {
    if (this.dom) {
      dom.removeDomStyle(this.dom, styleName);
    }
  }

  setParent(parent, circulate = true) {
    const currentParent = this.parent;
    if (currentParent) {
      currentParent.abandon(this, false);
    }
    if (!!this.parent && !parent) {
      this.dom[COMPONENT_DOM_NAME] = null;
      this.onUnmount();
    } else {
      if (!!parent && !this.parent && parent.mounted) {
        this.onMounted();
      }
      this.dom[COMPONENT_DOM_NAME] = this;
    }
    this.parent = parent ? parent.view() : null;
    if (this.parent && circulate) {
      this.parent.view().appendChild(this, false);
    }
  }

  replaceState(state, norender) {
    const shouldUpdate = !norender && this.shouldStateUpdate(this.props, state);
    this.state = state;
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        shouldUpdate && this.rerender();
        this.componentDidUpdate();
        resolve();
      });
    });
  }

  setState(state, norender) {
    const shouldUpdate = !norender && this.shouldStateUpdate(this.props, state);
    this.state = Object.assign(this.state || {}, state);
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        shouldUpdate && this.rerender();
        this.componentDidUpdate();
        resolve();
      });
    });
  }

  setStyle(style) {
    if (this.dom) {
      dom.setDomStyles(this.dom, style);
    }
  }

  size() {
    return position.getElementSize(this.dom);
  }

  scrollSize() {
    return position.getElementScrollSize(this.dom);
  }

  setContent(content, force) {
    if (this.type === 'input' || this.type === 'select' || this.type === 'textarea') {
      if (force || (this.content !== content && this.dom.value !== content)) this.dom.value = content;
    } else {
      if (force || (this.content !== content)) this.dom.innerHTML = content;
    }
    this.content = content;
  }

  setName(name) {
    if (this.name === name) return;
    if (!name) {
      this.name = name;
      return;
    }
    const oldName = this.name;
    this.name = name;
    if (this.parent) {
      this.parent.renameChild(oldName, name, this);
    }
  }

  // Force is necessary if you don't set content in a callback (via onInput or similar)
  setValue(content, force) {
    this.setContent(content, force);
  }

  trickleDown = (eventName, runHere = false, ...args) => {
    /*const keepTrickling = */!runHere || this[eventName] ? this[eventName](...args) : true;
    // if (!keepTrickling) return true;
    for(var child = this.children.length - 1; child >= 0; child--) {
      if (!this.children[child].trickle(eventName, true, ...args)) {
        return false;
      }
    }
    return true;
  };

  trickle = (eventName, ...args) => {
    /*const keepTrickling = */this[eventName] ? this[eventName](...args) : true;
    // if (!keepTrickling) return true;
    for(var dex = this.children.length - 1; dex >= 0; dex--) {
      const child = this.children[dex];
      if (!child.trickle(eventName, true, ...args)) {
        return false;
      }
    }
    return true;
  };

  ntrickle = (eventName, depth, currentDepth = 0, ...args) => {
    /*const keepTrickling = */this[eventName] ? this[eventName](...args) : true;
    if (depth <= currentDepth) return true;
    // Trickle has to go backwards in the case of element cleaning
    for(var child = this.children.length - 1; child >= 0; child--) {
      if (!this.children[child].ntrickle(eventName, depth, currentDepth + 1, ...args)) {
        return false;
      }
    }
    return true;
  };

  unlisten(listener) {
    const dex = this.eventHandlers.indexOf(listener);
    if (dex >= 0) {
      const handler = this.eventHandlers[dex];
      const eventContainer = handler.onWindow ? window : this.dom;
      eventContainer.removeEventListener(handler.name, handler.callback, handler.capture);
      this.eventHandlers.splice(dex, 1);
    }
  }

  view() {
    return this;
  }

  focus() {
    if (this.dom && this.dom.focus) {
      this.dom.focus();
    }
  }
}
