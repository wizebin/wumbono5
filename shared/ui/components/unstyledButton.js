import component from '../component';
import { inverseMixStyle, unselectable } from '../mixStyle';

export default class unstyledButton extends component {
  static getName() {
    return 'unstyledButton';
  }
  constructor(parent, props, content) {
    super('div', parent, inverseMixStyle(props, unselectable, {
      cursor: 'pointer',
    }), content);
  }
}
