import { GameObjects, Math as pMath } from "phaser";
import Mech1Shell from "./Mech1Shell";
const { Container } = GameObjects;

class RobotoNPC extends Container {
  constructor(scene, x, y) {
    super(scene, x, y, []);

    this.scene = scene;
    this.target = null;
    this.speed = 800;
    this.jumpForce = 950;
    this.jumpAnimBuffer = 50;
    this.jumpAnimLock = false;
    this.isDead = false;
    this.isPaused = false;
    this.animPrefix = 'r';
    this.isFlipped = false;

    // AI config
    this.triggerDelay = 25; // The # of MS to change shooting state
    this.aimEntropy = 0.05; // Scaler value min(-)/max(+) -- higher values = less accurate
    this.reflexDelay = 500; // The MS speed of retargeting
    this.closeThreshold = 2000; // The distance before the enemy will stop moving

    this.torsoLegs = this.scene.physics.add.sprite(0, 0, 'mech1');
    this.torsoLegs.play('r-mech1-idle');
    this.torsoLegs.body.setAllowGravity(false);

    this.armLeft = this.scene.physics.add.sprite(-20, -148, 'mech1-arm-left');
    this.armLeft.play('r-mech1-arm-left-idle');
    this.armLeft.setOrigin(0.19, 0.29);
    this.armLeft.body.setAllowGravity(false);

    this.armRight = this.scene.physics.add.sprite(-20, -148, 'mech1-arm-right');
    this.armRight.play('r-mech1-arm-right-idle');
    this.armRight.setOrigin(0.21, 0.28);
    this.armRight.body.setAllowGravity(false);

    this.head = this.scene.physics.add.image(-12, -185, 'r-mech1-head');
    this.head.setOrigin(0.5, 1);
    this.head.setScale(0.75);
    this.head.body.setAllowGravity(false);

    this.add([
      this.armLeft,
      this.torsoLegs,
      this.head,
      this.armRight
    ]);

    this.scene.add.existing(this);
    this.scene.physics.world.enable(this);

    this.body.setSize(140, 320);
    this.body.setOffset(-70, -200);
    this.body.setMaxVelocity(this.jumpForce);
    this.isKnocked = false;

    this.bulletGfx = this.scene.add.graphics();
    this.bulletGfx.setDepth(10);
    this.bulletRaycaster = this.scene.raycasterPlugin.createRaycaster({ debug: false });
    this.bulletRay = this.bulletRaycaster.createRay();

    this.gapRaycaster = this.scene.raycasterPlugin.createRaycaster({ debug: false });
    this.gapRaycaster.mapGameObjects(this.scene.ground, true, {
      collisionTiles: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    });
    this.gapRay = this.gapRaycaster.createRay();

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
        
        const intersection = this.bulletRay.cast();
        let endX = vector.x * 300;
        let endY = vector.y * 300;

        if (intersection) {
          const isTile = (intersection.object && typeof intersection.object.getTilesWithinWorldXY === 'function');
          const isPlayer = (intersection.object && intersection.object.getData('isPlayer') === true);
          endX = intersection.x;
          endY = intersection.y;

          if (isTile) {
            const tiles = intersection.object.getTilesWithinWorldXY(intersection.x - 1, intersection.y - 1, 2, 2);

            tiles.forEach((tile) => this.scene.damageTile(tile, intersection, intersection.object));
          }
          else if (isPlayer) {
            // Handling for Arial's shield ability
            if (intersection.object.isBlocking) {
              const {object} = intersection;
              const {blockArmShield} = object;

              const angleDiff = pMath.Angle.ShortestBetween(blockArmShield.angle, pMath.RadToDeg(this.bulletRay.angle));
              const blockThreshold = 20;
              const blocked = (angleDiff <= 90 + blockThreshold && angleDiff >= 90 - blockThreshold);

              if (!blocked) {
                intersection.object.takeDamage(pMath.Between(0, 2), intersection);
              }
            }
            else {
              intersection.object.takeDamage(pMath.Between(0, 2), intersection);
            }
          }
        }

        this.bulletGfx.lineStyle(4, 0xFBF236, 1);
        this.bulletGfx.lineBetween(this.x + this.armLeft.x + vector.x, this.y + this.armLeft.y + vector.y - barrelOffsetY, endX, endY);

        this.scene.time.addEvent({
          delay: 10,
          repeat: 0,
          callback: () => {
            this.bulletGfx.clear();
          }
        });

        this.scene.sound.play('sfx-shoot', { volume: 0.5 });
      }
    });

    // Aiming controls
    this.scene.time.addEvent({
      delay: this.reflexDelay,
      repeat: -1,
      callback: () => {
        if (!this.target.isDead && !this.isDead) {
          const d2p = pMath.Distance.Between(this.x, this.y, this.target.x, this.target.y);
          const missX = (pMath.FloatBetween(-this.aimEntropy, this.aimEntropy) * d2p * 2);
          const missY = (pMath.FloatBetween(-this.aimEntropy, this.aimEntropy) * d2p * 2);
          const angle = pMath.Angle.Between(this.x + this.armLeft.x, this.y + this.armLeft.y, this.target.x + missX, this.target.y + missY);
  
          let angleMod = 2 * Math.PI;
  
          if (this.target.x <= this.x) {
            this.setFlipX(true);
            this.armLeft.setOrigin(1 - 0.19, 0.29);
            this.armRight.setOrigin(1 - 0.21, 0.28);
            this.armLeft.setX(20);
            this.armRight.setX(20);
            this.head.setX(12);
            angleMod = Math.PI;
          }
          else {
            this.setFlipX(false);
            this.armLeft.setOrigin(0.19, 0.29);
            this.armRight.setOrigin(0.21, 0.28);
            this.armLeft.setX(-20);
            this.armRight.setX(-20);
            this.head.setX(-12);
          }
  
          this.armLeft.setRotation(angle + angleMod);
          this.armRight.setRotation(angle + angleMod);
          this.head.setRotation(angle + angleMod);
        }
      }
    });

    // Set data attributes
    this.setData('isNPC', true);
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

  mapTarget(target) {
    this.target = target;
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

  takeDamage(dmg, intersection) {
    this.scene.registry.playerDamageInflicted += dmg;

    if (this.scene.registry.enemyHP > 0) {
      const txtX = intersection.x + pMath.Between(-200, 200);
      const txtY = intersection.y + pMath.Between(-200, 200);
      const dmgLabel = this.scene.add.text(txtX, txtY, `${dmg}`, {
        fontFamily: 'monospace',
        fontSize: (dmg < this.scene.registry.enemyMaxHP * 0.05 ? 60 : 120),
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
    
    if (this.scene.registry.enemyHP - dmg > 0) {
      this.scene.registry.enemyHP -= dmg;
    }
    else {
      this.scene.registry.enemyHP = 0;

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
              this.scene.cameras.main.pan(this.scene.cat.x, this.scene.cat.y, 2000, 'Linear', true, (cam, prog) => {
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

      this.torsoLegs.body.setAllowGravity(true);
      this.torsoLegs.body.setVelocity(pMath.Between(-maxDeathBurst, maxDeathBurst), pMath.Between(-maxDeathBurst * 2, -maxDeathBurst));

      this.armLeft.body.setAllowGravity(true);
      this.armLeft.body.setVelocity(pMath.Between(-maxDeathBurst, maxDeathBurst), pMath.Between(-maxDeathBurst * 2, -maxDeathBurst));

      this.armRight.body.setAllowGravity(true);
      this.armRight.body.setVelocity(pMath.Between(-maxDeathBurst, maxDeathBurst), pMath.Between(-maxDeathBurst * 2, -maxDeathBurst));
    }
  }

  update(time, delta) {
    const {target} = this;

    // Adjust timescale when needed
    if (this.scene.scaleTime !== this.torsoLegs.anims.timeScale) {
      this.torsoLegs.anims.timeScale = this.scene.scaleTime;
    }

    if (!this.isDead && !this.isPaused) {
      // Run towards player
      const d2p = pMath.Distance.Between(this.x, this.y, target.x, target.y);
  
      if (!target.isDead) {
        if (!this.isKnocked) {
          if (d2p > this.closeThreshold) {
            const xDirMod = (this.x <= target.x ? 1 : -1);
            this.body.setVelocityX(this.speed * xDirMod);
  
            // Cast a ray from beside the enemy straight down, to detect if there's a gap
            this.gapRay.setOrigin(this.x + xDirMod * 200, this.y);
            this.gapRay.setAngle(Math.PI / 2);
            const intersection = this.gapRay.cast();
      
            if (
              this.body.onFloor() &&
              (
                (this.body.blocked.left || this.body.blocked.right) ||
                (intersection === false)
              )
            ) {
              this.body.setVelocityY(-this.jumpForce);
            }
          }
          else {
            this.body.setVelocityX(0);
          }
        }
      }
      else {
        this.body.setVelocityX(0);
      }
  
      // Shooting logic
      const barrelOffsetY = 23;
      const barrelOffsetX = 275;
      const vector = new pMath.Vector2();
      let angleMod2 = 2 * Math.PI;
  
      if (this.torsoLegs.flipX) {
        angleMod2 = Math.PI;
      }
  
      vector.setToPolar(this.armLeft.rotation + angleMod2, barrelOffsetX);
      
      this.bulletRay.setOrigin(this.x + this.armLeft.x + vector.x, this.y + this.armLeft.y + vector.y - barrelOffsetY);
      this.bulletRay.setAngle(this.armLeft.rotation + angleMod2);
      
      const intersection = this.bulletRay.cast();
  
      if (intersection) {
        const isPlayer = (intersection.object && intersection.object.getData('isPlayer') === true);
        const isTile = (intersection.object && typeof intersection.object.getTilesWithinWorldXY === 'function');
  
        this.scene.time.addEvent({
          delay: this.triggerDelay,
          repeat: 0,
          callback: () => {
            if (target.isDead || this.isDead) {
              this.rapidfire.paused = true;
            }
            else {
              this.rapidfire.paused = (!isPlayer && !isTile);
            }
          }
        });
  
        const doShootRocket = (pMath.Between(0, d2p) < 500 && !target.isDead);
  
        if (isPlayer && doShootRocket && this.scene.registry.enemyRockets > 0) {
          new Mech1Shell(this.scene, this.x + vector.x, this.y + vector.y - barrelOffsetY, this.armLeft.rotation, this.torsoLegs.flipX);
  
          this.scene.sound.play('sfx-rocket');
  
          this.scene.registry.enemyRockets--;
  
          this.scene.time.addEvent({
            delay: 7500,
            repeat: 0,
            callback: () => {
              this.scene.registry.enemyRockets++;
            }
          });
        }
      }
  
      if (!this.isKnocked) {
        // Movement logic
      }
      else if (!this.body.blocked.none) {
        this.isKnocked = false;
      }
  
      if (this.body.onFloor()) {
        // Jump logic
      }
  
      // Animation logic
      if (this.body.onFloor()) {
        this.jumpAnimLock = false;
  
        if (this.body.velocity.x !== 0) {
          if (this.torsoLegs.flipX && this.body.velocity.x > 0 || !this.torsoLegs.flipX && this.body.velocity.x < 0) {
            this.torsoLegs.playReverse(`${this.animPrefix}-mech1-run`, true);
          }
          else {
            this.torsoLegs.play(`${this.animPrefix}-mech1-run`, true);
          }
        }
        else {
          this.torsoLegs.play(`${this.animPrefix}-mech1-idle`, true);
        }
      }
      else {
        if (this.body.velocity.y < -this.jumpAnimBuffer) {
          this.torsoLegs.play(`${this.animPrefix}-mech1-up`, true);
        }
        else if (this.body.velocity.y > this.jumpAnimBuffer) {
          this.torsoLegs.play(`${this.animPrefix}-mech1-down`, true);
        }
        else if (!this.jumpAnimLock) {
          this.torsoLegs.play(`${this.animPrefix}-mech1-up-down`, true);
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
    else if (!this.isPaused) {
      const flipRot = 5 * Math.PI * (delta / 1000);
      
      this.head.setOrigin(0.5);
      this.torsoLegs.setOrigin(0.5);
      this.armLeft.setOrigin(0.5);
      this.armRight.setOrigin(0.5);

      this.head.rotation -= flipRot;
      this.torsoLegs.rotation += flipRot;
      this.armLeft.rotation -= flipRot;
      this.armRight.rotation += flipRot;
    }
  }
}

export default RobotoNPC;