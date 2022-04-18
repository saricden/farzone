import { GameObjects, Math as pMath } from "phaser";
import Mech1Shell from "./Mech1Shell";
const { Container } = GameObjects;

class Mech1 extends Container {
  constructor(scene, x, y) {
    super(scene, x, y, []);

    this.scene = scene;
    this.speed = 800;
    this.jumpForce = 950;
    this.jumpAnimBuffer = 50;
    this.jumpAnimLock = false;

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
    this.bulletRay = this.bulletRaycaster.createRay();

    this.cursors = this.scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

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

    this.scene.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        const barrelOffsetY = 145;
        const barrelOffsetX = 250;
        const vector = new pMath.Vector2();
        let angleMod = 2 * Math.PI;

        if (this.torsoLegs.flipX) {
          angleMod = Math.PI;
        }

        vector.setToPolar(this.armLeft.rotation + angleMod, barrelOffsetX);

        const shell = new Mech1Shell(this.scene, this.x + vector.x, this.y + vector.y - barrelOffsetY, this.armLeft.rotation, this.torsoLegs.flipX);

        this.armLeft.play('mech1-arm-left-heavy-shot', true);
        this.armRight.play('mech1-arm-right-heavy-shot', true);
        this.scene.sound.play('sfx-rocket');
      }
      else {
        this.rapidfire.paused = false;
        this.armLeft.play('mech1-arm-left-light-shot', true);
        this.armRight.play('mech1-arm-right-light-shot', true);
      }
    });

    this.scene.input.on('pointerup', () => {
      this.rapidfire.paused = true;
      this.armLeft.play('mech1-arm-left-idle', true);
      this.armRight.play('mech1-arm-right-idle', true);
    });

  }

  update(time, delta) {
    const {left, right, up} = this.cursors;
    const {mousePointer} = this.scene.input;

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

    const angle = pMath.Angle.Between(relX + (this.armLeft.x * zoom), relY + (this.armLeft.y * zoom), mousePointer.x, mousePointer.y);

    let angleMod = 2 * Math.PI;
    let headAngleMod = 0.35;

    if (mousePointer.x <= relX) {
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
      headAngleMod = 0.35;
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

    this.armLeft.setRotation(angle + angleMod);
    this.armRight.setRotation(angle + angleMod);
    // this.head.setRotation(angle * headAngleMod + angleMod);
    this.head.setRotation(angle + angleMod);

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

export default Mech1;