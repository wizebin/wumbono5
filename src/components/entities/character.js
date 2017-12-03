import Entity from './entity';

export default class Character extends Entity {
  constructor(props) {
    super(props);
  }

  render(context, map, state) {
    const lines = [{ enabled: true, start: { x: this.position.x, y: this.position.y }, end: { x: this.position.x + this.position.w, y: this.position.y + this.position.h } }];
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