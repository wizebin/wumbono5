import component from '../component';
import { inverseMixStyle, unselectable } from '../mixStyle';

export default class plainButton extends component {
  static getName() {
    return 'plainButton';
  }
  static transformProps(props) {
    return inverseMixStyle(props, unselectable, {
      cursor: 'pointer',
      display: 'inline-flex',
      justifyContent: 'center',
      alignItems: 'center',
    });
  }
  constructor(parent, props, content) {
    super('div', parent, plainButton.transformProps(props), content);
  }
}
