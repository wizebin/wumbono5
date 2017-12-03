export function mixStyle(props, ...args) {
  if (!props) props = {};
  props.style = Object.assign({}, props.style || {}, ...args);
  return props;
}

export function inverseMixStyle(props, ...args) {
  if (!props) props = {};
  props.style = Object.assign({}, ...args, props.style || {});
  return props;
}

export const unselectable = {
  webkitTouchCallout: 'none',
  webkitUserSelect: 'none',
  khtmlUserSelect: 'none',
  mozUserSelect: 'none',
  msUserSelect: 'none',
  userSelect: 'none',
};
