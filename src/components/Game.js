import _ from 'underscore';
import get from 'lodash.get';
import { create } from 'shared/ui';
import component from 'shared/ui/component';
import { inverseMixProps } from 'shared/ui/utility/components';
import GameCanvas from './GameCanvas';
import wumbology from '../wumbology';
import PlainButton from 'shared/ui/components/plainButton';

const styles = {
  play: {
    padding: '10px',
    backgroundColor: '#ffa800',
  },
}

export default class Game extends component {
  static getName() {
    return 'Game';
  }
  static transformProps(props) {
    return inverseMixProps(super.transformProps(props), { style: { width: '100%', height: '100%' } });
  }
  constructor(parent, props, ...args) {
    super('div', parent, Game.transformProps(props), ...args);

    this.state = this.getStateFromProps(this.props);
    this.wumbology = new wumbology({ play: this.play, pause: this.pause, gameOver: this.gameOver });
  }

  getStateFromProps = (props) => {
    return {
      paused: false,
      firstLoad: true,
    };
  };

  draw = (context, meta) => {
    this.tick();
    this.wumbology.render(context, meta);
  }

  tick = () => {
    this.wumbology.tick();
  }

  pause = () => {
    this.timeline.view().pause();
    this.setState({ paused: true })
  }

  play = () => {
    this.timeline.view().play();
    this.setState({ paused: false });
  }

  newGame = (level) => {
    this.wumbology.newGame(level);
    this.timeline.view().play();
    this.setState({ firstLoad: false, paused: false });
  }

  gameOver = (stats) => {
    this.timeline.view().pause();
    this.setState({ paused: true, firstLoad: true });
  }

  renderMenu() {
    const { firstLoad } = this.state;

    return (
      <div style={{ position: 'absolute', left: '0px' ,right: '0px' ,top: '0px' ,bottom: '0px', zIndex: '3', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <PlainButton style={{ padding: '20px 40px', backgroundColor: '#fafafa', marginBottom: '40px' }} onClick={this.newGame}>New Game!</PlainButton>
        {!firstLoad && <PlainButton style={{ padding: '20px 40px', backgroundColor: '#fafafa', marginBottom: '40px' }} onClick={this.play}>Back</PlainButton>}
      </div>
    );
  }

  renderHud() {
    const { paused, firstLoad } = this.state;

    if (paused || firstLoad) {
      return this.renderMenu();
    }

    return (
      <div style={{ position: 'absolute', left: '0px' ,right: '0px' ,top: '0px' ,bottom: '0px', zIndex: '2' }}>
        <div style={{ position: 'absolute', right: '0px', top: '0px', display: 'flex' }}>
        <div style={{ borderRight: '40px solid #ffa800', borderBottom: '40px solid transparent' }}></div>
          {!paused ? <PlainButton style={styles.play} onClick={this.pause}>pause</PlainButton> : <PlainButton style={styles.play} onClick={this.play}>play</PlainButton>}
        </div>
      </div>
    );
  }

  render = () => {
    return (
      <div name="container" style={{ width: '100%', height: '100%', backgroundColor: '#00a8ff' }}>
        {this.renderHud()}
        {this.timeline = <GameCanvas draw={this.draw} style={{ width: '100%', height: '100%' }} />}
      </div>
    );
  };
}

