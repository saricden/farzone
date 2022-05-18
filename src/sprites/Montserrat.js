import { GameObjects, Math as pMath } from "phaser";
import { network } from "../network";
const { Container } = GameObjects;

class Montserrat extends Container {
  constructor(scene, x, y) {
    super(scene, x, y, []);

    this.scene = scene;
    this.speed = 1400;
    this.jumpForce = 1000;
    this.isDead = false;
    this.animPrefix = 'r';

    this.core = this.scene.add.sprite(0, 0, 'montserrat');
    this.core.play('r-montserrat-idle');
    
    this.head = this.scene.add.image(20, -135, 'r-montserrat-head');
    this.head.setOrigin(0.5, 1);
    this.head.setScale(0.75);

    this.add([
      this.head,
      this.core
    ]);

    this.scene.add.existing(this);
    this.scene.physics.world.enable(this);

    this.body.setSize(110, 575);
    this.body.setOffset(-50, -310);
    this.isKnocked = false;

    this.cursors = this.scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    this.scene.input.on('pointerdown', () => {

    });

    this.scene.input.on('pointerup', () => {

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

  setFlipX(flip) {
    if (flip) {
      this.animPrefix = 'l';
    }
    else {
      this.animPrefix = 'r';
    }
  }

  initLighting() {
    this.list.forEach((obj) => {
      if (obj.getData('isHitbox') !== true) {
        obj.setPipeline('Light2D');
      }
    });
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
  
        // this.head.body.setAllowGravity(true);
        // this.head.body.setVelocity(pMath.Between(-maxDeathBurst, maxDeathBurst), pMath.Between(-maxDeathBurst * 2, -maxDeathBurst));
  
        // this.core.body.setAllowGravity(true);
        // this.core.body.setVelocity(pMath.Between(-maxDeathBurst, maxDeathBurst), pMath.Between(-maxDeathBurst * 2, -maxDeathBurst));
  
        // this.armLeft.body.setAllowGravity(true);
        // this.armLeft.body.setVelocity(pMath.Between(-maxDeathBurst, maxDeathBurst), pMath.Between(-maxDeathBurst * 2, -maxDeathBurst));
  
        // this.armRight.body.setAllowGravity(true);
        // this.armRight.body.setVelocity(pMath.Between(-maxDeathBurst, maxDeathBurst), pMath.Between(-maxDeathBurst * 2, -maxDeathBurst));
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
          this.setFlipX(true);
        }
        else if (right.isDown) {
          this.body.setVelocityX(this.speed);
          this.setFlipX(false);
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



      this.core.play(`${this.animPrefix}-montserrat-idle`, true);
      this.head.setTexture(`${this.animPrefix}-montserrat-head`);
    }
  }
}

export default Montserrat;