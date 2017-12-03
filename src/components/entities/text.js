import Entity from './entity';
import Keys from 'shared/ui/domKeyboard';
import Bullet from './bullet';

export default class Text extends Entity {
  constructor(props) {
    super(props);
  }

  tick(meta) {
    this.checkInput();
    this.physics();

    if (this.props.deathTime) {
      if (this.props.deathTime < performance.now() + 1) {
        console.log('should remove text entity', this, this.props.deathTime, performance.now() + 1);
        this.props.removeEntity(this);
      }
    }
  }

  render(context, map, state) {
    context.font=`${this.props.fontSize || 30}px Verdana`;
    context.fillStyle='#333';
    context.fillText(this.props.value, this.position.x, this.position.y);
  }
}