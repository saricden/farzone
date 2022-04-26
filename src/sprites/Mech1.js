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
    this.isDead = false;

    this.torsoLegs = this.scene.physics.add.sprite(0, 0, 'mech1');
    this.torsoLegs.play('mech1-idle');
    this.torsoLegs.body.setAllowGravity(false);

    this.armLeft = this.scene.physics.add.sprite(-20, -148, 'mech1-arm-left');
    this.armLeft.play('mech1-arm-left-idle');
    this.armLeft.setOrigin(0.19, 0.29);
    this.armLeft.body.setAllowGravity(false);

    this.armRight = this.scene.physics.add.sprite(-20, -148, 'mech1-arm-right');
    this.armRight.play('mech1-arm-right-idle');
    this.armRight.setOrigin(0.21, 0.28);
    this.armRight.body.setAllowGravity(false);

    this.head = this.scene.physics.add.image(-12, -185, 'mech1-head');
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
    this.bulletRaycaster = this.scene.raycasterPlugin.createRaycaster({ debug: true });
    this.bulletRaycaster.mapGameObjects(this.scene.ground, true, {
      collisionTiles: [1, 2, 3, 4, 5, 11, 12, 13, 14, 15, 21, 22, 23, 24, 25, 31, 32, 33, 34, 35, 41, 42, 43, 44, 45]
    });
    this.bulletRay = this.bulletRaycaster.createRay();

    console.log(this.bulletRaycaster);

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
          const isNPC = (intersection.object && intersection.object.getData('isNPC') === true);
          endX = intersection.x;
          endY = intersection.y;

          if (isTile) {
            const tiles = intersection.object.getTilesWithinWorldXY(intersection.x - 1, intersection.y - 1, 2, 2);

            tiles.forEach((tile) => this.scene.damageTile(tile, intersection));
          }
          else if (isNPC) {
            intersection.object.takeDamage(pMath.Between(1, 5), intersection);
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
      if (!this.isDead) {
        if (pointer.rightButtonDown()) {
          if (this.scene.registry.playerRockets > 0) {
            const barrelOffsetY = 145;
            const barrelOffsetX = 250;
            const vector = new pMath.Vector2();
            let angleMod = 2 * Math.PI;
    
            if (this.torsoLegs.flipX) {
              angleMod = Math.PI;
            }
    
            vector.setToPolar(this.armLeft.rotation + angleMod, barrelOffsetX);
    
            new Mech1Shell(this.scene, this.x + vector.x, this.y + vector.y - barrelOffsetY, this.armLeft.rotation, this.torsoLegs.flipX);
    
            this.armLeft.play('mech1-arm-left-heavy-shot', true);
            this.armRight.play('mech1-arm-right-heavy-shot', true);
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
          this.armLeft.play('mech1-arm-left-light-shot', true);
          this.armRight.play('mech1-arm-right-light-shot', true);
        }
      }
    });

    this.scene.input.on('pointerup', () => {
      if (!this.isDead) {
        this.rapidfire.paused = true;
        this.armLeft.play('mech1-arm-left-idle', true);
        this.armRight.play('mech1-arm-right-idle', true);
      }
    });

    // Set data attributes
    this.setData('isPlayer', true);
  }

  mapTarget(target) {
    this.bulletRaycaster.mapGameObjects(target, true);
  }

  takeDamage(dmg, intersection) {
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
  
        const maxDeathBurst = 500;

        this.scene.cameras.main.flash(1000, 255, 255, 255, true);
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
  
        this.torsoLegs.body.setAllowGravity(true);
        this.torsoLegs.body.setVelocity(pMath.Between(-maxDeathBurst, maxDeathBurst), pMath.Between(-maxDeathBurst * 2, -maxDeathBurst));
  
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
    // Spin body parts around when dead
    else {
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

export default Mech1;