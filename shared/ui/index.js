import _ from 'underscore';
import ui, { register } from './ui';
export * from './ui';
import * as components from './components';
import component from './component';

ui.register({ component });
_.values(components).forEach(port => register(port.default));

export default ui;
