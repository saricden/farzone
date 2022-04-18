import { GameObjects, Math as pMath } from "phaser";
import Mech1Shell from "./Mech1Shell";
const { Container } = GameObjects;

class Mech1NPC extends Container {
  constructor(scene, x, y, target) {
    super(scene, x, y, []);

    this.scene = scene;
    this.target = target;
    this.speed = 800;
    this.jumpForce = 950;
    this.jumpAnimBuffer = 50;
    this.jumpAnimLock = false;

    // AI controls
    this.triggerDelay = 2000; // The # of MS to change shooting state
    this.aimEntropy = 500; // The PX aim offset from the target, scaled by SIN(time)
    this.reflexDelay = 100; // The MS speed of retargeting

    this.torsoLegs = this.scene.add.sprite(0, 0, 'mech1');
    this.torsoLegs.play('mech1-idle');

    this.armLeft = this.scene.add.sprite(-20, -148, 'mech1-arm-left');
    this.armLeft.play('mech1-arm-left-idle');
    this.armLeft.setOrigin(0.19, 0.29);

    this.armRight = this.scene.add.sprite(-20, -148, 'mech1-arm-right');
    this.armRight.play('mech1-arm-right-idle');
    this.armRight.setOrigin(0.21, 0.28);

    this.head = this.scene.add.image(-12, -185, 'mech1-head');
    this.head.setOrigin(0.5, 1);
    this.head.setScale(0.75);

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
    this.bulletRaycaster.mapGameObjects(this.scene.ground, true, {
      collisionTiles: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    });
    this.bulletRaycaster.mapGameObjects(this.target, true);
    this.bulletRay = this.bulletRaycaster.createRay();

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

        if (this.torsoLegs.flipX) {
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
          endX = intersection.x;
          endY = intersection.y;

          if (isTile) {
            const tiles = intersection.object.getTilesWithinWorldXY(intersection.x - 1, intersection.y - 1, 2, 2);

            tiles.forEach((tile) => this.scene.damageTile(tile, intersection));
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

        this.scene.sound.play('sfx-shoot');
      }
    });

    // Aiming controls
    this.timeOffset = 0;

    this.scene.time.addEvent({
      delay: 1000,
      repeat: -1,
      callback: () => {
        const {zoom} = this.scene.cameras.main;
        const d2p = pMath.Distance.Between(this.x, this.y, target.x, target.y);
        const angle = pMath.Angle.Between(this.x + (this.armLeft.x * zoom), this.y + (this.armLeft.y * zoom), target.x + (Math.sin(this.timeOffset) * this.aimEntropy), target.y + Math.sin(this.timeOffset) * this.aimEntropy);
        let angleMod = 2 * Math.PI;

        if (target.x <= this.x) {
          this.torsoLegs.setFlipX(true);
          this.armLeft.setFlipX(true);
          this.armRight.setFlipX(true);
          this.head.setFlipX(true);
          this.armLeft.setOrigin(1 - 0.19, 0.29);
          this.armRight.setOrigin(1 - 0.21, 0.28);
          this.armLeft.setX(20);
          this.armRight.setX(20);
          this.head.setX(12);
          angleMod = Math.PI;
        }
        else {
          this.torsoLegs.setFlipX(false);
          this.armLeft.setFlipX(false);
          this.armRight.setFlipX(false);
          this.head.setFlipX(false);
          this.armLeft.setOrigin(0.19, 0.29);
          this.armRight.setOrigin(0.21, 0.28);
          this.armLeft.setX(-20);
          this.armRight.setX(-20);
          this.head.setX(-12);
        }

        const newAngle = pMath.Angle.ShortestBetween(this.armLeft.rotation, angle + angleMod);
        console.log(angle + angleMod, newAngle);
        
        this.scene.tweens.add({
          targets: [this.armLeft, this.armRight, this.head],
          duration: this.reflexDelay,
          rotation: newAngle
        });
      }
    });
  }

  update(time, delta) {
    const {target} = this;

    this.timeOffset = time;

    // Clear shot?
    const barrelOffsetY = 23;
    const barrelOffsetX = 275;
    const vector = new pMath.Vector2();
    let angleMod2 = Math.PI;

    if (this.torsoLegs.flipX) {
      // angleMod2 = 2 * Math.PI;
    }

    vector.setToPolar(this.armLeft.rotation + angleMod2, barrelOffsetX);
    
    this.bulletRay.setOrigin(this.x + this.armLeft.x + vector.x, this.y + this.armLeft.y + vector.y - barrelOffsetY);
    this.bulletRay.setAngle(this.armLeft.rotation + angleMod2);
    
    const intersection = this.bulletRay.cast();

    if (intersection) {
      const isPlayer = (intersection.object && intersection.object.getData('isPlayer') === true);

      this.scene.time.addEvent({
        delay: this.triggerDelay = 250,
        repeat: 0,
        callback: () => {
          this.rapidfire.paused = !isPlayer;
        }
      });
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
          this.torsoLegs.playReverse('mech1-run', true);
        }
        else {
          this.torsoLegs.play('mech1-run', true);
        }
      }
      else {
        this.torsoLegs.play('mech1-idle', true);
      }
    }
    else {
      if (this.body.velocity.y < -this.jumpAnimBuffer) {
        this.torsoLegs.play('mech1-up', true);
      }
      else if (this.body.velocity.y > this.jumpAnimBuffer) {
        this.torsoLegs.play('mech1-down', true);
      }
      else if (!this.jumpAnimLock) {
        this.torsoLegs.play('mech1-up-down', true);
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
}

export default Mech1NPC;