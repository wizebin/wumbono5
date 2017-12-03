import _ from 'underscore';

export function thatWrapper(instance) {
  var that = this;
  if (this != instance)
    this.that = instance;
  var prototype = Object.getPrototypeOf(instance);
  var keys = _.keys(instance).concat(_.keys(prototype));
  keys.forEach(function(key) {
    if (typeof(instance[key]) === 'function') that[key] = instance[key].bind(instance);
  },this);
}

export function me(instance) {
  if (!instance.transformedInstanceThis) {
    thatWrapper.call(instance, instance);
    instance.transformedInstanceThis = true;
  }
  // if (props) {
  //   Object.assign(instance, props);
  // }
  return instance;
}
