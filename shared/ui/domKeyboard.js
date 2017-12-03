class keyboardTracker {
  constructor() {
    this.keyboardKeys = {};
    document.addEventListener('keydown', this.keydown);
    document.addEventListener('keyup', this.keyup);
    document.addEventListener('blur', () => {this.keyboardKeys = {}});
  }

  keydown = (event) => {
    // console.log('key pressed', event.key, '<-');
    this.keyboardKeys[event.key] = true;
  }

  keyup = (event) => {
    this.keyboardKeys[event.key] = false;
  }

  keyState = (keyname) => {
    return this.keyboardKeys[keyname];
  }
}

export default new keyboardTracker();
