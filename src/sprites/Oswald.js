import { GameObjects, Math as pMath } from "phaser";
import { network } from "../network";
import OswaldGrendade from "./OswaldGrenade";
const { Container } = GameObjects;

class Oswald extends Container {
  constructor(scene, x, y) {
    super(scene, x, y, []);

    this.scene = scene;
    this.speed = 850;
    this.jumpForce = 950;
    this.isDead = false;

    this.core = this.scene.add.sprite(0, 0, 'oswald');
    this.core.play('oswald-idle');

    this.head = this.scene.add.image(-25, -150, 'oswald-head');
    this.head.setOrigin(0.4, 1);
    this.head.setScale(0.7);

    this.armL = this.scene.add.image(-20, -2, 'oswald-arm-l');
    this.armL.setScale(0.75);
    this.armL.setOrigin(0.075, 0.2);

    this.armR = this.scene.add.image(-20, -2, 'oswald-arm-r');
    this.armR.setScale(0.75);
    this.armR.setOrigin(0.075, 0.2);

    this.add([
      this.armL,
      this.core,
      this.armR,
      this.head
    ]);

    this.scene.add.existing(this);
    this.scene.physics.world.enable(this);

    this.body.setSize(100, 600);
    this.body.setOffset(-70, -287);

    this.cursors = this.scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    this.bulletGfx = this.scene.add.graphics();
    this.bulletGfx.setDepth(10);
    this.bulletRaycaster = this.scene.raycasterPlugin.createRaycaster({ debug: false });
    this.bulletRay = this.bulletRaycaster.createRay();

    this.isAiming = false;
    this.canShoot = true;
    this.isThrowing = false;

    this.scene.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.isThrowing = true;

        this.body.setVelocity(0);
        
        if (this.body.onFloor()) {
          this.core.play('oswald-throw');
        }
        else {
          this.core.play('oswald-down-throw');
        }

        // Throw grenade
        const angle = pMath.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY);
        new OswaldGrendade(this.scene, this.x, this.y, angle, true);
      }
      else if (this.canShoot && !this.isThrowing) {
        this.isAiming = true;
        this.scene.physics.world.timeScale = 3;
        this.scene.tweens.timeScale = 0.33;
        this.scene.scaleTime = 0.33;
        this.scene.time.timeScale = 0.33;
        this.scene.sound.play('sfx-time-slow');
        this.scene.bgm.setVolume(0.25);
        // this.scene.cameras.main.flash(2000, 255, 100, 255);
      }
    });

    this.scene.input.on('pointerup', () => {
      if (this.canShoot && this.isAiming) {
        this.canShoot = false;
        this.isAiming = false;
        this.scene.physics.world.timeScale = 1;
        this.scene.tweens.timeScale = 1;
        this.scene.scaleTime = 1;
        this.scene.time.timeScale = 1;
        this.scene.bgm.setVolume(1);
        this.scene.sound.play('sfx-sniper');

        this.scene.registry.playerTotalAttacks++;
  
        const barrelOffsetY = 23;
        const barrelOffsetX = 275;
        const vector = new pMath.Vector2();
        let angleMod = 2 * Math.PI;
  
        if (this.core.flipX) {
          angleMod = Math.PI;
        }
  
        vector.setToPolar(this.armL.rotation + angleMod, barrelOffsetX);
        
        this.bulletRay.setOrigin(this.x + this.armL.x + vector.x, this.y + this.armL.y + vector.y - barrelOffsetY);
        this.bulletRay.setAngle(this.armL.rotation + angleMod);
  
        const intersection = this.bulletRay.cast();
        let endX = vector.x * 300;
        let endY = vector.y * 300;
  
        if (intersection) {
          const isTile = (intersection.object && typeof intersection.object.getTilesWithinWorldXY === 'function');
          const isNPC = (intersection.object && intersection.object.getData('isNPC') === true);
          endX = intersection.x;
          endY = intersection.y;
  
          if (isTile) {
            const tiles = intersection.object.getTilesWithinWorldXY(intersection.x - 1, intersection.y - 1, 2, 2);

            tiles.forEach((tile) => {
              for (let i = 0; i < 5; i++) {
                this.scene.damageTile(tile, intersection, intersection.object, true);
              }
            });
          }
          else if (isNPC) {
            intersection.object.takeDamage(pMath.Between(150, 300), intersection);
            this.scene.registry.playerAttacksHit++;
          }
        }
  
        this.bulletGfx.lineStyle(4, 0xFBF236, 1);
        this.bulletGfx.lineBetween(this.x + this.armL.x + vector.x, this.y + this.armL.y + vector.y - barrelOffsetY, endX, endY);

        network.send('oswald-shoot', {
          sx: this.x + this.armL.x + vector.x,
          sy: this.y + this.armL.y + vector.y - barrelOffsetY,
          ex: endX,
          ey: endY
        });
  
        this.scene.time.addEvent({
          delay: 100,
          repeat: 0,
          callback: () => {
            this.bulletGfx.clear();
            this.bulletGfx.lineStyle(8, 0xCCCCCC, 1);
            this.bulletGfx.lineBetween(this.x + this.armL.x + vector.x, this.y + this.armL.y + vector.y - barrelOffsetY, endX, endY);

            this.scene.tweens.add({
              targets: [this.bulletGfx],
              alpha: 0,
              x: 100,
              y: -100,
              duration: 2500,
              onComplete: () => {
                this.bulletGfx.clear();
                this.bulletGfx.setPosition(0, 0);
                this.bulletGfx.setAlpha(1);
                this.canShoot = true;
              }
            });
          }
        });
      }
    });

    // Animation logic
    this.core.on('animationcomplete-oswald-throw', () => {
      this.isThrowing = false;
    });

    this.core.on('animationcomplete-oswald-down-throw', () => {
      this.isThrowing = false;
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

  takeDamage(dmg, intersection) {
    this.scene.registry.playerDamageTaken += dmg;

    if (!this.isDead) {
      if (this.scene.registry.playerHP > 0) {
        const txtX = intersection.x + pMath.Between(-200, 200);
        const txtY = intersection.y + pMath.Between(-200, 200);
        const dmgLabel = this.scene.add.text(txtX, txtY, `${dmg}`, {
          fontFamily: 'monospace',
          fontSize: (dmg < this.scene.registry.playerMaxHP * 0.05 ? 60 : 120),
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
  
      if (this.scene.registry.playerHP - dmg > 0) {
        this.scene.registry.playerHP -= dmg;
      }
      else {
        this.scene.registry.playerHP = 0;
        
        this.isDead = true;
  
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
        this.body.setVelocity(0, 0);
  
        // const maxDeathBurst = 500;

        // this.scene.cameras.main.flash(1000, 255, 255, 255, true);
        // this.scene.cameras.main.shake(1000);
        // this.scene.cameras.main.stopFollow();
        // this.scene.cameras.main.pan(this.x, this.y, 2000, 'Linear', true);
        // this.scene.cameras.main.zoomTo(1, 2000, 'Linear', true, (cam, prog) => {
        //   if (prog === 1) {
        //     this.scene.time.addEvent({
        //       delay: 1000,
        //       repeat: 0,
        //       callback: () => {
        //         this.scene.cameras.main.pan(this.scene.dummy.x, this.scene.dummy.y, 2000, 'Linear', true, (cam, prog) => {
        //           if (prog === 1) {
        //             this.scene.cameras.main.zoomTo(0.05, 7000, 'Linear', true);
        //           }
        //         });
        //       }
        //     });
        //   }
        // });
  
        // this.head.body.setAllowGravity(true);
        // this.head.body.setVelocity(pMath.Between(-maxDeathBurst, maxDeathBurst), pMath.Between(-maxDeathBurst * 2, -maxDeathBurst));
  
        // this.torsoLegs.body.setAllowGravity(true);
        // this.torsoLegs.body.setVelocity(pMath.Between(-maxDeathBurst, maxDeathBurst), pMath.Between(-maxDeathBurst * 2, -maxDeathBurst));
  
        // this.armLeft.body.setAllowGravity(true);
        // this.armLeft.body.setVelocity(pMath.Between(-maxDeathBurst, maxDeathBurst), pMath.Between(-maxDeathBurst * 2, -maxDeathBurst));
  
        // this.armRight.body.setAllowGravity(true);
        // this.armRight.body.setVelocity(pMath.Between(-maxDeathBurst, maxDeathBurst), pMath.Between(-maxDeathBurst * 2, -maxDeathBurst));
      }
    }
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
        if (!this.isAiming && !this.isThrowing) {
          if (left.isDown && (this.core.flipX || !this.body.onFloor())) {
            this.body.setVelocityX(-this.speed);
          }
          else if (left.isDown && !this.core.flipX) {
            this.body.setVelocityX(-this.speed / 2);
          }
          else if (right.isDown && (!this.core.flipX || !this.body.onFloor())) {
            this.body.setVelocityX(this.speed);
          }
          else if (right.isDown && this.core.flipX) {
            this.body.setVelocityX(this.speed / 2);
          }
          else {
            this.body.setVelocityX(0);
          }

          if (up.isDown && this.body.onFloor()) {
            this.body.setVelocityY(-this.jumpForce);
          }
        }
      }
      else if (!this.body.blocked.none) {
        this.isKnocked = false;
      }

      // Aim controls
      const {zoom, worldView} = this.scene.cameras.main;
      const relX = ((this.x - worldView.x) * zoom);
      const relY = ((this.y - worldView.y) * zoom);
  
      this.aimAngle = pMath.Angle.Between(relX + (this.head.x * zoom), relY + (this.head.y * zoom), mousePointer.x, mousePointer.y);
  
      let angleMod = Math.PI / 4;
      let armAngleMod = 2 * Math.PI - 0.1;
  
      if (mousePointer.x <= relX) {
        this.core.setFlipX(true);
        this.head.setFlipX(true);
        this.armL.setFlipX(true);
        this.armR.setFlipX(true);
        this.core.setX(-40);
        angleMod = Math.PI;
        armAngleMod = Math.PI + 0.1;

        this.head.setOrigin(1 - 0.45, 1);
        this.armL.setOrigin(1 - 0.075, 0.33);
        this.armR.setOrigin(1 - 0.075, 0.33);    
      }
      else {
        this.core.setFlipX(false);
        this.head.setFlipX(false);
        this.armL.setFlipX(false);
        this.armR.setFlipX(false);
        this.core.setX(0);

        this.head.setOrigin(0.45, 1);
        this.armL.setOrigin(0.075, 0.33);
        this.armR.setOrigin(0.075, 0.33);    
      }

      this.armL.setRotation(this.aimAngle + armAngleMod);
      this.armR.setRotation(this.aimAngle + armAngleMod);

      if (this.isAiming) {
        this.armL.setVisible(true);
        this.armR.setVisible(true);
      }
      else {
        this.armL.setVisible(false);
        this.armR.setVisible(false);
      }

      if ((this.aimAngle + angleMod) / 3 > 1) {
        this.head.setRotation(((this.aimAngle + angleMod) / 3) - 2);
      }
      else {
        this.head.setRotation((this.aimAngle + angleMod) / 3);
      }

      if (this.isAiming) {
        if (this.body.onFloor()) {
          this.playerState = 'aim-floor';
        }
        else {
          this.playerState = 'aim-air';
        }
      }
      else {
        this.playerState = '';
      }

      // Animation logic
      if (!this.isThrowing) {
        if (this.body.onFloor()) {
          this.head.setY(-150);
          this.armL.setY(0);
          this.armR.setY(0);

          if (this.isAiming) {
            this.core.play('oswald-aim', true);
            this.head.setY(-150 + 122);
          }
          else if (this.body.velocity.x !== 0) {
            if (this.core.flipX && this.body.velocity.x > 0 || !this.core.flipX && this.body.velocity.x < 0) {
              this.core.play('oswald-run-backwards', true)
            }
            else {
              this.core.play('oswald-run-forwards', true);
            }
          }
          else {
            this.core.play('oswald-idle', true);
          }
        }
        else {
          this.head.setY(-150);
          this.armL.setY(-125);
          this.armR.setY(-125);

          if (this.isAiming) {
            this.core.play('oswald-down-aim', true);
          }
          else if (this.body.velocity.y < 0) {
            this.core.play('oswald-up', true);
          }
          else if (this.body.velocity.y > 0) {
            this.core.play('oswald-down', true);
          }
        }
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
}

export default Oswald;