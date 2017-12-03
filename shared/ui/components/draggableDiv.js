import draggable from './draggable';

export default class draggableDiv extends draggable {
  static getName() {
    return 'draggableDiv';
  }
  constructor(...args) {
    super('div', ...args);
  }
};