import {Scene, Math as pMath} from 'phaser';
import Mech1 from '../sprites/Mech1';
import Mech1NPC from '../sprites/Mech1NPC';

class GameScene extends Scene {
  constructor() {
    super("scene-game");
  }

  init({ levelKey }) {
    this.levelKey = levelKey;
  }

  create() {
    // Launch HUD ui
    this.scene.launch('ui-battlehud', {
      parentScene: this
    });

    this.tilemap = this.add.tilemap(this.levelKey);
    const tiles = this.tilemap.addTilesetImage('tileset-grassland', 'tileset-grassland-ex', 175, 175, 1, 2);

    this.bg2 = this.tilemap.createLayer('bg2', tiles);
    this.bg2.setScale(0.1);
    this.bg2.setAlpha(0.2);
    this.bg2.setScrollFactor(0.5);
    this.bg2.setPosition(6000, 2000);

    this.bg2Mist = this.add.graphics();
    this.bg2Mist.setScrollFactor(0);
    this.bg2Mist.fillStyle(0x000000, 0.3);
    this.bg2Mist.fillRect(-this.tilemap.widthInPixels * 5, -this.tilemap.heightInPixels * 5, this.tilemap.widthInPixels * 10, this.tilemap.heightInPixels * 10);

    this.bg1 = this.tilemap.createLayer('bg1', tiles);
    this.bg1.setScale(0.25);
    this.bg1.setAlpha(1);
    this.bg1.setScrollFactor(0.75);
    this.bg1.setPosition(8200, 3500);

    this.bg1Mist = this.add.graphics();
    this.bg1Mist.setScrollFactor(0);
    this.bg1Mist.fillStyle(0x000000, 0.3);
    this.bg1Mist.fillRect(-this.tilemap.widthInPixels * 5, -this.tilemap.heightInPixels * 5, this.tilemap.widthInPixels * 10, this.tilemap.heightInPixels * 10);
    
    this.ground = this.tilemap.createLayer('ground', tiles);

    // Add, scale, and make up a speed for our creature
    this.cat = new Mech1(this, 0, 0);
    this.catSpeed = 500;
    this.catSpawnpoint = `spawnpoint${pMath.Between(1, 4)}`;
    
    this.dummy = new Mech1NPC(this, 0, 0);
    this.dummySpawnpoint = `spawnpoint${pMath.Between(1, 4)}`;

    // Make sure we don't spawn both players at same point
    while (this.catSpawnpoint === this.dummySpawnpoint) {
      this.dummySpawnpoint = `spawnpoint${pMath.Between(1, 4)}`;
    }

    this.cat.mapTarget(this.dummy);
    this.dummy.mapTarget(this.cat);

    const spawnPoints = this.tilemap.getObjectLayer('spawn').objects;

    spawnPoints.forEach(({x, y, name}) => {
      if (name === this.catSpawnpoint) {
        this.cat.setPosition(x, y);
      }
      else if (name === this.dummySpawnpoint) {
        this.dummy.setPosition(x, y);
      }
    });

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

    // Game data
    this.registry.playerMaxHP = 1000;
    this.registry.playerHP = this.registry.playerMaxHP;
    this.registry.playerRockets = 2;

    this.registry.enemyMaxHP = 1000;
    this.registry.enemyHP = this.registry.enemyMaxHP;
    this.registry.enemyRockets = 2;

    // Music
    this.bgm = this.sound.add('ost-level1c', { loop: true, volume: 0.85 });
    this.bgm.play();

    const follow_lerp_x = 0.05;
    const follow_lerp_y = 0.05;
    this.camZoomMin = 0.01;
    this.camZoomMax = 0.5;
    this.camZoomLerp = 0.05;

    this.cameras.main.setBackgroundColor(0x5555FF);
    this.cameras.main.setZoom(1);
    // this.cameras.main.setBounds(0, 0, this.tilemap.widthInPixels, this.tilemap.heightInPixels);
    
    this.cameraMid = new pMath.Vector2();
    this.cameras.main.startFollow(this.cameraMid, false, follow_lerp_x, follow_lerp_y);

    // Stats
    this.startTime = Date.now();
    this.tilesDestroyed = 0;
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

      this.tilesDestroyed++;
      
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

      this.tilesDestroyed++;

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

      this.tilesDestroyed++;

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
    this.dummy.update(time, delta);

    // Pan to the midpoint between players
    // const midX = (this.cat.x + this.dummy.x) / 2;
    // const midY = (this.cat.y + this.dummy.y) / 2;
    // this.cameras.main.pan(midX, midY, 250, 'Linear', true);
    
    // Zoom to fit both players in frame
    // const dist = pMath.Distance.Between(this.cat.x, this.cat.y, this.dummy.x, this.dummy.y);
    // const minZoomX = (window.innerWidth / this.tilemap.widthInPixels);
    // const minZoomY = (window.innerHeight / this.tilemap.heightInPixels);
    // const minZoom = Math.min(minZoomX, minZoomY);
    // // const scale = Math.min(Math.max(((this.tilemap.widthInPixels - dist) / this.tilemap.widthInPixels), minZoom), 1);
    // const scale = Math.min(Math.max(window.innerWidth / (dist * 1.35), minZoom), 0.5);
    // this.cameras.main.zoomTo(scale, 250, 'Linear', true);

    // Shoutout to @samme for this solution!!
    // https://codepen.io/samme/pen/BaoXxdx?editors=0010
    if (!this.cat.isDead && !this.dummy.isDead) {
      this.cameraMid.copy(this.cat.body.center).lerp(this.dummy.body.center, 0.5);
  
      const dist = pMath.Distance.BetweenPoints(
        this.cat.body.position,
        this.dummy.body.position
      );
      const camera = this.cameras.main;
      const min = Math.min(this.scale.width, this.scale.height) / 1.5;
  
      camera.setZoom(
        pMath.Linear(
          camera.zoom,
          pMath.Clamp(min / dist, this.camZoomMin, this.camZoomMax),
          this.camZoomLerp
        )
      );
    }
    else {
      this.bgm.stop();
    }

    // Reposition dummy if it goes off-map
    const {widthInPixels, heightInPixels} = this.tilemap;

    if (this.dummy.x > widthInPixels) {
      this.dummy.setX(0);
    }
    else if (this.dummy.x < 0) {
      this.dummy.setX(widthInPixels);
    }

    if (this.dummy.y > heightInPixels) {
      this.dummy.setY(0);
    }
    else if (this.y < 0) {
      this.dummy.setY(heightInPixels);
    }
  }

}
export default GameScene;