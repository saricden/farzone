import { GameObjects, Math as pMath } from "phaser";
const { Container, Rectangle } = GameObjects;

class ArialPeer extends Container {
  constructor(scene, x, y) {
    super(scene, x, y, []);

    this.scene = scene;
    this.speed = 1200;
    this.jumpForce = 1200;
    this.lungeDistance = 2500;
    this.isDead = false;
    this.hasDoubleJumped = false;
    this.hasAirAttacked = false;
    this.isAirAttacking = false;
    this.doDamageTiles = false;

    this.core = this.scene.add.sprite(0, 0, 'hume1');

    this.aimArmShield = this.scene.add.image(0, 20, 'hume1-shield-arm');
    this.aimArmShield.setVisible(false);
    this.aimArmShield.setScale(0.6);
    this.aimArmShield.setOrigin(0.5, 0.9);

    this.blockArmShield = this.scene.add.image(0, 0, 'hume1-shield-arm-block');
    this.blockArmShield.setVisible(false);
    this.blockArmShield.setScale(0.6);
    this.blockArmShield.setOrigin(0.5, 0.9);
    this.blockArmShield.setFlipX(true);

    this.aimArmSword = this.scene.add.image(0, 20, 'hume1-sword-arm');
    this.aimArmSword.setVisible(false);
    this.aimArmSword.setScale(0.6);
    this.aimArmSword.setOrigin(0.24, 0.45);

    this.head = this.scene.add.image(0, -72, 'hume1-head');
    this.head.setOrigin(0.5, 1);
    this.head.setScale(0.7);

    this.add([
      this.aimArmShield,
      this.blockArmShield,
      this.head,
      this.core,
      this.aimArmSword
    ]);

    this.scene.add.existing(this);
    this.scene.physics.world.enable(this);

    this.body.setAllowGravity(false);
    this.body.setImmovable(true);

    this.body.setSize(85, 400);
    this.body.setOffset(-70, -100);
    this.isKnocked = false;

    this.isBlocking = false;
    this.isAiming = false;
    this.isLunging = false;

    this.aimAngle = 0;
    this.flipX = false;
    this.playerState = '';

    // Set data attributes
    this.setData('isPeer', true);
  }

  mapTarget(target) {
    // this.scene.physics.add.overlap(this.atkBox, target, (a, t) => {
    //   if (a.damage > 0 && typeof t.takeDamage === 'function') {
    //     t.takeDamage(a.damage, { x: t.x, y: t.y });
    //     t.body.setVelocity(0, -this.jumpForce);
    //     this.resetLunge();
    //     this.scene.registry.playerAttacksHit++;
    //   }
    // });    
  }

  mapGroundLayer(layer) {
    // layer.tilemap.setTileIndexCallback([1, 2, 3, 4, 5, 11, 12, 13, 14, 15, 21, 22, 23, 24, 25, 31, 32, 33, 34, 35, 41, 42, 43, 44, 45], (object, tile) => {
    //   if (object === this && this.doDamageTiles) {
    //     this.scene.damageTile(tile, { x: this.x, y: this.y }, this.scene.ground);
    //     console.log('damage!');
    //   }
    // }, this, this.scene.ground);
  }

  mapDetailLayers(layers) {
    // this.bulletRaycaster.mapGameObjects(layers, true, {
    //   collisionTiles: 
    // });
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

  update(time, delta) {
    // Disable any velocity being set
    this.body.setVelocity(0, 0);
    
    if (!this.isDead) {
      // Aim controls
      let angleMod = Math.PI / 4;
      let shieldArmAngleMod = Math.PI / 4 * 2;
      let swordArmAngleMod = Math.PI / 4 * 2;
  
      if (this.flipX) {
        this.core.setFlipX(true);
        this.aimArmShield.setFlipX(true);
        this.blockArmShield.setFlipX(true);
        this.aimArmSword.setFlipX(true);
        this.head.setFlipX(true);
        this.core.setX(-54);
        this.head.setX(-54);
        this.aimArmShield.setX(-40);
        this.blockArmShield.setX(-50);
        this.aimArmSword.setX(-40);
        angleMod = Math.PI;
        swordArmAngleMod = Math.PI / 2;

        this.aimArmSword.setOrigin(1 - 0.24, 0.45);
      }
      else {
        this.core.setFlipX(false);
        this.aimArmShield.setFlipX(false);
        this.blockArmShield.setFlipX(false);
        this.aimArmSword.setFlipX(false);
        this.head.setFlipX(false);
        this.aimArmShield.setX(-20);
        this.blockArmShield.setX(0);
        this.aimArmSword.setX(-20);
        this.core.setX(0);
        this.head.setX(0);

        this.aimArmSword.setOrigin(0.24, 0.45);
      }
  
      this.aimArmShield.setRotation(this.aimAngle + shieldArmAngleMod);
      this.aimArmSword.setRotation(this.aimAngle + swordArmAngleMod);
      this.blockArmShield.setRotation(this.aimAngle + shieldArmAngleMod);

      if (this.isAiming) {
        this.aimArmShield.setVisible(true);
        this.aimArmSword.setVisible(true);
        this.head.setY(-72 + 65);
      }
      else {
        this.aimArmShield.setVisible(false);
        this.aimArmSword.setVisible(false);
        this.head.setY(-72);
      }

      if (this.isBlocking) {
        this.blockArmShield.setVisible(true);
        this.aimArmSword.setVisible(true);
        this.head.setY(-72 + 65);
      }
      else if (!this.isAiming) {
        this.blockArmShield.setVisible(false);
        this.aimArmSword.setVisible(false);
        this.head.setY(-72);
      }

      if ((this.aimAngle + angleMod) / 3 > 1) {
        this.head.setRotation(((this.aimAngle + angleMod) / 3) - 2);
      }
      else {
        this.head.setRotation((this.aimAngle + angleMod) / 3);
      }

      // State handling
      if (this.playerState === '') {
        this.blockArmShield.setVisible(false);
        this.aimArmSword.setVisible(false);
        this.aimArmShield.setVisible(false);
        this.head.setVisible(true);
        this.head.setY(-72);
      }
      else if (this.playerState === 'aim') {
        this.blockArmShield.setVisible(false);
        this.aimArmSword.setVisible(true);
        this.aimArmShield.setVisible(true);
        this.head.setVisible(true);
        this.head.setY(-72 + 65);
      }
      else if (this.playerState === 'block') {
        this.blockArmShield.setVisible(true);
        this.aimArmSword.setVisible(true);
        this.aimArmShield.setVisible(false);
        this.head.setVisible(true);
        this.head.setY(-72 + 65);
      }
      else if (this.playerState === 'flip') {
        this.blockArmShield.setVisible(false);
        this.aimArmSword.setVisible(false);
        this.head.setVisible(false);
        this.head.setY(-72);
      }
      else if (this.playerState === 'lunge') {
        this.blockArmShield.setVisible(false);
        this.aimArmSword.setVisible(false);
        this.head.setVisible(false);
        this.head.setY(-72);
      }

    }

  }
}

export default ArialPeer;