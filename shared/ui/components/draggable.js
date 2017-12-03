import _ from 'underscore';
import component from '../component';
import mouseTracker from '../domMouse';
import { getNthElementAtPosition } from '../utility/components';
import { body } from '../ui';

export default class draggable extends component {
  static getName() {
    return 'draggable';
  }
  constructor(...args) {
    super(...args);

    this.mouseDownLocation = null;
    this.startDragLocation = null;
    this.relativeStartLocation = null;
    this.offset = null;
    this.startedMove = false;
    this.doClone = this.props.doClone === true;
    this.cloneLevel = this.props.cloneLevel || undefined;
    this.isDraggable = true;
    this.bubbleEvent = this.props.bubbleEvent === true;

    this.draggingOptions = null;

    this.listenForEvent('mousedown', this.mouseDown);
    this.listenForEvent('touchstart', this.touchStart);
  }

  clearMouseData = () => {
    this.mouseDragUpHandler && this.unlisten(this.mouseDragUpHandler);
    this.mouseDragMoveHandler && this.unlisten(this.mouseDragMoveHandler);
    this.touchDragUpHandler && this.unlisten(this.touchDragUpHandler);
    this.touchDragMoveHandler && this.unlisten(this.touchDragMoveHandler);
    this.mouseDragUpHandler = null;
    this.mouseDragMoveHandler = null;
    this.touchDragUpHandler = null;
    this.touchDragMoveHandler = null;
    if (this.dragClone) {
      this.dragClone.setParent(null);
      this.dragClone = null;
      this.removeStyle('opacity');
    }
  }

  mouseDown = (event) => {
    if (event.button > 0) return false;
    if (!this.bubbleEvent) event.cancelBubble = true;
    this.draggingOptions = _.pick(event, ['button', 'shiftKey', 'ctrlKey', 'optionKey', 'metaKey'])
    this.startedMove = false;
    this.previousDiff = null;
    this.clearMouseData();
    if (!this.mouseDragUpHandler) {
      this.mouseDragUpHandler = this.listenForEvent('mouseup', this.mouseUp, true);
    }
    if (!this.mouseDragMoveHandler) {
      this.mouseDragMoveHandler = this.listenForEvent('mousemove', this.mouseMove, true);
    }
    this.mouseDownLocation = mouseTracker.currentPos();
    this.startDragLocation = this.position();
    this.startSize = this.size();
  }

  touchStart = (event) => {
    if (!this.bubbleEvent) event.cancelBubble = true;
    // event.preventDefault && event.preventDefault();
    // event.stopPropagation && event.stopPropagation();

    this.startedMove = false;
    this.previousDiff = null;
    this.clearMouseData();
    if (!this.touchDragUpHandler) {
      this.touchDragUpHandler = this.listenForEvent('touchend', this.mouseUp, true);
    }
    if (!this.touchDragMoveHandler) {
      this.touchDragMoveHandler = this.listenForEvent('touchmove', this.touchMove, true);
    }
    this.mouseDownLocation = mouseTracker.getPosFromTouchEvent(event);
    this.startDragLocation = this.position();
    this.startSize = this.size();
  }

  cloneForDrag = () => {
    if (this.doClone) {
      this.dragClone = this.clone(body, { style: { ...this.props.style, position: 'absolute', left: `${this.startDragLocation.x}px`, top: `${this.startDragLocation.y}px`, width: `${this.startSize.w}px`, height: `${this.startSize.h}px`, marginLeft: '0px', marginTop: '0px', ...(this.props.dragStyle || {}) }}, false, true);
      this.applyStyle({ opacity: '.2' });
    }
  }

  mouseUp = (event) => {
    this.clearMouseData();
    const currentPosition = this.getPositioning().current;
    const size = this.size();
    this.props.onMoveFinish && this.props.onMoveFinish(currentPosition);
    this.onMoveFinish(currentPosition);
    if (this.props.droppable && this.startedMove) {
      const dropElement = getNthElementAtPosition(mouseTracker.currentPos(), 0);
      dropElement && dropElement.onReceivedDrop({ original: this, position: currentPosition, size, mousePosition: mouseTracker.currentPos(), options: this.draggingOptions, event });
    }
  }

  mouseMove = (event) => {
    if(event.preventDefault) event.preventDefault();
    const positioning = this.getPositioning();
    if (!this.startedMove) {
      this.startedMove = true;
      this.cloneForDrag();
      this.props.onMoveStart && this.props.onMoveStart(positioning);
      this.onMoveStart();
    }
    this.props.onMove && this.props.onMove(positioning);
    this.onMove(positioning);
    if (this.doClone) {
      this.dragClone.applyStyle({ left: `${positioning.current.x}px`, top: `${positioning.current.y}px` });
    }
    this.previousDiff = positioning.diff;
  }

  touchMove = (event) => {
    event.preventDefault && event.preventDefault();
    event.stopPropagation && event.stopPropagation();

    this.mouseMove(event);
  }

  onMove = () => {}
  onMoveFinish = () => {}
  onMoveStart = () => {}

  getPositioning = () => {
    const leftDiff = mouseTracker.currentPos().x - this.mouseDownLocation.x;
    const topDiff = mouseTracker.currentPos().y - this.mouseDownLocation.y;
    const leftPos = this.startDragLocation.x + leftDiff;
    const topPos = this.startDragLocation.y + topDiff;
    const stepDiff = { x: leftDiff - (this.previousDiff ? this.previousDiff.x : leftDiff), y: topDiff - (this.previousDiff ? this.previousDiff.y : topDiff)};
    return { start: this.startDragLocation, diff: { x: leftDiff, y: topDiff }, current: { x: leftPos, y: topPos }, stepDiff }
  }
}
