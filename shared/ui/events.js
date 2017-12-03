export function createThrottledEvent(type, name, obj) {
  obj = obj || (typeof(window) !== 'undefined' && window);
  if (!obj) return false;
  let running = false;
  const callback = () => {
    if (running) return;
    running = true;
    requestAnimationFrame(() => {
      obj.dispatchEvent(new CustomEvent(name));
      running = false;
    });
  };
  obj.addEventListener(type, callback);

  return true;
}
