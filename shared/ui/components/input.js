import _ from 'underscore';
import { createGhost } from '../ui';
import component from '../component';
import { unselectable } from '../mixStyle';
import { inverseMixProps } from '../utility/components';

export default class input extends component {
  static getName() {
    return 'input';
  }
  static transformProps(props) {
    return inverseMixProps(props, {
      style: {
        ...unselectable,
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }
    });
  }
  getValue() {
    return this.field && this.field.view().getValue();
  }
  setValue(value) {
    this.field && this.field.view().setValue(value);
  }
  constructor(parent, props) {
    super('div', parent, input.transformProps(props));
  }
  shouldPropsUpdate(props) {
    return !_.isEqual(props.value, this.props.value) || !_.isEqual(props.style, this.props.style);
  }
  render() {
    // console.log('this.props == ', JSON.stringify(this.props));
    this.field = createGhost(undefined, 'input', this, _.pick(this.props, ['value', 'placeholder', 'onInput', 'onChange']));

    return this.field;
  }
}
