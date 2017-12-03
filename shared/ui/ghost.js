export default class ghost {
  constructor({ name, host, parent, props, children }) {
    this.element = null;
    this.name = name;
    this.host = host;
    this.parent = parent;
    this.props = props;
    this.children = children;
  }

  view() {
    return this.element;
  }
}