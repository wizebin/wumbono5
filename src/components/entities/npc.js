import Entity from './entity';
import Keys from 'shared/ui/domKeyboard';
import Bullet from './bullet';

export default class Npc extends Entity {
  constructor(props) {
    super(props);

    this.lastShot = performance.now();
    this.converted = false;
    this.velocity = {
      x: Math.random() * 5,
      y: Math.random() * 4,
    };

    this.friction = 1;
    this.fullyAlive = false;
    this.spawnTime = performance.now();
    this.spawnTimeout = 3000;
  }

  convert() {
    this.converted = true;
    this.color = '#ff00a8';
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

  shoot() {
    if (this.direction !== 'NEUTRAL')
      this.props.addEntity(new Bullet({ parent: this, ...this.props, position: { x: this.position.x / 2, y: this.position.y + this.position.h / 2, w: 5, h: 5 }, direction: this.direction, thrust: 15 }));
  }

  getMidLines() {
    const position = this.position;
    const results = [];

    if (this.directions.indexOf('RIGHT') !== -1) {
      results.push({ enabled: true, start: { x: position.x + position.w / 2, y: position.y + position.h / 2 }, end: { x: position.x + position.w, y: position.y + position.h / 2 } });
    }
    if (this.directions.indexOf('LEFT') !== -1) {
      results.push({ enabled: true, start: { x: position.x, y: position.y + position.h / 2 }, end: { x: position.x  + position.w / 2, y: position.y + position.h / 2 } });
    }
    if (this.directions.indexOf('UP') !== -1) {
      results.push({ enabled: true, start: { x: position.x + position.w / 2, y: position.y }, end: { x: position.x + position.w / 2, y: position.y + position.h / 2 } });
    }
    if (this.directions.indexOf('DOWN') !== -1) {
      results.push({ enabled: true, start: { x: position.x + position.w / 2, y: position.y + position.h / 2 }, end: { x: position.x + position.w / 2, y: position.y + position.h } });
    }

    if (results.length > 0) return results;
    return [{ enabled: true, start: { x: position.x + position.w / 2 - 1, y: position.y + position.h / 2 - 1 }, end: { x: position.x + position.w / 2 + 1, y: position.y + position.h / 2 + 1 } }];
  };

  render(context, map, state) {
    context.strokeStyle = this.color || '#333';
    if (!this.fullyAlive) {
      if (this.spawnTime + this.spawnTimeout < performance.now()) {
        this.fullyAlive = true;
      }
      context.fillStyle = `rgba(22, 22, 99, ${(performance.now() - this.spawnTime) / this.spawnTimeout})`;
    } else {
      context.fillStyle = this.color || '#833';
    }
    context.fillRect(this.position.x, this.position.y, 32, 32);
  }
}