import component from '../component';
import { inverseMixStyle, unselectable } from '../mixStyle';

export default class toggle extends component {
  static getName() {
    return 'toggle';
  }
  static transformProps(props) {
    return inverseMixStyle(props, unselectable, {
      cursor: 'pointer',
      // display: 'inline-block',
      padding: '2px',
      border: '1px solid currentColor',
      backgroundColor: '#fafafa',
      color: 'currentColor',
      display: 'inline-flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '18px',
      height: '18px',
      fontSize: '14px',
      verticalAlign: 'middle',
    });
  }
  constructor(parent, props, content) {
    super('div', parent, toggle.transformProps(props), content);

    this.listenForEvent('click', this.toggle);
    this.setState({ value: this.props.initialValue || false });
  }

  getValue() {
    return this.state.value;
  }

  setValue(value) {
    this.setState({ value });
    this.props.onChange && this.props.onChange(this.state.value);
  }

  toggle = () => {
    this.setValue(!this.state.value);
  }

  render() {
    this.state.value ? this.setContent('&#10003;') : this.setContent('');
  }

}
