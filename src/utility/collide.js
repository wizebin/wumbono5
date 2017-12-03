export default function collide(x1, y1, w1, h1, x2, y2, w2, h2) {
  if (x1 > x2 + w2) return false; // left side of first is to the right of the second
  if (x1 + w1 < x2) return false; // right side of the first is to the left of the second
  if (y1 > y2 + h2) return false; // top side of the first is below the second
  if (y1 + h1 < y2) return false; // bottom side of the first is above the first

  return true;
}