import { GameObjects, Math as pMath } from "phaser";
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

    this.debugGfx = this.scene.add.graphics();
    this.debugGfx.fillStyle(0xFF0000);
    this.debugGfx.fillRect(this.armRight.x, this.armRight.y, 2, 2);


    this.add([
      this.armLeft,
      this.torsoLegs,
      this.head,
      this.armRight,
      this.debugGfx
    ]);

    this.scene.add.existing(this);
    this.scene.physics.world.enable(this);

    this.body.setSize(140, 320);
    this.body.setOffset(-70, -200);
    this.body.setMaxVelocityY(this.jumpForce);

    this.cursors = this.scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
  }

  update(time, delta) {
    const {left, right, up} = this.cursors;
    const {mousePointer} = this.scene.input;

    if (left.isDown) {
      this.body.setVelocityX(-this.speed);
    }
    else if (right.isDown) {
      this.body.setVelocityX(this.speed);
    }
    else {
      this.body.setVelocityX(0);
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
    this.armRight.setRotation((angle + angleMod));

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
  }
}

export default Mech1;