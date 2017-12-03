import component from '../component';
import { inverseMixStyle, unselectable } from '../mixStyle';

export default class button extends component {
  static getName() {
    return 'button';
  }
  static transformProps(props) {
    return inverseMixStyle(props, unselectable, {
      cursor: 'pointer',
      // display: 'inline-block',
      padding: '5px',
      border: '1px solid #333333',
      backgroundColor: '#fafafa',
      color: '#333333',
      display: 'inline-flex',
      justifyContent: 'center',
      alignItems: 'center',
    });
  }
  constructor(parent, props, content) {
    super('div', parent, button.transformProps(props), content);
  }
}
