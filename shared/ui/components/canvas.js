import component from '../component';
import { inverseMixStyle, unselectable } from '../mixStyle';

export default class canvas extends component {
  static getName() {
    return 'canvas';
  }
  constructor(parent, props, content) {
    super('canvas', parent, inverseMixStyle(props, unselectable, { cursor: 'default' ,display: 'inline-block', boxSizing: 'border-box' }), content);
  }

  onMount = () => {
    this.onResize();
  }

  onResize = (evt) => {
    this.dom.width = this.size().w;
    this.dom.height = this.size().h;
    this.rerender()
  }

  render() {
    var context = this.dom.getContext("2d");

    if (this.props.draw) {
      this.props.draw(context, this.size());
    } else {
      context.clearRect(0, 0, this.size().w, this.size().h);

      const lines = [{ enabled: true, start: { x: 0, y: 0 }, end: { x: 100, y: 100 } }];

      lines.forEach(function(line, ord) {
        context.beginPath();

        var grad = context.createLinearGradient(line.start.x, line.start.y, line.end.x, line.end.y);
        grad.addColorStop(0, "#fafafa");
        grad.addColorStop(1, line.enabled ? '#333' : '#caa');

        context.strokeStyle = grad;

        context.lineWidth = 3; // ord+1;
        context.moveTo(line.start.x, line.start.y);
        context.lineTo(line.end.x, line.end.y);
        context.stroke();
      });
    }

  }


}
