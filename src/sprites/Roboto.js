import { GameObjects, Math as pMath } from "phaser";
import RobotoShell from "./RobotoShell";
import { network } from "../network";
const { Container } = GameObjects;

class Roboto extends Container {
  constructor(scene, x, y) {
    super(scene, x, y, []);

    this.scene = scene;
    this.speed = 800;
    this.jumpForce = 950;
    this.jumpAnimBuffer = 50;
    this.jumpAnimLock = false;
    this.isDead = false;
    this.animPrefix = 'r';
    this.isFlipped = false;

    this.core = this.scene.physics.add.sprite(0, 0, 'mech1');
    this.core.play('r-mech1-idle');
    this.core.body.setAllowGravity(false);

    this.armLeft = this.scene.physics.add.sprite(-20, -148, 'mech1-arm-left');
    this.armLeft.play('r-mech1-arm-left-idle');
    this.armLeft.setOrigin(0.19, 0.29);
    this.armLeft.body.setAllowGravity(false);

    this.armRight = this.scene.physics.add.sprite(-20, -148, 'mech1-arm-right');
    this.armRight.play('r-mech1-arm-right-idle');
    this.armRight.setOrigin(0.21, 0.28);
    this.armRight.body.setAllowGravity(false);

    this.head = this.scene.physics.add.image(-12, -185, 'mech1-head');
    this.head.setOrigin(0.5, 1);
    this.head.setScale(0.75);
    this.head.body.setAllowGravity(false);

    this.add([
      this.armLeft,
      this.core,
      this.head,
      this.armRight
    ]);

    this.scene.add.existing(this);
    this.scene.physics.world.enable(this);

    this.body.setSize(140, 320);
    this.body.setOffset(-70, -200);
    this.isKnocked = false;

    this.bulletGfx = this.scene.add.graphics();
    this.bulletGfx.setDepth(10);
    this.bulletRaycaster = this.scene.raycasterPlugin.createRaycaster({ debug: false });
    this.bulletRay = this.bulletRaycaster.createRay();

    this.cursors = this.scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // Muzzle flare lighting
    this.muzzleFlare = this.scene.lights.addLight(0, 0, 500, 0xFFFF00, 0);

    // Let the shoosting begin
    this.rapidfire = this.scene.time.addEvent({
      delay: 75,
      repeat: -1,
      paused: true,
      callback: () => {
        const barrelOffsetY = 23;
        const barrelOffsetX = 275;
        const vector = new pMath.Vector2();
        let angleMod = 2 * Math.PI;

        if (this.isFlipped) {
          angleMod = Math.PI;
        }

        vector.setToPolar(this.armLeft.rotation + angleMod, barrelOffsetX);
        
        this.bulletRay.setOrigin(this.x + this.armLeft.x + vector.x, this.y + this.armLeft.y + vector.y - barrelOffsetY);
        this.bulletRay.setAngle(this.armLeft.rotation + angleMod);
        
        this.muzzleFlare.setPosition(this.x + this.armLeft.x + vector.x, this.y + this.armLeft.y + vector.y - barrelOffsetY);
        
        const intersection = this.bulletRay.cast();
        let endX = vector.x * 300;
        let endY = vector.y * 300;

        if (intersection) {
          const isTile = (intersection.object && typeof intersection.object.getTilesWithinWorldXY === 'function');
          const isNPC = (intersection.object && intersection.object.getData('isNPC') === true);
          const isPeer = (intersection.object && intersection.object.getData('isPeer') === true);
          endX = intersection.x;
          endY = intersection.y;

          this.scene.registry.playerTotalAttacks++;

          if (isTile) {
            const tiles = intersection.object.getTilesWithinWorldXY(intersection.x - 1, intersection.y - 1, 2, 2);

            tiles.forEach((tile) => this.scene.damageTile(tile, intersection, intersection.object, true));
          }
          else if (isNPC) {
            const damage = pMath.Between(1, 5);
            intersection.object.takeDamage(damage, intersection);
            this.scene.registry.playerAttacksHit++;
          }
          else if (isPeer) {
            const damage = pMath.Between(1, 5);
            // network.send('damage-player', { damage, x: intersection.x, y: intersection.y });
            intersection.object.takeDamage(damage, intersection);
          }
        }

        this.bulletGfx.lineStyle(4, 0xFBF236, 1);
        this.bulletGfx.lineBetween(this.x + this.armLeft.x + vector.x, this.y + this.armLeft.y + vector.y - barrelOffsetY, endX, endY);

        if (this.scene.registry.isMultiplayer) {
          network.send('roboto-shoot', {
            sx: this.x + this.armLeft.x + vector.x,
            sy: this.y + this.armLeft.y + vector.y - barrelOffsetY,
            ex: endX,
            ey: endY
          });
        }

        this.muzzleFlare.setIntensity(2.5);

        this.scene.time.addEvent({
          delay: 100,
          repeat: 0,
          callback: () => {
            this.bulletGfx.clear();
            this.muzzleFlare.setIntensity(0);
          }
        });

        this.scene.sound.play('sfx-shoot', { volume: 0.5 });
      }
    });

    this.scene.input.on('pointerdown', (pointer) => {
      if (!this.isDead) {
        if (pointer.rightButtonDown()) {
          if (this.scene.registry.playerRockets > 0) {
            const barrelOffsetY = 145;
            const barrelOffsetX = 250;
            const vector = new pMath.Vector2();
            let angleMod = 2 * Math.PI;
    
            if (this.isFlipped) {
              angleMod = Math.PI;
            }
    
            vector.setToPolar(this.armLeft.rotation + angleMod, barrelOffsetX);
    
            new RobotoShell(this.scene, this.x + vector.x, this.y + vector.y - barrelOffsetY, this.armLeft.rotation, this.isFlipped, true);
    
            this.armLeft.play(`${this.animPrefix}-mech1-arm-left-heavy-shot`, true);
            this.armRight.play(`${this.animPrefix}-mech1-arm-right-heavy-shot`, true);
            this.scene.sound.play('sfx-rocket');
  
            this.scene.registry.playerRockets--;
  
            this.scene.time.addEvent({
              delay: 7500,
              repeat: 0,
              callback: () => {
                this.scene.registry.playerRockets++;
              }
            });
          }
          else {
            this.scene.sound.play('sfx-rocket-dry');
          }
        }
        else {
          this.rapidfire.paused = false;
          this.armLeft.play(`${this.animPrefix}-mech1-arm-left-light-shot`, true);
          this.armRight.play(`${this.animPrefix}-mech1-arm-right-light-shot`, true);
        }
      }
    });

    this.scene.input.on('pointerup', () => {
      if (!this.isDead) {
        this.rapidfire.paused = true;
        this.armLeft.play(`${this.animPrefix}-mech1-arm-left-idle`, true);
        this.armRight.play(`${this.animPrefix}-mech1-arm-right-idle`, true);
      }
    });

    // For tracking distance stat:
    this.prevX = this.x;
    this.prevY = this.y;

    // Aim world vector for multiplayer
    this.aimAngle = 0;
    this.playerState = '';

    // Set data attributes
    this.setData('isPlayer', true);
  }

  mapTarget(target) {
    this.bulletRaycaster.mapGameObjects(target, true);
  }

  mapGroundLayer(layer) {
    this.bulletRaycaster.mapGameObjects(layer, true, {
      collisionTiles: [1, 2, 3, 4, 5, 11, 12, 13, 14, 15, 21, 22, 23, 24, 25, 31, 32, 33, 34, 35, 41, 42, 43, 44, 45]
    });
  }

  mapDetailLayers(layers) {
    this.bulletRaycaster.mapGameObjects(layers, true, {
      collisionTiles: [51, 52, 53, 54, 61, 62, 63, 71, 72, 73, 81, 82, 84, 85, 86, 87, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 113, 118, 123, 127, 133, 137]
    });
  }

  applyHueRotation() {
    // Apply hue rotate
    // const hueRotatePipeline = this.scene.renderer.pipelines.get('HueRotate');
    // this.list.forEach((obj) => {
    //   if (obj.getData('isHitbox') !== true) {
    //     obj.setPipeline(hueRotatePipeline);
    //   }
    // });
    // hueRotatePipeline.time = 180.25; // magic numbers ftw
  }

  initLighting() {
    this.list.forEach((obj) => {
      if (obj.getData('isHitbox') !== true) {
        obj.setPipeline('Light2D');
      }
    });
  }

  setFlipX(flip) {
    this.isFlipped = flip;

    if (flip) {
      this.animPrefix = 'l';
    }
    else {
      this.animPrefix = 'r';
    }

    this.head.setTexture(`${this.animPrefix}-mech1-head`);
    this.armLeft.play(`${this.animPrefix}-mech1-arm-left-idle`);
    this.armRight.play(`${this.animPrefix}-mech1-arm-right-idle`);
  }

  takeDamage(dmg, intersection, isNetworkControlled = false) {
    this.scene.registry.playerDamageTaken += dmg;

    if (!this.isDead) {
      const {isMultiplayerHost: isPlayer1} = this.scene.registry;
      const {isMultiplayer} = this.scene.registry;

      if (
        !isMultiplayer ||
        (
          isPlayer1 && this.scene.registry.playerHP > 0 ||
          !isPlayer1 && this.scene.registry.enemyHP > 0 
        )
      ) {
        // let maxHP = (isPlayer1 ? this.scene.registry.playerHP : this.scene.registry.enemyHP);
        let maxHP = this.scene.registry.playerHP;

        if (isMultiplayer && !isPlayer1) {
          maxHP = this.scene.registry.enemyHP;
        }
        
        const txtX = intersection.x + pMath.Between(-200, 200);
        const txtY = intersection.y + pMath.Between(-200, 200);
        const dmgLabel = this.scene.add.text(txtX, txtY, `${dmg}`, {
          fontFamily: 'monospace',
          fontSize: (dmg < maxHP * 0.05 ? 60 : 120),
          color: '#FFF',
          stroke: '#000',
          strokeThickness: 4
        });
        dmgLabel.setOrigin(0.5);
        dmgLabel.setDepth(100);
  
        this.scene.tweens.add({
          targets: dmgLabel,
          alpha: 0,
          y: dmgLabel.y - 200,
          duration: 1000,
          onComplete: () => {
            dmgLabel.destroy();
          }
        });
      }
  
      if (!isMultiplayer && this.scene.registry.playerHP - dmg > 0) {
        this.scene.registry.playerHP -= dmg;
      }
      else if (isMultiplayer && isPlayer1 && this.scene.registry.playerHP - dmg > 0) {
        this.scene.registry.playerHP -= dmg;
      }
      else if (isMultiplayer && !isPlayer1 && this.scene.registry.enemyHP - dmg > 0) {
        this.scene.registry.enemyHP -= dmg;
      }
      else {
        if (isPlayer1 || !isMultiplayer) {
          this.scene.registry.playerHP = 0;
        }
        else {
          this.scene.registry.enemyHP = 0;
        }
        
        this.isDead = true;
  
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
        this.body.setVelocity(0, 0);
  
        const maxDeathBurst = 500;

        // this.scene.cameras.main.flash(1000, 255, 255, 255, true);
        this.scene.cameras.main.shake(1000);
        this.scene.cameras.main.stopFollow();
        this.scene.cameras.main.pan(this.x, this.y, 2000, 'Linear', true);
        this.scene.cameras.main.zoomTo(1, 2000, 'Linear', true, (cam, prog) => {
          if (prog === 1) {
            this.scene.time.addEvent({
              delay: 1000,
              repeat: 0,
              callback: () => {
                this.scene.cameras.main.pan(this.scene.dummy.x, this.scene.dummy.y, 2000, 'Linear', true, (cam, prog) => {
                  if (prog === 1) {
                    this.scene.cameras.main.zoomTo(0.05, 7000, 'Linear', true);
                  }
                });
              }
            });
          }
        });
  
        this.head.body.setAllowGravity(true);
        this.head.body.setVelocity(pMath.Between(-maxDeathBurst, maxDeathBurst), pMath.Between(-maxDeathBurst * 2, -maxDeathBurst));
  
        this.core.body.setAllowGravity(true);
        this.core.body.setVelocity(pMath.Between(-maxDeathBurst, maxDeathBurst), pMath.Between(-maxDeathBurst * 2, -maxDeathBurst));
  
        this.armLeft.body.setAllowGravity(true);
        this.armLeft.body.setVelocity(pMath.Between(-maxDeathBurst, maxDeathBurst), pMath.Between(-maxDeathBurst * 2, -maxDeathBurst));
  
        this.armRight.body.setAllowGravity(true);
        this.armRight.body.setVelocity(pMath.Between(-maxDeathBurst, maxDeathBurst), pMath.Between(-maxDeathBurst * 2, -maxDeathBurst));
      }
    }
  }

  update(time, delta) {
    const {left, right, up} = this.cursors;
    const {mousePointer} = this.scene.input;

    // Distance tracking...
    const xDiff = Math.abs(this.x - this.prevX);
    const yDiff = Math.abs(this.y - this.prevY);

    this.scene.registry.playerDistanceMoved += (xDiff + yDiff);

    this.prevX = this.x;
    this.prevY = this.y;

    if (!this.isDead) {
      if (!this.isKnocked) {
        if (left.isDown) {
          this.body.setVelocityX(-this.speed);
        }
        else if (right.isDown) {
          this.body.setVelocityX(this.speed);
        }
        else {
          this.body.setVelocityX(0);
        }
      }
      else if (!this.body.blocked.none) {
        this.isKnocked = false;
      }
  
      if (up.isDown && this.body.onFloor()) {
        this.body.setVelocityY(-this.jumpForce);
      }
  
      // Aim controls
      const {zoom, worldView} = this.scene.cameras.main;
      const relX = ((this.x - worldView.x) * zoom);
      const relY = ((this.y - worldView.y) * zoom);
  
      this.aimAngle = pMath.Angle.Between(relX + (this.armLeft.x * zoom), relY + (this.armLeft.y * zoom), mousePointer.x, mousePointer.y);
  
      let angleMod = 2 * Math.PI;
      let headAngleMod = 0.35;
  
      if (mousePointer.x <= relX) {
        this.setFlipX(true);
        this.armLeft.setOrigin(1 - 0.19, 0.29);
        this.armRight.setOrigin(1 - 0.21, 0.28);
        this.armLeft.setX(20);
        this.armRight.setX(20);
        this.head.setX(12);
        angleMod = Math.PI;
        headAngleMod = 0.35;
      }
      else {
        this.setFlipX(false);
        this.armLeft.setOrigin(0.19, 0.29);
        this.armRight.setOrigin(0.21, 0.28);
        this.armLeft.setX(-20);
        this.armRight.setX(-20);
        this.head.setX(-12);
      }
  
      this.armLeft.setRotation(this.aimAngle + angleMod);
      this.armRight.setRotation(this.aimAngle + angleMod);
      // this.head.setRotation(this.aimAngle * headAngleMod + angleMod);
      this.head.setRotation(this.aimAngle + angleMod);
  
      // Animation logic
      if (this.body.onFloor()) {
        this.jumpAnimLock = false;
  
        if (this.body.velocity.x !== 0) {
          if (this.isFlipped && this.body.velocity.x > 0 || !this.isFlipped && this.body.velocity.x < 0) {
            this.core.playReverse(`${this.animPrefix}-mech1-run`, true);
          }
          else {
            this.core.play(`${this.animPrefix}-mech1-run`, true);
          }
        }
        else {
          this.core.play(`${this.animPrefix}-mech1-idle`, true);
        }
      }
      else {
        if (this.body.velocity.y < -this.jumpAnimBuffer) {
          this.core.play(`${this.animPrefix}-mech1-up`, true);
        }
        else if (this.body.velocity.y > this.jumpAnimBuffer) {
          this.core.play(`${this.animPrefix}-mech1-down`, true);
        }
        else if (!this.jumpAnimLock) {
          this.core.play(`${this.animPrefix}-mech1-up-down`, true);
          this.jumpAnimLock = true;
        }
      }
  
      // Map bounds handling
      const {widthInPixels, heightInPixels} = this.scene.tilemap;
  
      if (this.x > widthInPixels) {
        this.setX(0);
      }
      else if (this.x < 0) {
        this.setX(widthInPixels);
      }
  
      if (this.y > heightInPixels) {
        this.setY(0);
      }
      else if (this.y < 0) {
        this.setY(heightInPixels);
      }
    }
    // Spin body parts around when dead
    else {
      const flipRot = 5 * Math.PI * (delta / 1000);
      
      this.head.setOrigin(0.5);
      this.core.setOrigin(0.5);
      this.armLeft.setOrigin(0.5);
      this.armRight.setOrigin(0.5);

      this.head.rotation -= flipRot;
      this.core.rotation += flipRot;
      this.armLeft.rotation -= flipRot;
      this.armRight.rotation += flipRot;
    }
  }
}

export default Roboto;