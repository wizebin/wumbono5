import entity from './entity';
import collide from 'src/utility/collide';

export default class Coin extends entity {
  constructor(props) {
    super(props);
    this.friction = 1;
    this.position = this.props.position;
    this.velocity = {
      x: Math.random() * 1,
      y: Math.random() * 1,
    };
  }

  checkInput(meta) {
    const { map } = meta;

    const nextPosition = { x: this.position.x, y: this.position.y };

    if (nextPosition.x < map.x) {
      if (this.velocity.x < 0) {
        this.velocity.x *= -1;
        nextPosition.x = map.x;
      }
    } else if (nextPosition.x + this.position.w > map.x + map.w) {
      if (this.velocity.x > 0) {
        this.velocity.x *= -1;
        nextPosition.x = map.x + map.w - this.position.w;
      }
    }

    if (nextPosition.y < map.y) {
      if (this.velocity.y < 0) {
        this.velocity.y *= -1;
        nextPosition.y = map.y;
      }
    } else if (nextPosition.y + this.position.h > map.y + map.h) {
      if (this.velocity.y > 0) {
        this.velocity.y *= -1;
        nextPosition.y = map.y + map.h - this.position.h;
      }
    }

    this.setPosition(nextPosition);
  }

  render(context, map) {
    // context.fillStyle = this.color || '#faa';
    // context.fillRect(this.position.x, this.position.y, this.position.w, this.position.h);

    var centerX = this.position.x + this.position.w / 2;
    var centerY = this.position.y + this.position.h / 2;
    var radius = this.position.w / 2;

    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = this.fillColor || 'yellow';
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = this.color || '#333';
    context.stroke();
  }
}