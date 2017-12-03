class mouseTracker {
  constructor() {
    this.mousePos = { x: 0, y: 0 };
    this.touchPos = { x: 0, y: 0 };
    this.pos = { x: 0, y: 0 };

    const doc = typeof(document) !== 'undefined' && document;
    if (doc) {
      document.addEventListener('mousemove', this.mouseCallback);
      document.addEventListener('touchmove', this.touchCallback);
      document.addEventListener('touchstart', this.touchCallback);
    }
  }

  mouseCallback = (event) => {
    this.mousePos.x = event.x;
    this.mousePos.y = event.y;
    this.pos = this.mousePos;
  }

  touchCallback = (event) => {
    this.touchPos = this.getPosFromTouchEvent(event);
    this.pos = this.touchPos;
  }

  currentMousePos() {
    return { ...this.mousePos };
  }

  currentTouchPos() {
    return { ...this.touchPos };
  }

  currentPos() {
    return { ...this.pos };
  }

  getPosFromTouchEvent(event) {
    return {
      x: event.touches[0].pageX,
      y: event.touches[0].pageY,
    };
  }
}

export default new mouseTracker();
