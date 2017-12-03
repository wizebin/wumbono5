import _ from 'underscore';
import player from '../components/entities/player';
import npc from '../components/entities/npc';
import wall from '../components/entities/wall';
import coin from '../components/entities/coin';
import text from '../components/entities/text';
import { assureSubArray } from 'shared/object';
import collide from 'src/utility/collide';

export default class game {
  constructor(props) {
    this.state = {};
    this.props = props;

    this.player = new player(this.getChildProps());
    this.map = { x: 0, y: 0, w: this.state.w || 0, h: this.state.h || 0 };
    this.sections = {};
    this.sectionSize = 32;
    this.multiplier = 0;
    this.baseMultiplier = 1;
    this.multiplierStarted = performance.now();
    this.points = 0;
    this.pointStep = 1;
    this.npcGrowthRate = 5;
    this.lastWallTime = performance.now();

    this.requiredWallTimeout = 5000;
    // this.nextWallThreshold = 1000;

    this.pointText = new text({ ...this.getChildProps(), position: { x: 540, y: 40 }, fontSize: 14, value: 'Points: 0'});

    window.game = this;
  }

  getHighScore() {
    return parseInt(localStorage.getItem('wumbo_high_score') || 0);
  }

  setHighScore(score) {
    this.highScore = score;
    localStorage.setItem('wumbo_high_score', score);
  }

  newGame(level) {
    this.gameIsOver = false;
    this.player.position = {x: this.map.w / 2, y: this.map.h / 2, w: 32, h: 32};
    this.player.velocity = {x: 0, y: 0};
    this.entities = {};
    this.map.x = 0;
    this.map.y = 0;
    this.npcCount = 0;
    this.maxNpcs = 10;
    if (level > 10) {
      this.maxNpcs = 100;
    }
    this.points = 0;
    this.baseMultiplier = 1;
    this.multiplier = 0;
    this.coinCount = 0;
    this.highScore = this.getHighScore();
    this.gapsize = 150;

    this.coinsCollected = 0;

    this.addEntity(this.player);
    this.addEntity(this.pointText);

    this.pointText.props.value = 'Points: 0';

    this.addEntity(new text({ ...this.getChildProps(), position: { x: 40, y: 100 }, value: 'Wumbo No 5!', deathTime: performance.now() + 3000}));
    this.addEntity(new text({ ...this.getChildProps(), position: { x: 40, y: 120 }, fontSize: 18, value: 'Avoid the blocks, grab the coins, more coins = more enemies and higher multiplier', deathTime: performance.now() + 7000}));
  }

  getChildProps() {
    return { addEntity: this.addEntity, removeEntity: this.removeEntity };
  }

  addWall = () => {
    if (performance.now() > this.lastWallTime + this.requiredWallTimeout) {
      this.lastWallTime = performance.now();

      const openSpace = { x: Math.random() * (this.map.w - this.gapsize), y: Math.random() * (this.map.h - this.gapsize) };

      const possibleProps = [
        [
          { direction: 'RIGHT', position: { x: 0, y: 0, w: 24, h: openSpace.y } },
          { direction: 'RIGHT', position: { x: 0, y: openSpace.y + this.gapsize, w: 24, h: this.map.h - openSpace.y - this.gapsize } },
        ],
      ];

      const propsets = possibleProps[Math.floor(Math.random() * possibleProps.length)];

      propsets.forEach((propset) => {
        let nextWallStart = new wall({ ...this.getChildProps(), ...propset, thrust: 3 });
        this.addEntity(nextWallStart);
      }, this);
    }
  }

  addNpc = () => {
    if (this.npcCount < this.maxNpcs) {
      let nextNpc = new npc({ ...this.getChildProps(), position: { x: Math.random() * this.map.w, y: Math.random() * this.map.h, w: 32, h: 32 } });
      while (collide(this.player.position.x, this.player.position.y, this.player.position.w, this.player.position.h, nextNpc.position.x, nextNpc.position.y, nextNpc.position.w, nextNpc.position.h)) {
        nextNpc = new npc({ ...this.getChildProps(), position: { x: Math.random() * this.map.w, y: Math.random() * this.map.h, w: 32, h: 32 } });
      }
      this.addEntity(nextNpc);
    }
  }

  addCoin = () => {
    const nextCoin = new coin({ ...this.getChildProps(), position: { x: Math.random() * this.map.w, y: Math.random() * this.map.h, w: 32, h: 32 } });
    this.addEntity(nextCoin);
    this.coinCount++;
  }

  addEntity = (entity) => {
    this.entities[entity.uid] = entity;

    if (entity instanceof npc) {
      this.npcCount++;
    }
  }

  removeEntity = (entity) => {
    console.log('deleting', entity);
    delete this.entities[entity.uid];

    if (entity instanceof npc) {
      this.npcCount--;
    } else if (entity instanceof coin) {
      this.coinCount--;
    }
  }

  render(context, meta) {
    this.map.w = meta.size.w;
    this.map.h = meta.size.h;

    if (this.npcCount < this.maxNpcs && Math.random() * 5000 > 4500) {
      this.addNpc();
    }
    if (this.coinCount < 1) {
      this.addCoin();
    }

    context.clearRect(0, 0, meta.size.w, meta.size.h);
    _.values(this.entities).forEach((entity) => {
      entity.render(context, this.map);
    }, this);
  }

  findCollisionsForEntities() {
    this.sections = {};
    this.collisions = {};
    _.values(this.entities).forEach((entity) => {
      for(var xdex = entity.miniposition.x; xdex <= entity.miniposition.x + entity.miniposition.w; xdex++) {
        if (!_.has(this.sections, xdex)) {
          this.sections[xdex] = {};
        }
        for(var ydex = entity.miniposition.y; ydex <= entity.miniposition.y + entity.miniposition.h; ydex++) {
          if (!_.has(this.sections[xdex], ydex)) {
            this.sections[xdex][ydex] = [];
          }

          this.sections[xdex][ydex].forEach((couldCollide) => {
            const against = this.entities[couldCollide];
            if (collide(entity.position.x, entity.position.y, entity.position.w, entity.position.h, against.position.x, against.position.y, against.position.w, against.position.h)) {
              if (!_.has(this.collisions, entity.uid)) {
                this.collisions[entity.uid] = [];
              }
              if (this.collisions[entity.uid].indexOf(against.uid) === -1) {
                this.collisions[entity.uid].push(against.uid);
                if (!_.has(this.collisions, against.uid)) {
                  this.collisions[against.uid] = [];
                }
                this.collisions[against.uid].push(entity.uid);
              }
            }
          });
          this.sections[xdex][ydex].push(entity.uid);
        }
      }
    }, this);

    return this.collisions;
  }

  gameOver() {
    console.log('Game Over');
    if (this.points > this.highScore) {
      this.setHighScore(this.points);
    }
    this.props.gameOver(this.points);
    this.gameIsOver = true;
  }

  tick() {
    if (this.gameIsOver) return false;

    this.points += this.pointStep * (this.baseMultiplier + this.multiplier);
    this.pointText.props.value = `Multiplier: x${this.multiplier + this.baseMultiplier} Points: ${this.points} HighScore: ${this.highScore}`;

    if (this.coinCount < 1) {
      this.addCoin();
    }

    const meta = { map: this.map, player: this.player };
    _.values(this.entities).forEach((entity) => {
      entity.tick(meta);
    }, this);

    const collisions = this.findCollisionsForEntities();

    if (_.size(collisions) > 0) {
      // console.log('collisions:', collisions);
      if (_.has(collisions, this.player.uid)) {
        if (collisions[this.player.uid].filter(collision => (this.entities[collision] instanceof npc || this.entities[collision] instanceof wall) && this.entities[collision].fullyAlive).length > 0) {
          this.gameOver();
        }
        const coins = collisions[this.player.uid].filter(collision => this.entities[collision] instanceof coin);
        if (coins.length > 0) {
          coins.forEach((coin) => {
            this.removeEntity(this.entities[coin]);
            this.multiplier++;
            this.multiplierStarted = performance.now();
            // if (this.multiplier + this.baseMultiplier == 2) {
            this.addEntity(new text({ ...this.getChildProps(), position: { x: this.player.position.x, y: this.player.position.y }, value: `${this.multiplier + this.baseMultiplier}x Multiplier!`, deathTime: performance.now() + 1000}));
            // }
            this.maxNpcs += this.npcGrowthRate;
            this.coinsCollected++;
            if (this.coinsCollected % 5 === 0) {
              this.addWall();
            }
          }, this);

        }
      }
    }

    // _.keys(this.sections).forEach((key) => {
    //   const row = this.sections[key];
    //   _.keys(row).forEach((col) => {
    //     if (row[col].length > 1) {
    //       // console.log('potential collisions', key, section);
    //     }
    //   });
    // });
  }

}