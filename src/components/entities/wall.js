import entity from './entity';
import collide from 'src/utility/collide';

export default class Wall extends entity {
  constructor(props) {
    super(props);
    this.friction = 1;
    this.position = this.props.position;

    this.fullyAlive = false;
    this.spawnTime = performance.now();
    this.spawnTimeout = 2000;
  }

  tick(meta) {
    if (this.props.direction === 'DOWN') {
      this.velocity = { x: 0, y:this.props.thrust };
    }
    if (this.props.direction === 'UP') {
      this.velocity = { x: 0, y:-this.props.thrust };
    }
    if (this.props.direction === 'LEFT') {
      this.velocity = { x: -this.props.thrust, y:0 };
    }
    if (this.props.direction === 'RIGHT') {
      this.velocity = { x: this.props.thrust, y:0 };
    }

    this.physics();
  }

  render(context, map) {
    context.strokeStyle = this.color || '#333';
    if (!this.fullyAlive) {
      if (this.spawnTime + this.spawnTimeout < performance.now()) {
        this.fullyAlive = true;
      }
      context.fillStyle = `rgba(22, 22, 99, ${(performance.now() - this.spawnTime) / this.spawnTimeout})`;
    } else {
      context.fillStyle = this.color || '#833';
    }
    context.fillRect(this.position.x, this.position.y, this.position.w, this.position.h);

    if (!collide(this.position.x, this.position.y, this.position.w, this.position.h, map.x, map.y, map.w, map.h)) {
      this.props.removeEntity(this);
    }
  }
}