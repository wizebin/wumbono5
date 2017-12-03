import _ from 'underscore';
// import get from 'lodash.get';
import component from '../component';

export default function(details) {
  const detailProps = _.omit(details.props, 'concerns');
  // const concerns = get(details, 'props.concerns') || {};
  return class extends component {
    constructor(parent, content, props) {
      const passProps = { ...detailProps, ...props };
      if (detailProps && props) {
        if (detailProps.style && props.style) {
          passProps.style = Object.assign({}, detailProps.style, props.style);
        }
      }
      super({ type: details.type, content }, parent, passProps);
    }
  };
}
