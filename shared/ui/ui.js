import _ from 'underscore';
import get from 'lodash.get';
import classFromDetails from './components/classFromDetails';
import component from './component';
import { createThrottledEvent } from './events';
import Ghost from './ghost';
import * as types from './types';

const cachedClasses = {};

function componentWrapper(type) {
  if (!cachedClasses[type]) {
    const tempClass = class dycomponent extends component {
      static get name() { return type || 'dycomponent' }
      constructor(...args) {
        super(type, ...args);
      }
    };
    cachedClasses[type] = tempClass;
  }
  return cachedClasses[type];
}

class ui {
  constructor() {
    this.types = {};
  }

  exists(typeName) {
    return _.has(this.types, typeName);
  }

  registerNewType(type, details) {
    this.registerExistingType(classFromDetails(details));
  }

  registerExistingType(type, existing) {
    this.types[type] = existing;
  }

  register(typeObject) {
    if (_.isObject(typeObject)) {
      _.keys(typeObject).forEach((key) => {
        this.registerExistingType(key, typeObject[key]);
      } ,this);
    }
  }

  getClassFromType(type) {
    if (_.isString(type) && this.exists(type)) {
      return this.types[type];
    } else if (typeof type === 'function') {
      return type;
    }
    return componentWrapper(type);
  }

  getNameFromType(type) {
    if (_.isString(type)) return type;
    else if (typeof type === 'function') {
      if (type.getName) return type.getName();
      if (type.prototype.name) return type.prorotype.name;
    }
    return type;
  }

  create = (type, parent, props, children, name) => {
    const classType = this.getClassFromType(type);
    const passName = name ? name : parent && this.getNameFromType(type) + parent.getQueueIndex();
    if (passName && parent && parent.getChild(passName)) {
      const ret = parent.getChild(passName);
      if (classType.transformProps) {
        ret.setProps(classType.transformProps(props));
      } else {
        ret.setProps(props);
      }
      ret.conceive(children);
      ret.preventClean();
      // ret.rerender(); // true means don't clear children, the parent took care of that in it's rerender
      return ret;
    }
    const ret = new classType(parent, props, children, passName);
    if (!!passName && !ret.name) {
      ret.setName(passName);
    } else {
      if (ret.autonamed) {
        ret.autonamed = false;
        ret.setName(passName);
      }
    }
    ret.componentWasCreated();
    return ret;
  }
}

const globalUi = new ui;
createThrottledEvent('resize', 'throttledResize');

export function spawn(element, parent, props, children) {
  return create(undefined, element, parent, props, children);
}

export function create(name, element, parent, props, children) {
  let spawnling;
  if (element instanceof component) {
    spawnling = element;
    element.setName(name);
    element.setParent(parent);
    element.conceive(children);
  } else {
    spawnling = globalUi.create(element, parent, props, children, name);
  }
  spawnling.resetOrdinalInParent();
  return spawnling;
}

export function createGhost(name, host, parent, props, children) {
  return new Ghost({ name, host, parent, props, children });
}

export function createFromGhost(ghost, manualParent, manualProps) {
  let result = null;
  let name = undefined;

  if (ghost instanceof Ghost) {
    const isChildArray = _.isArray(ghost.children);
    const passChildren = !isChildArray ? ghost.children : undefined;
    result = create(ghost.name, ghost.host, manualParent || ghost.parent, manualProps ? { mustOrdinal: true, ...(ghost.props || {}), ...manualProps } : ghost.props, passChildren);
    name = ghost.name;
    ghost.element = result;
    if (isChildArray) {
      ghost.element && ghost.element.queueClean();
      ghost.children.forEach((child) => {
        if (child instanceof Ghost) {
          createFromGhost(child, result);
          child.element && child.element.resetOrdinalInParent(true);
          child.element.render(); // This should not be necessary, but when passing components in as props then rendering them they are removed if we don't render the component after creation...
        } else if (child instanceof component) {
          result.conceive(child);
        } else if (child) {
          result.conceive(child);
        }
      });
      ghost.element && ghost.element.finalizeClean();
    }
  } else if (ghost instanceof component) {
    result = ghost;
    name = ghost.name;
    if (manualParent) {
      manualParent.conceive(ghost);
    }
  } else {
    // TODO: Possibly depracate this if input/text components don't use it. Only create elements through ghosts or components
    result = spawn(ghost, manualParent, manualProps);
    name = result.name;
  }

  if (!result.mounted && types.isDomElement(result.parent) || result.parent.mounted) {
    result.onMounted();
  }

  return result;
}

export function register(classDeclaration) {
  const name = classDeclaration.getName ? classDeclaration.getName() : classDeclaration.name;
  globalUi.register({ [name]: classDeclaration });
  return classDeclaration;
}

export const body = typeof (document) !== 'undefined' && globalUi.create(document.body);

export default globalUi;
