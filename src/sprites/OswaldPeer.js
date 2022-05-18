import { GameObjects, Math as pMath } from "phaser";
const { Container } = GameObjects;

class OswaldPeer extends Container {
  constructor(scene, x, y) {
    super(scene, x, y, []);

    this.scene = scene;
    this.isDead = false;

    this.core = this.scene.add.sprite(0, 0, 'oswald');

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

    this.body.setAllowGravity(false);
    this.body.setImmovable(true);

    this.body.setSize(100, 600);
    this.body.setOffset(-70, -287);

    this.isAiming = false;
    this.canShoot = true;
    this.isThrowing = false;

    this.aimAngle = 0;
    this.flipX = false;
    this.playerState = '';

    // Set data attributes
    this.setData('isPeer', true);
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
    // this.bulletRaycaster.mapGameObjects(target, true);
  }

  mapGroundLayer(layer) {
    // this.bulletRaycaster.mapGameObjects(layer, true, {
    //   collisionTiles: [1, 2, 3, 4, 5, 11, 12, 13, 14, 15, 21, 22, 23, 24, 25, 31, 32, 33, 34, 35, 41, 42, 43, 44, 45]
    // });
  }

  mapDetailLayers(layers) {
    // this.bulletRaycaster.mapGameObjects(layers, true, {
    //   collisionTiles: [51, 52, 53, 54, 61, 62, 63, 71, 72, 73, 81, 82, 84, 85, 86, 87, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 113, 118, 123, 127, 133, 137]
    // });
  }

  update(time, delta) {
    // Disable any velocity being set
    this.body.setVelocity(0, 0);
    
    if (!this.isDead) {
      // Aim controls
      let angleMod = Math.PI / 4;
      let armAngleMod = 2 * Math.PI - 0.1;
  
      if (this.flipX) {
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
      
      if (this.playerState === '') {
        this.armL.setVisible(false);
        this.armR.setVisible(false);
        this.head.setY(-150);
        this.armL.setY(0);
        this.armR.setY(0);
      }
      else if (this.playerState === 'aim-floor') {
        this.armL.setVisible(true);
        this.armR.setVisible(true);
        this.head.setY(-150 + 122);
        this.armL.setY(0);
        this.armR.setY(0);
      }
      else if (this.playerState === 'aim-air') {
        this.armL.setVisible(true);
        this.armR.setVisible(true);
        this.head.setY(-150);
        this.armL.setY(-125);
        this.armR.setY(-125);
      }
    }

  }
}

export default OswaldPeer;