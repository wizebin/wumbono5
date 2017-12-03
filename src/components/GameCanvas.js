import Canvas from 'shared/ui/components/canvas';

export default class GameCanvas extends Canvas {
  constructor(...args) {
    super(...args);
    this.play();
    this.lastSize = this.size();
  }

  onResize() {
    this.lastSize = this.size();
  }

  pause() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  play() {
    if (!this.interval) {
      this.interval = setInterval(() => {
        this.render();
      }, 20);
    }
  }

  render = () => {
    var context = this.dom.getContext("2d");

    this.props.draw && this.props.draw(context, { size: this.lastSize });
  }
}