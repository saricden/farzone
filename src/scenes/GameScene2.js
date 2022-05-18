import {Scene, Math as pMath, Display} from 'phaser';
import Roboto from '../sprites/Roboto';
import RobotoNPC from '../sprites/RobotoNPC';
import RobotoPeer from '../sprites/RobotoPeer';
import RobotoShell from '../sprites/RobotoShell';
import Arial from '../sprites/Arial';
import ArialNPC from '../sprites/ArialNPC';
import ArialPeer from '../sprites/ArialPeer';
import Oswald from '../sprites/Oswald';
import OswaldPeer from '../sprites/OswaldPeer';
import OswaldGrendade from '../sprites/OswaldGrenade';
import PF from 'pathfinding';
import {network} from '../network';
import Montserrat from '../sprites/Montserrat';

const { Grid } = PF;

class GameScene2 extends Scene {
  constructor() {
    super("scene-game");
  }

  init({ levelKey, bgColor = null, p1Key, p2Key }) {
    this.levelKey = levelKey;
    this.bgColor = bgColor;
    this.p1Key = p1Key;
    this.p2Key = p2Key;
  }

  create() {
    this.soloTest = false; // set to true if you want to solo a character

    // Launch HUD ui
    this.scene.launch('ui-battlehud', {
      parentScene: this,
      p1Key: this.p1Key,
      p2Key: this.p2Key
    });

    this.tilemap = this.add.tilemap(this.levelKey);
    const tiles = this.tilemap.addTilesetImage('tileset', 'tileset-ex', 175, 175, 1, 2);

    this.para2 = this.tilemap.createLayer('parabg2', tiles);
    this.para2.setScale(0.1);
    this.para2.setAlpha(0.2);
    this.para2.setScrollFactor(0.5);
    this.para2.setPosition(6000, 2000);

    this.para2Mist = this.add.graphics();
    this.para2Mist.setScrollFactor(0);
    this.para2Mist.fillStyle(0x000000, 0.3);
    this.para2Mist.fillRect(-this.tilemap.widthInPixels * 5, -this.tilemap.heightInPixels * 5, this.tilemap.widthInPixels * 10, this.tilemap.heightInPixels * 10);

    this.para1 = this.tilemap.createLayer('parabg1', tiles);
    this.para1.setScale(0.25);
    this.para1.setAlpha(1);
    this.para1.setScrollFactor(0.75);
    this.para1.setPosition(8200, 3500);

    this.para1Mist = this.add.graphics();
    this.para1Mist.setScrollFactor(0);
    this.para1Mist.fillStyle(0x000000, 0.3);
    this.para1Mist.fillRect(-this.tilemap.widthInPixels * 5, -this.tilemap.heightInPixels * 5, this.tilemap.widthInPixels * 10, this.tilemap.heightInPixels * 10);
    
    this.ground = this.tilemap.createLayer('ground', tiles);

    this.bgd1 = this.tilemap.createLayer('bgd1', tiles); // tree trunks, etc.
    this.bgd2 = this.tilemap.createLayer('bgd2', tiles); // branches
    this.bgd3 = this.tilemap.createLayer('bgd3', tiles); // more branches

    this.leaves = this.tilemap.createLayer('leaves', tiles);
    this.leavesBG1 = this.tilemap.createLayer('leavesBG1', tiles);
    this.leavesBG2 = this.tilemap.createLayer('leavesBG2', tiles);

    this.leavesBG1Pos = new pMath.Vector2(10, 30);
    this.leavesBG2Pos = new pMath.Vector2(-20, -20);
    this.leavesBG1.setPosition(this.leavesBG1Pos);
    this.leavesBG2.setPosition(this.leavesBG2Pos);

    // If game is multiplayer...
    if (this.registry.isMultiplayer) {
      // If this client is player 1...
      if (this.registry.isMultiplayerHost) {
        // Make player 1 a controllable sprite
        if (this.p1Key === 'roboto') {
          this.cat = new Roboto(this, 0, 0);
        }
        else if (this.p1Key === 'arial') {
          this.cat = new Arial(this, 0, 0);
        }
        else if (this.p1Key === 'oswald') {
          this.cat = new Oswald(this, 0, 0);
        }
        else if (this.p1Key === 'montserrat') {
          this.cat = new Montserrat(this, 0, 0);
        }

        // Make player 2 a peer sprite sprite
        if (this.p2Key === 'roboto') {
          this.dummy = new RobotoPeer(this, 0, 0);
        }
        else if (this.p2Key === 'arial') {
          this.dummy = new ArialPeer(this, 0, 0);
        }
        else if (this.p2Key === 'oswald') {
          this.dummy = new OswaldPeer(this, 0, 0);
        }
      }
      // If this client is player 2...
      else {
        // Make player 1 a peer sprite
        if (this.p1Key === 'roboto') {
          this.cat = new RobotoPeer(this, 0, 0);
        }
        else if (this.p1Key === 'arial') {
          this.cat = new ArialPeer(this, 0, 0);
        }
        else if (this.p1Key === 'oswald') {
          this.cat = new OswaldPeer(this, 0, 0);
        }

        // Make player 2 a controllable sprite
        if (this.p2Key === 'roboto') {
          this.dummy = new Roboto(this, 0, 0);
        }
        else if (this.p2Key === 'arial') {
          this.dummy = new Arial(this, 0, 0);
        }
        else if (this.p2Key === 'oswald') {
          this.dummy = new Oswald(this, 0, 0);
        }
        else if (this.p2Key === 'montserrat') {
          this.dummy = new Montserrat(this, 0, 0);
        }
      }
    }
    // Otherwise, single player against a CPU...
    else {
      if (this.p1Key === 'roboto') {
        this.cat = new Roboto(this, 0, 0);
      }
      else if (this.p1Key === 'arial') {
        this.cat = new Arial(this, 0, 0);
      }
      else if (this.p1Key === 'oswald') {
        this.cat = new Oswald(this, 0, 0);
      }
      else if (this.p1Key === 'montserrat') {
        this.cat = new Montserrat(this, 0, 0);
      }
      
      if (this.p2Key === 'roboto') {
        this.dummy = new RobotoNPC(this, 0, 0);
      }
      else if (this.p2Key === 'arial') {
        this.dummy = new ArialNPC(this, 0, 0);
      }
  
      if (this.soloTest) {
        this.dummy.isPaused = true;
      }
    }

    // Apply player 2 colour
    this.dummy.applyHueRotation();

    this.catSpawnpoint = `spawnpoint${pMath.Between(1, 4)}`;
    this.dummySpawnpoint = `spawnpoint${pMath.Between(1, 4)}`;

    // Make sure we don't spawn both players at same point
    while (this.catSpawnpoint === this.dummySpawnpoint) {
      this.dummySpawnpoint = `spawnpoint${pMath.Between(1, 4)}`;
    }

    const spawnPoints = this.tilemap.getObjectLayer('spawn').objects;

    spawnPoints.forEach(({x, y, name}) => {
      if (name === this.catSpawnpoint) {
        this.cat.setPosition(x, y);
      }
      else if (name === this.dummySpawnpoint) {
        this.dummy.setPosition(x, y);
      }
    });

    // Lighting
    this.lights.enable();
    this.lights.setAmbientColor(0x555555);
    this.cat.initLighting();
    this.dummy.initLighting();
    this.ground.setPipeline('Light2D');
    this.bgd1.setPipeline('Light2D');
    this.bgd2.setPipeline('Light2D');
    this.bgd3.setPipeline('Light2D');
    this.leaves.setPipeline('Light2D');
    this.leavesBG1.setPipeline('Light2D');
    this.leavesBG2.setPipeline('Light2D');
    // this.para1.setPipeline('Light2D');
    // this.para2.setPipeline('Light2D');

    const sunRadius = Math.max(this.tilemap.widthInPixels, this.tilemap.heightInPixels);
    this.sun = this.lights.addLight(this.tilemap.widthInPixels / 2, 0, sunRadius);

    // Physics colliders
    this.physics.world.TILE_BIAS = 175;

    this.ground.setCollisionBetween(1, 5);
    this.ground.setCollisionBetween(11, 15);
    this.ground.setCollisionBetween(21, 25);
    this.ground.setCollisionBetween(31, 35);
    this.ground.setCollisionBetween(41, 45);
    
    this.bgd1.setCollisionBetween(81, 138);
    this.bgd2.setCollisionBetween(81, 138);
    this.bgd3.setCollisionBetween(81, 138);

    this.leaves.setCollisionBetween(51, 73);
    this.leavesBG1.setCollisionBetween(51, 73);
    this.leavesBG2.setCollisionBetween(51, 73);

    this.physics.add.collider(this.cat, this.ground, null, () => {
      if (typeof this.cat.processGround === 'function') {
        return this.cat.processGround();
      }

      return true;
    });
    this.physics.add.collider(this.dummy, this.ground, null, () => {
      if (typeof this.dummy.processGround === 'function') {
        return this.dummy.processGround();
      }

      return true;
    });
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

    this.brickParticles = this.add.particles('particles-brick');
    this.brickEmitter = this.brickParticles.createEmitter({
      frame: Phaser.Utils.Array.NumberArray(0, 6),
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
    this.brickEmitter.stop();

    this.woodParticles = this.add.particles('particles-wood');
    this.woodEmitter = this.woodParticles.createEmitter({
      frame: Phaser.Utils.Array.NumberArray(0, 2),
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
        return ((1 - t) * 360 * 8);
      },
      lifespan: 2000,
      gravityY: 600,
      gravityX: 1200
    });
    this.woodEmitter.stop();

    this.leafParticles = this.add.particles('particles-leaves');
    this.leavesEmitter = this.leafParticles.createEmitter({
      frame: Phaser.Utils.Array.NumberArray(0, 2),
      scale: {
        min: 0.1,
        max: 0.25
      },
      alpha: {
        start: 0.75,
        end: 0
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
        return ((1 - t) * 360 * 4);
      },
      lifespan: 2000,
      gravityY: 600,
      gravityX: 1200
    });
    this.leavesEmitter.stop();

    // Layering
    // this.boomParticle.setDepth(17); // Mech1Shell.js
    // this.fireParticle.setDepth(16); // Mech1Shell.js
    this.woodParticles.setDepth(13);
    this.brickParticles.setDepth(13);
    this.grassParticles.setDepth(13);
    this.dirtParticles.setDepth(13);
    this.leaves.setDepth(12);
    this.cat.setDepth(11);
    this.dummy.setDepth(10);
    this.bgd1.setDepth(9);
    this.bgd2.setDepth(8);
    this.bgd3.setDepth(7);
    this.leavesBG1.setDepth(6);
    this.leavesBG2.setDepth(5);
    this.ground.setDepth(4);
    this.para1Mist.setDepth(3);
    this.para1.setDepth(2);
    this.para2Mist.setDepth(1);
    this.para2.setDepth(0);

    // Map raycasters
    this.cat.mapGroundLayer(this.ground);
    this.cat.mapTarget(this.dummy);
    this.cat.mapDetailLayers([
      this.bgd1,
      this.bgd2,
      this.bgd3,
      this.leaves,
      this.leavesBG1,
      this.leavesBG2
    ]);

    this.dummy.mapTarget(this.cat);
    this.dummy.mapGroundLayer(this.ground);
    this.dummy.mapDetailLayers([
      this.bgd1,
      this.bgd2,
      this.bgd3,
      this.leaves,
      this.leavesBG1,
      this.leavesBG2
    ]);

    // Init pathfinding
    let matrix = [];

    this.tilemap.forEachTile((tile) => {
      const {x, y} = tile;

      if (!Array.isArray(matrix[y])) {
        matrix[y] = [];
      }

      matrix[y][x] = (tile.index > 0 ? 1 : 0);
    }, this, 0, 0, this.tilemap.width, this.tilemap.height, {}, this.ground);

    this.pfGrid = new Grid(matrix);
    this.pfMatrix = matrix;


    // Game data
    if (this.p1Key === 'roboto') {
      this.registry.playerMaxHP = 1200;
      this.registry.playerHP = this.registry.playerMaxHP;
      this.registry.playerRockets = 2;
    }
    else if (this.p1Key === 'arial') {
      this.registry.playerMaxHP = 700;
      this.registry.playerHP = this.registry.playerMaxHP;
    }
    else if (this.p1Key === 'oswald') {
      this.registry.playerMaxHP = 850;
      this.registry.playerHP = this.registry.playerMaxHP;
    }
    else if (this.p1Key === 'montserrat') {
      this.registry.playerMaxHP = 800;
      this.registry.playerHP = this.registry.playerMaxHP;
    }

    this.registry.p1Key = this.p1Key;
    this.registry.playerTotalAttacks = 0;
    this.registry.playerAttacksHit = 0;
    this.registry.playerDamageInflicted = 0;
    this.registry.playerDamageTaken = 0;
    this.registry.playerDistanceMoved = 0;

    this.registry.p2Key = this.p2Key;
    // this.registry.p2Key = 'roboto';

    if (this.p2Key === 'roboto') {
      this.registry.enemyMaxHP = 1200;
      this.registry.enemyHP = this.registry.enemyMaxHP;
      this.registry.enemyRockets = 2;
    }
    else if (this.p2Key === 'arial') {
      this.registry.enemyMaxHP = 700;
      this.registry.enemyHP = this.registry.enemyMaxHP;
    }
    else if (this.p2Key === 'oswald') {
      this.registry.enemyMaxHP = 850;
      this.registry.enemyHP = this.registry.enemyMaxHP;
    }
    else if (this.p2Key === 'montserrat') {
      this.registry.enemyMaxHP = 800;
      this.registry.enemyHP = this.registry.enemyMaxHP;
    }

    // Music
    this.bgm = this.sound.add('ost-battle1', { loop: true });

    this.sound.add('mitch-go').once('complete', () => this.bgm.play()).play();

    const follow_lerp_x = 0.05;
    const follow_lerp_y = 0.05;
    this.camZoomMin = Math.min(window.innerWidth / this.tilemap.widthInPixels, window.innerHeight / this.tilemap.heightInPixels);
    this.camZoomMax = 0.5;
    this.camZoomLerp = 0.05;

    if (this.bgColor === null) {
      this.cameras.main.setBackgroundColor(0x3333CC);
    }
    else {
      this.cameras.main.setBackgroundColor(this.bgColor);
    }
    this.cameras.main.setZoom(this.camZoomMin);
    // this.cameras.main.setZoom(0.86);
    // this.cameras.main.setBounds(0, 0, this.tilemap.widthInPixels, this.tilemap.heightInPixels);
    
    this.cameraMid = new pMath.Vector2();

    if (this.soloTest) {
      this.cameras.main.startFollow(this.cat);
    }
    else {
      this.cameras.main.startFollow(this.cameraMid, false, follow_lerp_x, follow_lerp_y);
    }

    // Stats
    this.startTime = Date.now();
    this.tilesDestroyed = 0;

    // Timescale
    this.scaleTime = 1;

    // Particle effects
    this.fireParticle = this.add.particles('particle-fire');
    this.boomParticle = this.add.particles('particle-explosion');
    this.boomEmitter = this.boomParticle.createEmitter({
      alpha: {
        start: 1,
        end: 0
      },
      rotate: (p, k, t) => {
        return ((1 - t) * 360) * 4;
      },
      tint: (particle, key, t) => {
        const g = ((1 - t) / 1 * 255);
        return Display.Color.GetColor(255, g, 0);
      },
      speedX: {
        min: -400,
        max: 400
      },
      speedY: {
        min: -400,
        max: 400
      },
      scale: {
        start: 0.5,
        end: 1
      },
      lifespan: {
        min: 250,
        max: 750
      }
    });
    this.boomEmitter.stop();

    this.boomEmitter2 = this.fireParticle.createEmitter({
      alpha: {
        start: 0.5,
        end: 0
      },
      rotate: (p, k, t) => {
        return ((1 - t) * 360) * 4;
      },
      speedX: {
        min: -500,
        max: 500
      },
      speedY: {
        min: -500,
        max: 500
      },
      gravityX: 200,
      lifespan: 2000
    });
    this.boomEmitter2.stop();

    if (this.registry.isMultiplayer) {
      // Multiplayer stuff
      this.p1PrevX = this.cat.x;
      this.p1PrevY = this.cat.y;
      this.p2PrevX = this.dummy.x;
      this.p2PrevY = this.dummy.y;
  
      // Handle incoming broadcasts
      network.on('player-update', ({x, y, angle, flipX, frame, state, rotation}) => {
        const isPlayer1 = this.registry.isMultiplayerHost;

        if (isPlayer1) {
          this.dummy.setPosition(x, y);
          this.dummy.aimAngle = angle;
          this.dummy.flipX = flipX;
          this.dummy.core.setFrame(frame);
          this.dummy.playerState = state;
          this.dummy.setRotation(rotation);
        }
        else {
          this.cat.setPosition(x, y);
          this.cat.aimAngle = angle;
          this.cat.flipX = flipX;
          this.cat.core.setFrame(frame);
          this.cat.playerState = state;
          this.cat.setRotation(rotation);
        }
      });

      network.on('damage-tile', ({tileIndex, tileX, tileY, layerName}) => {
        let layer = this.ground;
        if (layerName === 'bgd1') layer = this.bgd1;
        else if (layerName === 'bgd2') layer = this.bgd2;
        else if (layerName === 'bgd3') layer = this.bgd3;
        else if (layerName === 'leaves') layer = this.leaves;
        else if (layerName === 'leavesBG1') layer = this.leavesBG1;
        else if (layerName === 'leavesBG2') layer = this.leavesBG2;
        
        const tile = layer.getTileAt(tileX, tileY, true);

        this.damageTile(
          {
            index: tileIndex,
            x: tileX,
            y: tileY
          },
          {
            x: tile.pixelX,
            y: tile.pixelY
          },
          layer,
          false,
          false
        );
      });

      this.peerBulletGfx = this.add.graphics();
      this.peerBulletGfx.setDepth(10);

      network.on('roboto-shoot', ({sx, sy, ex, ey}) => {
        if (typeof this !== 'undefined') {
          this.peerBulletGfx.lineStyle(8, 0xFBF236, 1);
          this.peerBulletGfx.lineBetween(sx, sy, ex, ey);
    
          this.time.addEvent({
            delay: 100,
            repeat: 0,
            callback: () => {
              this.peerBulletGfx.clear();
            }
          });
        }
      });

      this.shells = {};

      network.on('roboto-shell-create', ({id, x, y, rotation, flipX}) => {
        if (!(id in this.shells)) {
          this.shells[id] = new RobotoShell(
            this,
            x,
            y,
            rotation,
            flipX,
            false,
            true
          );
        }
      });

      network.on('roboto-shell-move', ({id, x, y}) => {
        if (typeof this.shells[id] !== 'undefined') {
          this.shells[id].setPosition(x, y);
        }
      });

      network.on('roboto-shell-detonate', ({id, x, y}) => {
        if (typeof this.shells[id] !== 'undefined') {
          this.shells[id].setPosition(x, y);
          this.shells[id].detonate();
          delete this.shells[id];
        }
      });

      network.on('roboto-shell-offmap', ({id, x, y}) => {
        if (typeof this.shells[id] !== 'undefined') {
          this.shells[id].setPosition(x, y);
          this.shells[id].offmap();
          delete this.shells[id];
        }
      });

      network.on('oswald-shoot', ({sx, sy, ex, ey}) => {
        if (typeof this !== 'undefined') {
          this.peerBulletGfx.lineStyle(4, 0xFBF236, 1);
          this.peerBulletGfx.lineBetween(sx, sy, ex, ey);

          this.time.addEvent({
            delay: 100,
            repeat: 0,
            callback: () => {
              this.peerBulletGfx.clear();
              this.peerBulletGfx.lineStyle(8, 0xCCCCCC, 1);
              this.peerBulletGfx.lineBetween(sx, sy, ex, ey);
  
              this.tweens.add({
                targets: [this.peerBulletGfx],
                alpha: 0,
                x: 100,
                y: -100,
                duration: 2500,
                onComplete: () => {
                  this.peerBulletGfx.clear();
                  this.peerBulletGfx.setPosition(0, 0);
                  this.peerBulletGfx.setAlpha(1);
                }
              });
            }
          });
        }
      });

      this.grenades = {};

      network.on('oswald-grenade-create', ({id, x, y}) => {
        if (!(id in this.grenades)) {
          this.grenades[id] = new OswaldGrendade(
            this,
            x,
            y,
            0,
            false,
            true
          );
        }
      });

      network.on('oswald-grenade-move', ({id, x, y, rotation}) => {
        if (typeof this.grenades[id] !== 'undefined') {
          this.grenades[id].setPosition(x, y);
          this.grenades[id].setRotation(rotation);
        }
      });

      network.on('oswald-grenade-bounce', ({id}) => {
        if (typeof this.grenades[id] !== 'undefined') {
          this.sound.play('sfx-grenade-bounce');
        }
      });

      network.on('oswald-grenade-detonate', ({id, x, y}) => {
        if (typeof this.grenades[id] !== 'undefined') {
          this.grenades[id].detonate();
          delete this.grenades[id];
        }
      });

      // Receiving damage from the other player
      network.on('damage-player', ({damage, x, y}) => {
        const isPlayer1 = this.registry.isMultiplayerHost;

        if (isPlayer1) {
          this.cat.takeDamage(damage, { x, y }, true);
        }
        else {
          this.dummy.takeDamage(damage, { x, y }, true);
        }
      });
    }
  }

  damageTile({index, x, y}, intersection, layer, isPlayer = false, sendChange = true) {
    if (sendChange && this.registry.isMultiplayer) {
      network.send('damage-tile', {
        tileIndex: index,
        tileX: x,
        tileY: y,
        layerName: layer.layer.name
      });
    }

    // Grass
    if (index === 1) {
      layer.putTileAt(11, x, y, true);
      this.dirtEmitter.explode(2, intersection.x, intersection.y);
      this.grassEmitter.explode(pMath.Between(5, 10), intersection.x, intersection.y);
    }
    else if (index === 11) {
      layer.putTileAt(21, x, y, true);
      this.dirtEmitter.explode(3, intersection.x, intersection.y);
      this.grassEmitter.explode(pMath.Between(5, 10), intersection.x, intersection.y);
    }
    else if (index === 21) {
      layer.putTileAt(31, x, y, true);
      this.dirtEmitter.explode(4, intersection.x, intersection.y);
      this.grassEmitter.explode(pMath.Between(10, 20), intersection.x, intersection.y);
    }
    else if (index === 31) {
      layer.putTileAt(41, x, y, true);
      this.dirtEmitter.explode(6, intersection.x, intersection.y);
      this.grassEmitter.explode(pMath.Between(5, 10), intersection.x, intersection.y);
    }
    else if (index === 41) {
      layer.removeTileAt(x, y, false, true);
      const tileUnder = layer.getTileAt(x, y + 1, true);

      if (isPlayer) {
        this.tilesDestroyed++;
      }
      
      this.dirtEmitter.explode(10, intersection.x, intersection.y);
      this.grassEmitter.explode(20, intersection.x, intersection.y);

      if (tileUnder) {
        if (tileUnder.index === 2) {
          layer.putTileAt(3, x, y + 1, true);
        }
        else if (tileUnder.index === 12) {
          layer.putTileAt(13, x, y + 1, true);
        }
        else if (tileUnder.index === 22) {
          layer.putTileAt(23, x, y + 1, true);
        }
        else if (tileUnder.index === 32) {
          layer.putTileAt(33, x, y + 1, true);
        }
        else if (tileUnder.index === 42) {
          layer.putTileAt(43, x, y + 1, true);
        }
        else if (tileUnder.index === 5) {
          layer.putTileAt(4, x, y + 1, true);
        }
        else if (tileUnder.index === 15) {
          layer.putTileAt(14, x, y + 1, true);
        }
        else if (tileUnder.index === 25) {
          layer.putTileAt(23, x, y + 1, true);
        }
        else if (tileUnder.index === 35) {
          layer.putTileAt(34, x, y + 1, true);
        }
        else if (tileUnder.index === 45) {
          layer.putTileAt(44, x, y + 1, true);
        }
      }
    }

    // Dirt (side)
    else if (index === 2) {
      layer.putTileAt(12, x, y, true);
      this.dirtEmitter.explode(2, intersection.x, intersection.y);
    }
    else if (index === 12) {
      layer.putTileAt(22, x, y, true);
      this.dirtEmitter.explode(3, intersection.x, intersection.y);
    }
    else if (index === 22) {
      layer.putTileAt(32, x, y, true);
      this.dirtEmitter.explode(4, intersection.x, intersection.y);
    }
    else if (index === 32) {
      layer.putTileAt(42, x, y, true);
      this.dirtEmitter.explode(6, intersection.x, intersection.y);
    }
    else if (index === 42) {
      layer.removeTileAt(x, y, false, true);
      const tileUnder = layer.getTileAt(x, y + 1, true);

      if (isPlayer) {
        this.tilesDestroyed++;
      }

      this.dirtEmitter.explode(10, intersection.x, intersection.y);

      if (tileUnder) {
        if (tileUnder.index === 2) {
          layer.putTileAt(3, x, y + 1, true);
        }
        else if (tileUnder.index === 12) {
          layer.putTileAt(13, x, y + 1, true);
        }
        else if (tileUnder.index === 22) {
          layer.putTileAt(23, x, y + 1, true);
        }
        else if (tileUnder.index === 32) {
          layer.putTileAt(33, x, y + 1, true);
        }
        else if (tileUnder.index === 42) {
          layer.putTileAt(43, x, y + 1, true);
        }
        else if (tileUnder.index === 5) {
          layer.putTileAt(4, x, y + 1, true);
        }
        else if (tileUnder.index === 15) {
          layer.putTileAt(14, x, y + 1, true);
        }
        else if (tileUnder.index === 25) {
          layer.putTileAt(23, x, y + 1, true);
        }
        else if (tileUnder.index === 35) {
          layer.putTileAt(34, x, y + 1, true);
        }
        else if (tileUnder.index === 45) {
          layer.putTileAt(44, x, y + 1, true);
        }
      }
    }

    // Dirt (top)
    else if (index === 3) {
      layer.putTileAt(13, x, y, true);
      this.dirtEmitter.explode(2, intersection.x, intersection.y);
    }
    else if (index === 13) {
      layer.putTileAt(23, x, y, true);
      this.dirtEmitter.explode(3, intersection.x, intersection.y);
    }
    else if (index === 23) {
      layer.putTileAt(33, x, y, true);
      this.dirtEmitter.explode(4, intersection.x, intersection.y);
    }
    else if (index === 33) {
      layer.putTileAt(43, x, y, true);
      this.dirtEmitter.explode(6, intersection.x, intersection.y);
    }
    else if (index === 43) {
      layer.removeTileAt(x, y, false, true);
      const tileUnder = layer.getTileAt(x, y + 1, true);

      if (isPlayer) {
        this.tilesDestroyed++;
      }

      this.dirtEmitter.explode(10, intersection.x, intersection.y);

      if (tileUnder) {
        if (tileUnder.index === 2) {
          layer.putTileAt(3, x, y + 1, true);
        }
        else if (tileUnder.index === 12) {
          layer.putTileAt(13, x, y + 1, true);
        }
        else if (tileUnder.index === 22) {
          layer.putTileAt(23, x, y + 1, true);
        }
        else if (tileUnder.index === 32) {
          layer.putTileAt(33, x, y + 1, true);
        }
        else if (tileUnder.index === 42) {
          layer.putTileAt(43, x, y + 1, true);
        }
        else if (tileUnder.index === 5) {
          layer.putTileAt(4, x, y + 1, true);
        }
        else if (tileUnder.index === 15) {
          layer.putTileAt(14, x, y + 1, true);
        }
        else if (tileUnder.index === 25) {
          layer.putTileAt(23, x, y + 1, true);
        }
        else if (tileUnder.index === 35) {
          layer.putTileAt(34, x, y + 1, true);
        }
        else if (tileUnder.index === 45) {
          layer.putTileAt(44, x, y + 1, true);
        }
      }
    }

    // Brick (top)
    else if (index === 4) {
      layer.putTileAt(14, x, y, true);
      this.brickEmitter.explode(2, intersection.x, intersection.y);
    }
    else if (index === 14) {
      layer.putTileAt(24, x, y, true);
      this.brickEmitter.explode(3, intersection.x, intersection.y);
    }
    else if (index === 24) {
      layer.putTileAt(34, x, y, true);
      this.brickEmitter.explode(4, intersection.x, intersection.y);
    }
    else if (index === 34) {
      layer.putTileAt(44, x, y, true);
      this.brickEmitter.explode(6, intersection.x, intersection.y);
    }
    else if (index === 44) {
      layer.removeTileAt(x, y, false, true);
      const tileUnder = layer.getTileAt(x, y + 1, true);

      if (isPlayer) {
        this.tilesDestroyed++;
      }

      this.brickEmitter.explode(10, intersection.x, intersection.y);

      if (tileUnder) {
        if (tileUnder.index === 2) {
          layer.putTileAt(3, x, y + 1, true);
        }
        else if (tileUnder.index === 12) {
          layer.putTileAt(13, x, y + 1, true);
        }
        else if (tileUnder.index === 22) {
          layer.putTileAt(23, x, y + 1, true);
        }
        else if (tileUnder.index === 32) {
          layer.putTileAt(33, x, y + 1, true);
        }
        else if (tileUnder.index === 42) {
          layer.putTileAt(43, x, y + 1, true);
        }
        else if (tileUnder.index === 5) {
          layer.putTileAt(4, x, y + 1, true);
        }
        else if (tileUnder.index === 15) {
          layer.putTileAt(14, x, y + 1, true);
        }
        else if (tileUnder.index === 25) {
          layer.putTileAt(23, x, y + 1, true);
        }
        else if (tileUnder.index === 35) {
          layer.putTileAt(34, x, y + 1, true);
        }
        else if (tileUnder.index === 45) {
          layer.putTileAt(44, x, y + 1, true);
        }
      }
    }

    // Brick (side)
    else if (index === 5) {
      layer.putTileAt(15, x, y, true);
      this.brickEmitter.explode(2, intersection.x, intersection.y);
    }
    else if (index === 15) {
      layer.putTileAt(25, x, y, true);
      this.brickEmitter.explode(3, intersection.x, intersection.y);
    }
    else if (index === 25) {
      layer.putTileAt(35, x, y, true);
      this.brickEmitter.explode(4, intersection.x, intersection.y);
    }
    else if (index === 35) {
      layer.putTileAt(45, x, y, true);
      this.brickEmitter.explode(6, intersection.x, intersection.y);
    }
    else if (index === 45) {
      layer.removeTileAt(x, y, false, true);
      const tileUnder = layer.getTileAt(x, y + 1, true);

      if (isPlayer) {
        this.tilesDestroyed++;
      }

      this.brickEmitter.explode(10, intersection.x, intersection.y);

      if (tileUnder) {
        if (tileUnder.index === 2) {
          layer.putTileAt(3, x, y + 1, true);
        }
        else if (tileUnder.index === 12) {
          layer.putTileAt(13, x, y + 1, true);
        }
        else if (tileUnder.index === 22) {
          layer.putTileAt(23, x, y + 1, true);
        }
        else if (tileUnder.index === 32) {
          layer.putTileAt(33, x, y + 1, true);
        }
        else if (tileUnder.index === 42) {
          layer.putTileAt(43, x, y + 1, true);
        }
        else if (tileUnder.index === 5) {
          layer.putTileAt(4, x, y + 1, true);
        }
        else if (tileUnder.index === 15) {
          layer.putTileAt(14, x, y + 1, true);
        }
        else if (tileUnder.index === 25) {
          layer.putTileAt(23, x, y + 1, true);
        }
        else if (tileUnder.index === 35) {
          layer.putTileAt(34, x, y + 1, true);
        }
        else if (tileUnder.index === 45) {
          this.ground.putTileAt(44, x, y + 1, true);
        }
      }
    }

    // Tree trunks/branches
    else if (index === 81) {
      layer.putTileAt(85, x, y, true);
      this.woodEmitter.explode(10, intersection.x, intersection.y);
    }
    else if (index === 85) {
      layer.removeTileAt(x, y, false, true);
      this.woodEmitter.explode(50, intersection.x, intersection.y);

      if (isPlayer) {
        this.tilesDestroyed++;
      }
    }
    else if (index === 82) {
      layer.putTileAt(86, x, y, true);
      this.woodEmitter.explode(10, intersection.x, intersection.y);
    }
    else if (index === 86) {
      layer.removeTileAt(x, y, false, true);
      this.woodEmitter.explode(50, intersection.x, intersection.y);

      if (isPlayer) {
        this.tilesDestroyed++;
      }
    }
    else if (index === 84) {
      layer.putTileAt(89, x, y, true);
      this.woodEmitter.explode(10, intersection.x, intersection.y);
    }
    else if (index === 89) {
      layer.removeTileAt(x, y, false, true);
      this.woodEmitter.explode(50, intersection.x, intersection.y);

      if (isPlayer) {
        this.tilesDestroyed++;
      }
    }
    else if (index === 85) {
      layer.putTileAt(90, x, y, true);
      this.woodEmitter.explode(10, intersection.x, intersection.y);
    }
    else if (index === 90) {
      layer.removeTileAt(x, y, false, true);
      this.woodEmitter.explode(50, intersection.x, intersection.y);

      if (isPlayer) {
        this.tilesDestroyed++;
      }
    }
    else if (index === 91) {
      layer.putTileAt(96, x, y, true);
      this.woodEmitter.explode(10, intersection.x, intersection.y);
    }
    else if (index === 96) {
      layer.removeTileAt(x, y, false, true);
      this.woodEmitter.explode(50, intersection.x, intersection.y);

      if (isPlayer) {
        this.tilesDestroyed++;
      }
    }
    else if (index === 92) {
      layer.putTileAt(97, x, y, true);
      this.woodEmitter.explode(10, intersection.x, intersection.y);
    }
    else if (index === 97) {
      layer.removeTileAt(x, y, false, true);
      this.woodEmitter.explode(50, intersection.x, intersection.y);

      if (isPlayer) {
        this.tilesDestroyed++;
      }
    }
    else if (index === 93) {
      layer.putTileAt(98, x, y, true);
      this.woodEmitter.explode(10, intersection.x, intersection.y);
    }
    else if (index === 98) {
      layer.removeTileAt(x, y, false, true);
      this.woodEmitter.explode(50, intersection.x, intersection.y);

      if (isPlayer) {
        this.tilesDestroyed++;
      }
    }
    else if (index === 94) {
      layer.putTileAt(98, x, y, true);
      this.woodEmitter.explode(10, intersection.x, intersection.y);
    }
    else if (index === 98) {
      layer.removeTileAt(x, y, false, true);
      this.woodEmitter.explode(50, intersection.x, intersection.y);

      if (isPlayer) {
        this.tilesDestroyed++;
      }
    }
    else if (index === 95) {
      layer.putTileAt(100, x, y, true);
      this.woodEmitter.explode(10, intersection.x, intersection.y);
    }
    else if (index === 100) {
      layer.removeTileAt(x, y, false, true);
      this.woodEmitter.explode(50, intersection.x, intersection.y);

      if (isPlayer) {
        this.tilesDestroyed++;
      }
    }
    else if (index === 101) {
      layer.putTileAt(106, x, y, true);
      this.woodEmitter.explode(10, intersection.x, intersection.y);
    }
    else if (index === 106) {
      layer.removeTileAt(x, y, false, true);
      this.woodEmitter.explode(50, intersection.x, intersection.y);

      if (isPlayer) {
        this.tilesDestroyed++;
      }
    }
    else if (index === 102) {
      layer.putTileAt(107, x, y, true);
      this.woodEmitter.explode(10, intersection.x, intersection.y);
    }
    else if (index === 107) {
      layer.removeTileAt(x, y, false, true);
      this.woodEmitter.explode(50, intersection.x, intersection.y);

      if (isPlayer) {
        this.tilesDestroyed++;
      }
    }
    else if (index === 103) {
      layer.putTileAt(108, x, y, true);
      this.woodEmitter.explode(10, intersection.x, intersection.y);
    }
    else if (index === 108) {
      layer.removeTileAt(x, y, false, true);
      this.woodEmitter.explode(50, intersection.x, intersection.y);

      if (isPlayer) {
        this.tilesDestroyed++;
      }
    }
    else if (index === 104) {
      layer.putTileAt(109, x, y, true);
      this.woodEmitter.explode(10, intersection.x, intersection.y);
    }
    else if (index === 109) {
      layer.removeTileAt(x, y, false, true);
      this.woodEmitter.explode(50, intersection.x, intersection.y);

      if (isPlayer) {
        this.tilesDestroyed++;
      }
    }
    else if (index === 105) {
      layer.putTileAt(110, x, y, true);
      this.woodEmitter.explode(10, intersection.x, intersection.y);
    }
    else if (index === 110) {
      layer.removeTileAt(x, y, false, true);
      this.woodEmitter.explode(50, intersection.x, intersection.y);

      if (isPlayer) {
        this.tilesDestroyed++;
      }
    }
    else if (index === 113) {
      layer.putTileAt(118, x, y, true);
      this.woodEmitter.explode(10, intersection.x, intersection.y);
    }
    else if (index === 118) {
      layer.removeTileAt(x, y, false, true);
      this.woodEmitter.explode(50, intersection.x, intersection.y);

      if (isPlayer) {
        this.tilesDestroyed++;
      }
    }
    else if (index === 123) {
      layer.putTileAt(127, x, y, true);
      this.woodEmitter.explode(10, intersection.x, intersection.y);
    }
    else if (index === 127) {
      layer.removeTileAt(x, y, false, true);
      this.woodEmitter.explode(50, intersection.x, intersection.y);

      if (isPlayer) {
        this.tilesDestroyed++;
      }
    }
    else if (index === 133) {
      layer.putTileAt(138, x, y, true);
      this.woodEmitter.explode(10, intersection.x, intersection.y);
    }
    else if (index === 138) {
      layer.removeTileAt(x, y, false, true);
      this.woodEmitter.explode(50, intersection.x, intersection.y);

      if (isPlayer) {
        this.tilesDestroyed++;
      }
    }

    // Leaves
    else if ([51, 52, 53, 54, 61, 62, 63, 71, 72, 73].includes(index)) {
      layer.removeTileAt(x, y, false, true);
      this.leavesEmitter.explode(50, intersection.x, intersection.y);

      if (isPlayer) {
        this.tilesDestroyed++;
      }
    }
  }

  update(time, delta) {
    // Track/broadcast updates if multiplayer
    if (this.registry.isMultiplayer) {
      const isPlayer1 = this.registry.isMultiplayerHost;

      if (isPlayer1) {
        // Broadcast new position
        network.send('player-update', {
          x: this.cat.x,
          y: this.cat.y,
          angle: this.cat.aimAngle,
          flipX: this.cat.core.flipX,
          frame: this.cat.core.frame.name,
          state: this.cat.playerState,
          rotation: this.cat.rotation
        });

        // Update previous position for next frame
        this.p1PrevX = this.cat.x;
        this.p1PrevY = this.cat.y;
      }
      else {
        // Broadcast new position
        network.send('player-update', {
          x: this.dummy.x,
          y: this.dummy.y,
          angle: this.dummy.aimAngle,
          flipX: this.dummy.core.flipX,
          frame: this.dummy.core.frame.name,
          state: this.dummy.playerState,
          rotation: this.dummy.rotation
        });

        // Update previous position for next frame
        this.p2PrevX = this.dummy.x;
        this.p2PrevY = this.dummy.y;
      }
    }

    // Apply timescale
    if (this.dirtEmitter.timeScale !== this.scaleTime) {
      this.dirtEmitter.timeScale = this.scaleTime;
    }
    if (this.grassEmitter.timeScale !== this.scaleTime) {
      this.grassEmitter.timeScale = this.scaleTime;
    }
    if (this.brickEmitter.timeScale !== this.scaleTime) {
      this.brickEmitter.timeScale = this.scaleTime;
    }
    if (this.woodEmitter.timeScale !== this.scaleTime) {
      this.woodEmitter.timeScale = this.scaleTime;
    }

    // Apply wind effect to leaves
    const leaves1Offset = new pMath.Vector2(Math.cos(time / 500) * 10, Math.sin(time / 500) * 10);
    const leaves2Offset = new pMath.Vector2(Math.cos(time / 500) * -10, Math.sin(time / 500) * -10);

    this.leavesBG1.setPosition(
      this.leavesBG1Pos.x + leaves1Offset.x,
      this.leavesBG1Pos.y + leaves1Offset.y
    );
    this.leavesBG2.setPosition(
      this.leavesBG2Pos.x + leaves2Offset.x,
      this.leavesBG2Pos.y + leaves2Offset.y
    );

    // Call player update functions
    // debugger;
    this.cat.update(time, delta);
    this.dummy.update(time, delta);

    // Pan / zoom to the midpoint between players
    // Shoutout to @samme for this solution!!
    // https://codepen.io/samme/pen/BaoXxdx?editors=0010
    if (!this.cat.isDead && !this.dummy.isDead) {
      if (!this.soloTest) {
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
export default GameScene2;