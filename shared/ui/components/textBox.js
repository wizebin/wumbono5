import component from '../component';
import { create } from '../ui';
import { inverseMixStyle } from '../mixStyle';
export default class textBox extends component {
  static getName() {
    return 'textBox';
  }
  constructor(parent, props, content) {
    super('div', parent, props);
    this.content = content
    this.rerender();
  }

  setValue = (value) => {
    this.input.setValue(value);
  }

  getValue = () => {
    return this.input && this.input.getValue() || this.content;
  }

  setContent = (content) => {
    this.input.setContent(content);
  }

  conceive = (value) => {
    this.setValue(value);
  }

  render = () => {
    this.input = create('input', 'input', this, inverseMixStyle(this.props, { width: '100%' }), this.getValue());
  };
};
