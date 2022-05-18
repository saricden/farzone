import { GameObjects, Math as pMath } from "phaser";
import { network } from "../network";
const { Container } = GameObjects;

class RobotoPeer extends Container {
  constructor(scene, x, y) {
    super(scene, x, y, []);

    this.scene = scene;
    this.isDead = false;

    this.core = this.scene.physics.add.sprite(0, 0, 'mech1');
    this.core.play('mech1-idle');
    this.core.body.setAllowGravity(false);

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
      this.core,
      this.head,
      this.armRight
    ]);

    this.scene.add.existing(this);
    this.scene.physics.world.enable(this);

    this.body.setAllowGravity(false);
    this.body.setImmovable(true);

    this.body.setSize(140, 320);
    this.body.setOffset(-70, -200);
    this.isKnocked = false;

    this.aimAngle = 0;
    this.flipX = false;

    // Set data attributes
    this.setData('isPeer', true);
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

  takeDamage(dmg, intersection, isNetworkControlled = false) {
    this.scene.registry.playerDamageInflicted += dmg;


    if (!isNetworkControlled) {
      network.send('damage-player', {
        damage: dmg,
        x: intersection.x,
        y: intersection.y
      });
    }

    if (!this.isDead) {
      const {isMultiplayerHost: isPlayer1} = this.scene.registry;

      if (
        isPlayer1 && this.scene.registry.enemyHP > 0 ||
        !isPlayer1 && this.scene.registry.playerHP > 0
      ) {
        const maxHP = (isPlayer1 ? this.scene.registry.enemyHP : this.scene.registry.playerHP);

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
  
      if (isPlayer1 && this.scene.registry.enemyHP - dmg > 0) {
        this.scene.registry.enemyHP -= dmg;
      }
      else if (!isPlayer1 && this.scene.registry.playerHP - dmg > 0) {
        this.scene.registry.playerHP -= dmg;
      }
      else {
        if (isPlayer1) {
          this.scene.registry.enemyHP = 0;
        }
        else {
          this.scene.registry.playerHP = 0;
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
    // Disable any velocity being set
    this.body.setVelocity(0, 0);

    if (!this.isDead) {
      // Aiming logic
      let angleMod = 2 * Math.PI;
      let headAngleMod = 0.35;
  
      if (this.flipX) {
        this.core.setFlipX(true);
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
        this.core.setFlipX(false);
        this.armLeft.setFlipX(false);
        this.armRight.setFlipX(false);
        this.head.setFlipX(false);
        this.armLeft.setOrigin(0.19, 0.29);
        this.armRight.setOrigin(0.21, 0.28);
        this.armLeft.setX(-20);
        this.armRight.setX(-20);
        this.head.setX(-12);
      }
  
      this.armLeft.setRotation(this.aimAngle + angleMod);
      this.armRight.setRotation(this.aimAngle + angleMod);
      // this.head.setRotation(angle * headAngleMod + angleMod);
      this.head.setRotation(this.aimAngle + angleMod);
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

export default RobotoPeer;