import Entity from './entity';
import Keys from 'shared/ui/domKeyboard';
import Bullet from './bullet';

export default class Player extends Entity {
  constructor(props) {
    super(props);

    this.lastShot = performance.now();
  }

  checkInput(meta) {
    let keyPressing = [];
    const nextPosition = { x: this.position.x, y: this.position.y };
    if (Keys.keyState('ArrowDown')) {
      this.velocity.y += this.thrust;
      keyPressing.push('DOWN');
    }
    if (Keys.keyState('ArrowUp')) {
      this.velocity.y -= this.thrust;
      keyPressing.push('UP');
    }
    if (Keys.keyState('ArrowRight')) {
      this.velocity.x += this.thrust;
      keyPressing.push('RIGHT');
    }
    if (Keys.keyState('ArrowLeft')) {
      this.velocity.x -= this.thrust;
      keyPressing.push('LEFT');
    }

    if (keyPressing.length > 0) {
      if (keyPressing.length === 1) {
        this.direction = keyPressing[0];
      } else {
        if (keyPressing.indexOf(this.direction) === -1) {
          this.direction = keyPressing[keyPressing.length - 1];
        }
      }
      this.directions = keyPressing;
    } else {
      this.direction = 'NEUTRAL';
      this.directions = [this.direction];
    }

    if (Keys.keyState(' ') && performance.now() - this.lastShot > 100) {
      this.shoot();
      this.lastShot = performance.now();
    }

    const { map } = meta;

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
      this.props.addEntity(new Bullet({ parent: this, ...this.props, position: { x: this.position.x + this.position.w / 2, y: this.position.y + this.position.h / 2, w: 5, h: 5 }, direction: this.direction, thrust: 15 }));
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
    const lines = [
      { enabled: true, start: { x: this.position.x, y: this.position.y }, end: { x: this.position.x + this.position.w, y: this.position.y } },
      { enabled: true, start: { x: this.position.x + this.position.w, y: this.position.y }, end: { x: this.position.x + this.position.w, y: this.position.y + this.position.h } },
      { enabled: true, start: { x: this.position.x, y: this.position.y }, end: { x: this.position.x, y: this.position.y + this.position.h } },
      { enabled: true, start: { x: this.position.x, y: this.position.y + this.position.h }, end: { x: this.position.x + this.position.w, y: this.position.y + this.position.h } },
      ...this.getMidLines(),
    ];

    context.fillStyle = '#fff';
    context.fillRect(this.position.x, this.position.y, this.position.w, this.position.h);

    lines.forEach(function(line, ord) {
      context.beginPath();

      // var grad = context.createLinearGradient(line.start.x, line.start.y, line.end.x, line.end.y);
      // grad.addColorStop(0, "#fafafa");
      // grad.addColorStop(1, line.enabled ? '#333' : '#caa');
      context.strokeStyle = '#333';

      // context.strokeStyle = grad;

      context.lineWidth = 1;
      context.moveTo(line.start.x, line.start.y);
      context.lineTo(line.end.x, line.end.y);
      context.stroke();
    });
  }
}