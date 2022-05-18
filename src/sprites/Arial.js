import { GameObjects, Math as pMath } from "phaser";
const { Container, Rectangle } = GameObjects;

class Arial extends Container {
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
    this.core.play('hume1-idle');

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

    this.atkBox = new Rectangle(this.scene, 0, 0, 150, 150, 0xFF0000, 0);
    this.scene.physics.world.enable(this.atkBox);
    this.atkBox.body.setAllowGravity(false);
    this.atkBox.body.setImmovable(true);

    this.atkBox.damage = 0;

    this.add([
      this.aimArmShield,
      this.blockArmShield,
      this.head,
      this.core,
      this.aimArmSword,
      this.atkBox
    ]);

    this.scene.add.existing(this);
    this.scene.physics.world.enable(this);

    this.body.setSize(85, 400);
    this.body.setOffset(-70, -100);
    this.isKnocked = false;

    this.cursors = this.scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    this.isBlocking = false;
    this.isAiming = false;
    this.isLunging = false;
    this.lungeVelocity = null;
    this.lungeStartPos = new pMath.Vector2();

    this.scene.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        if (this.body.onFloor()) {
          this.isBlocking = true;
          this.body.setVelocityX(0);
        }
      }
      else {
        if (this.body.onFloor()) {
          this.isAiming = true;
          this.body.setVelocityX(0);
        }
        else if (!this.isLunging && !this.hasAirAttacked) {
          this.isAirAttacking = true;
          this.hasAirAttacked = true;
          this.body.setVelocityY(0);
          this.core.play('hume1-air-atk');
          this.rotation = 0;
          this.scene.sound.play('sfx-hume1-huah');
          this.head.setVisible(true);
        }
      }
    });

    this.scene.input.on('pointerup', ({worldX, worldY}) => {
      if (this.isAiming) {
        this.isAiming = false;
        this.isLunging = true;
  
        this.body.setAllowGravity(false);
        this.scene.physics.moveTo(this, worldX, worldY, this.speed * 2);
        this.lungeStartPos.x = this.x;
        this.lungeStartPos.y = this.y;

        this.lungeVelocity = this.body.velocity;
        
        // Set rotation
        const angle = pMath.Angle.Between(this.x, this.y, worldX, worldY);
        this.setRotation(angle + Math.PI / 2);

        // Position hitbox
        const vector = new pMath.Vector2();
        vector.setToPolar(angle - this.rotation, 290);

        this.setAttackBox(vector.x, vector.y, 100, 100, pMath.Between(100, 150));

        this.scene.sound.play('sfx-hume1-yah');

        this.doDamageTiles = true;

        this.scene.registry.playerTotalAttacks++;
      }
      else if (this.isBlocking) {
        this.isBlocking = false;
      }
    });

    this.scene.input.keyboard.on('keydown-W', () => {
      if (!this.isAiming && !this.isBlocking) {
        if (this.body.onFloor()) {
          this.body.setVelocityY(-this.jumpForce);
          this.scene.sound.play('sfx-hume1-hah');
        }
        else if (!this.hasDoubleJumped) {
          this.body.setVelocityY(-this.jumpForce);
          this.scene.sound.play('sfx-hume1-huah');
          this.hasDoubleJumped = true;
          this.hasAirAttacked = false; // reset air attack on double jump
        }
      }
    });

    // Animation events
    this.core.on('animationupdate', ({key}, {index}) => {
      if (key === 'hume1-air-atk') {
        if (index < 7) {
          let x = 0;
          if (this.core.flipX) {
            x -= 330;
          }
          else {
            x += 150;
          }
  
          this.setAttackBox(x, -250, 300, 450, pMath.Between(25, 50));
        }
        else {
          this.resetAttackBox();
        }
      }
    });

    this.core.on('animationcomplete-hume1-air-atk', () => {
      this.isAirAttacking = false;
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

  processGround() {
    return !this.doDamageTiles;
  }

  setAttackBox(x, y, w, h, dmg) {
    this.atkBox.setPosition(x, y);
    this.atkBox.setSize(w, h);
    this.atkBox.body.setSize(w, h);
    this.atkBox.damage = dmg;
  }

  resetAttackBox() {
    this.atkBox.damage = 0;
  }

  mapTarget(target) {
    this.scene.physics.add.overlap(this.atkBox, target, (a, t) => {
      if (a.damage > 0 && typeof t.takeDamage === 'function') {
        t.takeDamage(a.damage, { x: t.x, y: t.y });
        t.body.setVelocity(0, -this.jumpForce);
        this.resetLunge();
        this.scene.registry.playerAttacksHit++;
      }
    });    
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

  resetLunge() {
    // Turn off hitbox
    this.resetAttackBox();

    // Disable tile damage
    this.doDamageTiles = false;

    // Reset lunge
    this.body.setAllowGravity(true);
    this.isLunging = false;
    this.setRotation(0);
    this.scene.sound.play('sfx-hume1-huah');
  }

  update(time, delta) {
    const {left, right} = this.cursors;
    const {mousePointer} = this.scene.input;

    // Distance tracking...
    const xDiff = Math.abs(this.x - this.prevX);
    const yDiff = Math.abs(this.y - this.prevY);

    this.scene.registry.playerDistanceMoved += (xDiff + yDiff);

    this.prevX = this.x;
    this.prevY = this.y;

    if (!this.isDead) {
      if (!this.isKnocked) {
        if (!this.isAiming && !this.isBlocking && !this.isLunging) {
          if (left.isDown && (this.core.flipX || !this.body.onFloor())) {
            this.body.setVelocityX(-this.speed);
          }
          else if (left.isDown && !this.core.flipX) {
            this.body.setVelocityX(-this.speed / 2);
          }
          else if (right.isDown && (!this.core.flipX || !this.body.onFloor())) {
            this.body.setVelocityX(this.speed);
          }
          else if (right.isDown && this.core.flipX) {
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
      let shieldArmAngleMod = Math.PI / 4 * 2;
      let swordArmAngleMod = Math.PI / 4 * 2;
  
      if (mousePointer.x <= relX) {
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

      // Animation logic
      if (!this.isAirAttacking) {
        this.playerState = '';

        if (this.isLunging) {
          this.head.setVisible(false);
          this.core.play('hume1-lunge', true);
          this.playerState = 'lunge';
        }
        else if (this.body.onFloor()) {
          this.rotation = 0;
          this.head.setVisible(true);

          if (this.isAiming) {
            this.playerState = 'aim';
          }
          else if (this.isBlocking) {
            this.playerState = 'block';
          }
  
          if (this.isAiming || this.isBlocking ) {
            this.core.play('hume1-aim', true);
          }
          else if (this.body.velocity.x !== 0) {
            if (this.core.flipX && this.body.velocity.x > 0 || !this.core.flipX && this.body.velocity.x < 0) {
              this.core.play('hume1-run-back', true)
            }
            else {
              this.core.play('hume1-run', true);
            }
          }
          else {
            this.core.play('hume1-idle', true);
          }
        }
        else {
          this.playerState = '';

          if (this.body.velocity.y < 0) {
            if (this.hasDoubleJumped) {
              this.core.play('hume1-flip', true);
              this.head.setVisible(false);
              this.playerState = 'flip';
  
              const flipRot = 5 * Math.PI * (delta / 1000);
    
              if (this.core.flipX) {
                this.rotation -= flipRot;
              }
              else {
                this.rotation += flipRot;
              }
            }
            else {
              this.rotation = 0;
              this.head.setVisible(true);
              this.core.play('hume1-jump', true);
            }
          }
          else if (this.body.velocity.y > 0) {
            this.core.play('hume1-fall', true);
            this.rotation = 0;
            this.head.setVisible(true);
          }
        }
      }

    }

    // Reset double jump + air attack
    if (this.body.onFloor()) {
      this.hasDoubleJumped = false;
      this.hasAirAttacked = false;
      this.isAirAttacking = false;
    }

    // Reset lunge
    if (this.isLunging) {
      const dist = pMath.Distance.Between(this.x, this.y, this.lungeStartPos.x, this.lungeStartPos.y);

      if (dist >= this.lungeDistance) {
        this.resetLunge();
      }
      else {
        const layers = [
          this.scene.ground,
          this.scene.bgd1,
          this.scene.bgd2,
          this.scene.bgd3,
          this.scene.leaves,
          this.scene.leavesBG1,
          this.scene.leavesBG2
        ];

        layers.forEach((layer) => {
          const tiles = layer.getTilesWithinWorldXY(this.x + this.atkBox.x - 100, this.y + this.atkBox.y - 100, 300, 300);
  
          tiles.forEach((tile) => {
            for (let i = 0; i < 5; i++) {
              this.scene.damageTile(tile, { x: tile.pixelX, y: tile.pixelY }, layer, true);
            }
          });
        });
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

export default Arial;