import component from '../component';

export default class text extends component {
  static getName() {
    return 'text';
  }
  constructor(parent, title, props) {
    super({ type: 'div', content: title }, parent, props);
  }
}
