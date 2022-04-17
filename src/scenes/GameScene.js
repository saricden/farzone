import {Scene, Math as pMath} from 'phaser';
import Mech1 from '../sprites/Mech1';

class GameScene extends Scene {
  constructor() {
    super("scene-game");
  }

  create() {
    this.tilemap = this.add.tilemap('map-level1');
    const tiles = this.tilemap.addTilesetImage('tileset-grassland', 'tileset-grassland-ex', 175, 175, 1, 2);

    this.ground = this.tilemap.createLayer('ground', tiles);

    // Add, scale, and make up a speed for our creature
    this.cat = new Mech1(this, 0, 0);
    this.catSpeed = 500;

    this.dummy = null;

    const spawnPoints = this.tilemap.getObjectLayer('spawn').objects;

    spawnPoints.forEach(({x, y, name}) => {
      if (name === 'mech') {
        this.cat.setPosition(x, y);
      }
      else if (name === 'dummy') {
        this.dummy = this.physics.add.image(x, y, 'mech1-head');
        this.dummy.body.setBounce(0.5, 0.5);
      }
    });

    // this.ground.setCollisionByProperty({ collides: true });
    this.ground.setCollisionBetween(1, 15);
    this.physics.add.collider(this.cat, this.ground);
    this.physics.add.collider(this.dummy, this.ground);
    this.physics.add.collider(this.dummy, this.cat);

    // Particle effects

    this.dirtParticles = this.add.particles('particles-dirt');
    this.dirtEmitter = this.dirtParticles.createEmitter({
      frame: Phaser.Utils.Array.NumberArray(0, 15),
      scale: {
        min: 0.1,
        max: 0.7
      },
      speedX: {
        min: -1200,
        max: 1200
      },
      lifespan: 4000,
      rotate: {
        min: 0,
        max: 360
      },
      speedY: {
        min: -1200,
        max: 1200
      },
      gravityY: 2000
    });
    this.dirtEmitter.stop();

    this.grassParticles = this.add.particles('particles-grass');
    this.grassEmitter = this.grassParticles.createEmitter({
      frame: Phaser.Utils.Array.NumberArray(0, 2),
      alpha: {
        start: 1,
        end: 0
      },
      scale: {
        min: 0.1,
        max: 0.5
      },
      speedX: {
        min: -1200,
        max: 1200
      },
      speedY: {
        min: -1200,
        max: 1200
      },
      rotate: (p, k, t) => {
        return ((1 - t) * 360);
      },
      lifespan: 2000,
      gravityY: 600,
      gravityX: 1200
    });
    this.grassEmitter.stop();

    // Music
    // this.sound.play('ost-level1', { loop: true });

    this.cameras.main.setBackgroundColor(0x225566);
    // this.cameras.main.startFollow(this.cat);
    this.cameras.main.setZoom(0.75);
    // this.cameras.main.setZoom(2);
  }

  damageTile(tile, intersection) {
    this.dirtEmitter.explode(pMath.Between(0, 5), intersection.x, intersection.y);

    // Grass
    if (tile.index === 1) {
      this.ground.putTileAt(4, tile.x, tile.y, true);
      this.dirtEmitter.explode(2, intersection.x, intersection.y);
      this.grassEmitter.explode(pMath.Between(5, 10), intersection.x, intersection.y);
    }
    else if (tile.index === 4) {
      this.ground.putTileAt(7, tile.x, tile.y, true);
      this.dirtEmitter.explode(3, intersection.x, intersection.y);
      this.grassEmitter.explode(pMath.Between(5, 10), intersection.x, intersection.y);
    }
    else if (tile.index === 7) {
      this.ground.putTileAt(10, tile.x, tile.y, true);
      this.dirtEmitter.explode(4, intersection.x, intersection.y);
      this.grassEmitter.explode(pMath.Between(10, 20), intersection.x, intersection.y);
    }
    else if (tile.index === 10) {
      this.ground.putTileAt(13, tile.x, tile.y, true);
      this.dirtEmitter.explode(6, intersection.x, intersection.y);
      this.grassEmitter.explode(pMath.Between(5, 10), intersection.x, intersection.y);
    }
    else if (tile.index === 13) {
      this.ground.removeTileAt(tile.x, tile.y, false, true);
      const tileUnder = this.ground.getTileAt(tile.x, tile.y + 1, true);
      
      this.dirtEmitter.explode(40, intersection.x, intersection.y);
      this.grassEmitter.explode(200, intersection.x, intersection.y);

      if (tileUnder) {
        if (tileUnder.index === 2) {
          this.ground.putTileAt(3, tile.x, tile.y + 1, true);
        }
        else if (tileUnder.index === 4) {
          this.ground.putTileAt(5, tile.x, tile.y + 1, true);
        }
        else if (tileUnder.index === 8) {
          this.ground.putTileAt(9, tile.x, tile.y + 1, true);
        }
        else if (tileUnder.index === 11) {
          this.ground.putTileAt(12, tile.x, tile.y + 1, true);
        }
        else if (tileUnder.index === 14) {
          this.ground.putTileAt(15, tile.x, tile.y + 1, true);
        }
      }
    }

    // Dirt (side)
    else if (tile.index === 2) {
      this.ground.putTileAt(5, tile.x, tile.y, true);
      this.dirtEmitter.explode(10, intersection.x, intersection.y);
    }
    else if (tile.index === 5) {
      this.ground.putTileAt(8, tile.x, tile.y, true);
      this.dirtEmitter.explode(50, intersection.x, intersection.y);
    }
    else if (tile.index === 8) {
      this.ground.putTileAt(11, tile.x, tile.y, true);
      this.dirtEmitter.explode(100, intersection.x, intersection.y);
    }
    else if (tile.index === 11) {
      this.ground.putTileAt(14, tile.x, tile.y, true);
      this.dirtEmitter.explode(100, intersection.x, intersection.y);
    }
    else if (tile.index === 14) {
      this.ground.removeTileAt(tile.x, tile.y, false, true);
      const tileUnder = this.ground.getTileAt(tile.x, tile.y + 1, true);

      this.dirtEmitter.explode(500, intersection.x, intersection.y);

      if (tileUnder) {
        if (tileUnder.index === 2) {
          this.ground.putTileAt(3, tile.x, tile.y + 1, true);
        }
        else if (tileUnder.index === 4) {
          this.ground.putTileAt(5, tile.x, tile.y + 1, true);
        }
        else if (tileUnder.index === 8) {
          this.ground.putTileAt(9, tile.x, tile.y + 1, true);
        }
        else if (tileUnder.index === 11) {
          this.ground.putTileAt(12, tile.x, tile.y + 1, true);
        }
        else if (tileUnder.index === 14) {
          this.ground.putTileAt(15, tile.x, tile.y + 1, true);
        }
      }
    }

    // Dirt (top)
    else if (tile.index === 3) {
      this.ground.putTileAt(6, tile.x, tile.y, true);
      this.dirtEmitter.explode(10, intersection.x, intersection.y);
    }
    else if (tile.index === 6) {
      this.ground.putTileAt(9, tile.x, tile.y, true);
      this.dirtEmitter.explode(50, intersection.x, intersection.y);
    }
    else if (tile.index === 9) {
      this.ground.putTileAt(12, tile.x, tile.y, true);
      this.dirtEmitter.explode(100, intersection.x, intersection.y);
    }
    else if (tile.index === 12) {
      this.ground.putTileAt(15, tile.x, tile.y, true);
      this.dirtEmitter.explode(100, intersection.x, intersection.y);
    }
    else if (tile.index === 15) {
      this.ground.removeTileAt(tile.x, tile.y, false, true);
      const tileUnder = this.ground.getTileAt(tile.x, tile.y + 1, true);

      this.dirtEmitter.explode(500, intersection.x, intersection.y);

      if (tileUnder) {
        if (tileUnder.index === 2) {
          this.ground.putTileAt(3, tile.x, tile.y + 1, true);
        }
        else if (tileUnder.index === 4) {
          this.ground.putTileAt(5, tile.x, tile.y + 1, true);
        }
        else if (tileUnder.index === 8) {
          this.ground.putTileAt(9, tile.x, tile.y + 1, true);
        }
        else if (tileUnder.index === 11) {
          this.ground.putTileAt(12, tile.x, tile.y + 1, true);
        }
        else if (tileUnder.index === 14) {
          this.ground.putTileAt(15, tile.x, tile.y + 1, true);
        }
      }
    }
  }

  update(time, delta) {
    this.cat.update(time, delta);

    // Pan to the midpoint between players
    const midX = (this.cat.x + this.dummy.x) / 2;
    const midY = (this.cat.y + this.dummy.y) / 2;
    this.cameras.main.pan(midX, midY, 250, 'Linear', true);
    
    // Zoom to fit both players in frame
    const dist = pMath.Distance.Between(this.cat.x, this.cat.y, this.dummy.x, this.dummy.y);
    const minZoom = (window.innerWidth / this.tilemap.widthInPixels);
    // const scale = Math.min(Math.max(((this.tilemap.widthInPixels - dist) / this.tilemap.widthInPixels), minZoom), 1);
    const scale = Math.min(Math.max(window.innerWidth / (dist * 1.35), minZoom), 0.5);
    this.cameras.main.zoomTo(scale, 250, 'Linear', true);
  }

}
export default GameScene;