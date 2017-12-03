export default class Entity {
  static uid = 0;
  constructor(props) {
    this.props = props;
    this.uid = Entity.uid++;
    this.position = props.position || {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
    };
    this.miniposition = {x: 0, y: 0};

    this.velocity = props.velocity || {x: 0, y: 0};
    this.direction = 'NEUTRAL'
    this.directions = [this.direction];
    this.friction = .95;
    this.thrust = .5;
    this.gridsize = 32;
  }

  setPosition = (position) => {
    this.position.x = position.x;
    this.position.y = position.y;

    this.miniposition.x = Math.floor(this.position.x / (this.gridsize || 32));
    this.miniposition.y = Math.floor(this.position.y / (this.gridsize || 32));
    this.miniposition.w = Math.ceil(this.position.w / (this.gridsize || 32));
    this.miniposition.h = Math.ceil(this.position.h / (this.gridsize || 32));
  }

  setSize(size) {
    this.position.w = size.w;
    this.position.h = size.h;
  }

  checkInput() {}

  tick(meta) {
    this.checkInput(meta);

    this.physics();
  }

  physics() {
    this.setPosition({ x: this.position.x + this.velocity.x, y: this.position.y + this.velocity.y });

    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;
  }


  render(canvas, map, state) {
    canvas.strokeStyle = this.color || '#aaa';
    canvas.fillRect(this.position.x, this.position.y, this.position.w, this.position.h);
  }
}