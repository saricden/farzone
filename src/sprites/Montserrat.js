import { GameObjects, Math as pMath } from "phaser";
import { network } from "../network";
import MontserratKunai from "./MontserratKunai";
const { Container } = GameObjects;

class Montserrat extends Container {
  constructor(scene, x, y) {
    super(scene, x, y, []);

    this.scene = scene;
    this.speed = 1400;
    this.jumpForce = 1000;
    this.isDead = false;
    this.isThrowing = false;
    this.hasThrownInAir = false;
    this.isGrappling = false;
    this.isFlipped = false;
    this.hasDoubleJumped = false;
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

    this.scene.input.on('pointerdown', (pointer) => {
      if (!this.isDead) {
        this.setRotation(0);
        
        if (pointer.rightButtonDown()) {
          // TODO: grapple
        }
        else {
          if (!this.isThrowing) {
            this.isThrowing = true;
            this.hasThrownInAir = true;

            const throwOffsetX = 250;
            const vector = new pMath.Vector2();
            const angle = pMath.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY);
            let angleMod = 2 * Math.PI;

            if (this.isFlipped) {
              angleMod = Math.PI;
            }

            if (this.isFlipped) {
              vector.setToPolar(angle + angleMod, -throwOffsetX);
            }
            else {
              vector.setToPolar(angle + angleMod, throwOffsetX);
            }

            new MontserratKunai(this.scene, this.x + vector.x, this.y + vector.y, angle, this.isFlipped, true);
    
            if (this.body.onFloor()) {
              this.core.play(`${this.animPrefix}-montserrat-throw-stand`);
            }
            else {
              this.core.play(`${this.animPrefix}-montserrat-throw-air`);
            }
          }
        }
      }
    });

    this.scene.input.on('pointerup', () => {

    });

    this.scene.input.keyboard.on('keydown-W', () => {
      if (!this.isGrappling) {
        if (this.body.onFloor()) {
          this.body.setVelocityY(-this.jumpForce);
        }
        else if (!this.hasDoubleJumped) {
          this.body.setVelocityY(-this.jumpForce);
          this.hasDoubleJumped = true;
        }
      }
    });

    // Animation events
    this.resetThrowing = this.resetThrowing.bind(this);

    this.core.on('animationcomplete-l-montserrat-throw-stand', this.resetThrowing);
    this.core.on('animationcomplete-r-montserrat-throw-stand', this.resetThrowing);
    this.core.on('animationcomplete-l-montserrat-throw-air', this.resetThrowing);
    this.core.on('animationcomplete-r-montserrat-throw-air', this.resetThrowing);

    // For tracking distance stat:
    this.prevX = this.x;
    this.prevY = this.y;

    // Aim world vector for multiplayer
    this.aimAngle = 0;
    this.playerState = '';

    // Set data attributes
    this.setData('isPlayer', true);
  }

  resetThrowing() {
    this.isThrowing = false;
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
    this.isFlipped = flip;

    if (flip) {
      this.animPrefix = 'l';

      this.head.setX(-20);
    }
    else {
      this.animPrefix = 'r';

      this.head.setX(20);
    }

    this.head.setTexture(`${this.animPrefix}-montserrat-head`);
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
        if (!this.isThrowing && !this.isGrappling) {
          if (left.isDown && (this.isFlipped || !this.body.onFloor())) {
            this.body.setVelocityX(-this.speed);
          }
          else if (left.isDown && !this.isFlipped) {
            this.body.setVelocityX(-this.speed / 2);
          }
          else if (right.isDown && (!this.isFlipped || !this.body.onFloor())) {
            this.body.setVelocityX(this.speed);
          }
          else if (right.isDown && this.isFlipped) {
            this.body.setVelocityX(this.speed / 2);
          }
          else {
            this.body.setVelocityX(0);
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

      if (mousePointer.x <= relX) {
        this.setFlipX(true);

        angleMod = Math.PI;
      }
      else {
        this.setFlipX(false);  
      }

      if ((this.aimAngle + angleMod) / 3 > 1) {
        this.head.setRotation(((this.aimAngle + angleMod) / 3) - 2);
      }
      else {
        this.head.setRotation((this.aimAngle + angleMod) / 3);
      }

      const {x: vx, y: vy} = this.body.velocity;

      this.head.setVisible(true);

      if (!this.isThrowing && !this.isGrappling) {
        if (this.body.onFloor()) {
          this.rotation = 0;

          if (vx !== 0) {
            if (this.isFlipped && vx > 0 || !this.isFlipped && vx < 0) {
              this.core.play(`${this.animPrefix}-montserrat-walk-back`, true);
            }
            else {
              this.core.play(`${this.animPrefix}-montserrat-run`, true);
            }
          }
          else {
            this.core.play(`${this.animPrefix}-montserrat-idle`, true);
          }
        }
        else {
          if (vy < 0) {
            if (this.hasDoubleJumped && !this.hasThrownInAir) {
              this.core.play(`${this.animPrefix}-montserrat-flip`, true);
              this.head.setVisible(false);

              const flipRot = 5 * Math.PI * (delta / 1000);
    
              if (this.isFlipped) {
                this.rotation -= flipRot;
              }
              else {
                this.rotation += flipRot;
              }
            }
            else {
              this.rotation = 0;
              this.core.play(`${this.animPrefix}-montserrat-up`, true);
            }
          }
          else if (vy > 0) {
            this.rotation = 0;
            this.core.play(`${this.animPrefix}-montserrat-down`, true);
          }
        }
      }

      if (this.body.onFloor()) {
        this.hasDoubleJumped = false;
        this.hasThrownInAir = false;
      }
      
    }
  }
}

export default Montserrat;