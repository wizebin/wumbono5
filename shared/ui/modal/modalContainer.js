import Component from '../component';
import { create, createFromGhost } from '../ui';
import { inverseMixProps } from '../utility/components';

export class modalContainer extends Component {
  static transformProps(props) {
    return inverseMixProps(props, { style: { position: 'absolute', left: '0px', bottom: '0px', right: '0px', top: '0px', zIndex: '100', display: 'none' } });
  }

  constructor(parent, props, ...args) {
    super('div', parent, modalContainer.transformProps(props), ...args);
  }

  closeModal(data, cancel) {
    if (this.container) {
      this.container.setParent(null);
      this.container = null;
      this.callback && this.callback({ cancel, data });
      this.callback = () => {};
      this.applyStyle({ display: 'none' });
    }
  }

  showModal(element, callback) {
    this.closeModal(null, true);
    this.callback = callback || (() => {});
    this.container = create('bodyContainer', 'div', this, { style: { zIndex: '100', position: 'absolute', left: '0px', right: '0px', top: '0px', bottom: '0px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } });
    create('modalBackground', 'div', this.container, { onClick: () => {
      this.closeModal(null, true);
    }, style: { position: 'absolute', left: '0px', right: '0px', top: '0px', bottom: '0px', backgroundColor: '#000', color: '#fff', opacity: '.5' } });
    createFromGhost(element, this.container);
    this.applyStyle({ display: 'block' });
  }

  confirm(title, description, buttonOk, buttonCancel, containerStyle = {}, okStyle = {}, cancelStyle = {}) {
    return new Promise((resolve) => {
      const container = create('confirmDiv', 'div', null, { style: { display: 'flex', flexDirection: 'column', width: '80%', maxWidth: '500px', ...containerStyle } });

      create('title', 'h2', container, {}, title);
      create('description', 'p', container, {}, description);
      const buttonDiv = create('buttonDiv', 'div', container, { style: { display: 'flex', justifyContent: 'flex-end' } });
      create('buttonCancel', 'plainButton', buttonDiv, { style: { border: '1px solid currentColor', padding: '6px', ...okStyle }, onClick: () => { this.closeModal(null, true); } }, buttonCancel || 'Cancel');
      const okButton = create('buttonOk', 'plainButton', buttonDiv, { style: { marginLeft: '10px', border: '1px solid currentColor', padding: '6px', ...cancelStyle }, onClick: () => { this.closeModal({ ok: true }, false); } }, buttonOk || 'OK');
      this.showModal(container, (data) => { resolve(data); });
      okButton.focus();

      this.keyDownMoveHandler = container.listenForEvent('keydown', (evt) => {
        if (evt.key === 'Enter'){
          evt.preventDefault();
          evt.cancelBubble = true;
          this.closeModal({ ok: true }, false);
          container.clearEventHandlers();
        } else if (evt.key === 'Escape'){
          evt.preventDefault();
          evt.cancelBubble = true;
          this.closeModal(null, true);
          container.clearEventHandlers();
        }
      }, true);
    });
  }
}

export default new modalContainer();