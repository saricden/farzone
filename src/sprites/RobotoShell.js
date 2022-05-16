import { GameObjects, Math as pMath, Display } from "phaser";
import { network } from "../network";
const { Container } = GameObjects;

class RobotoShell extends Container {
  constructor(scene, x, y, rotation, flipX, isPlayer = false, isNetworkControlled = false) {
    super (scene, x, y, []);

    this.scene = scene;
    this.isPlayer = isPlayer;

    this.shell = this.scene.add.image(0, 0, 'mech1-shell');
    this.shell.setScale(0.3);

    this.scene.add.existing(this);
    this.scene.physics.world.enable(this);

    this.body.setAllowGravity(false);
    this.setRotation(rotation);
    const speed = this.scene.physics.velocityFromRotation(
      this.rotation,
      1200,
      new pMath.Vector2(this.body.velocity.x, this.body.velocity.y)
    );

    if (flipX) {
      this.setRotation(this.rotation - Math.PI / 2);
      
      if (!isNetworkControlled) {
        this.body.setVelocity(-speed.x, -speed.y);
      }
    }
    else {
      this.setRotation(this.rotation + Math.PI / 2);

      if (!isNetworkControlled) {
        this.body.setVelocity(speed.x, speed.y);
      }
    }

    this.fireParticle = this.scene.add.particles('particle-fire');
    this.boomParticle = this.scene.add.particles('particle-explosion');

    this.fireParticle.setDepth(16);
    this.boomParticle.setDepth(17);

    this.fireEmitter = this.fireParticle.createEmitter({
      rotate: (p, k, t) => {
        return ((1 - t) * 360);
      },
      speedX: {
        min: 100,
        max: 200
      },
      speedY: {
        min: -50,
        max: 50
      },
      alpha: {
        start: 1,
        end: 0
      },
      scale: {
        start: 0.15,
        end: 1
      },
      quantity: 30,
      lifespan: 2000,
      follow: this
    });

    this.boomEmitter = this.boomParticle.createEmitter({
      alpha: {
        start: 1,
        end: 0
      },
      rotate: (p, k, t) => {
        return ((1 - t) * 360) * 4;
      },
      tint: (particle, key, t) => {
        const g = ((1 - t) / 1 * 255);
        return Display.Color.GetColor(255, g, 0);
      },
      speedX: {
        min: -400,
        max: 400
      },
      speedY: {
        min: -400,
        max: 400
      },
      scale: {
        start: 0.5,
        end: 1
      },
      lifespan: {
        min: 250,
        max: 750
      },
      follow: this
    });
    this.boomEmitter.stop();

    this.boomEmitter2 = this.fireParticle.createEmitter({
      alpha: {
        start: 0.5,
        end: 0
      },
      rotate: (p, k, t) => {
        return ((1 - t) * 360) * 4;
      },
      speedX: {
        min: -500,
        max: 500
      },
      speedY: {
        min: -500,
        max: 500
      },
      gravityX: 200,
      lifespan: 2000,
      follow: this
    });
    this.boomEmitter2.stop();

    if (this.isPlayer) {
      this.scene.registry.playerTotalAttacks++;
    }

    this.layers = [
      this.scene.ground,
      this.scene.bgd1,
      this.scene.bgd2,
      this.scene.bgd3,
      this.scene.leaves,
      this.scene.leavesBG1,
      this.scene.leavesBG2
    ];

    this.scene.physics.add.collider(this, [...this.layers, this.scene.cat, this.scene.dummy],
      (shell, object) => {
        this.detonate();

        if (this.isMultiplayer && !this.isNetworkControlled) {
          network.send('roboto-shell-detonate', {
            id: this.networkID,
            x: this.x,
            y: this.y
          });
        }
      },
      (shell, object) => {
        // Again scene is undefined sometimes... Weird.
        if (this.scene) {
          // Ignore shells if lunging as Ariel
          if (object === this.scene.cat) {
            return !object.isLunging;
          }
        }

        return true;
      }
    );

    this.add([
      this.shell
    ]);

    this.isNetworkControlled = isNetworkControlled;
    this.isMultiplayer = this.scene.registry.isMultiplayer;

    if (this.isMultiplayer && !this.isNetworkControlled) {
      this.networkID = Date.now();

      network.send('roboto-shell-create', {
        id: this.networkID,
        x,
        y,
        rotation,
        flipX
      });
    }
  }

  detonate() {
    // Sometimes this.scene is undefined?
    if (typeof this.scene !== 'undefined') {
      this.scene.sound.play('sfx-explosion');

      // Damage tiles on any applicable layers
      this.layers.forEach((layer) => {
        const tiles = layer.getTilesWithinWorldXY(this.x - 400, this.y - 400, 800, 800);
        tiles.forEach((tile) => {
          const dmg = pMath.Between(4, 5);
          for (let d = 0; d < dmg; d++) {
            this.scene.damageTile(tile, { x: this.x, y: this.y }, layer, this.isPlayer);
          }
        });
      });
      // this.scene.cameras.main.flash(250, 255, 255, 0, true);
      this.scene.cameras.main.shake(750, 0.05, true);
      this.boomEmitter.explode(50);
      this.boomEmitter2.explode(100);

      // Apply velocity to player and opponent
      const sprites = [this.scene.cat, this.scene.dummy];

      sprites.forEach((sprite) => {
        const spriteInBounds = (sprite.x >= this.x - 400 && sprite.x <= this.x + 400 && this.y >= this.y - 400 && this.y <= this.y + 400);

        if (spriteInBounds && !sprite.doDamageTiles) {
          const v = new pMath.Vector2();
          const angle = pMath.Angle.Between(this.x, this.y, sprite.x, sprite.y);

          if (this.isPlayer) {
            this.scene.registry.playerAttacksHit++;
          }

          v.setToPolar(angle, 100);

          sprite.body.setVelocity(v.x * 13, v.y * 13);
          sprite.body.blocked.none = true;
          sprite.isKnocked = true;

          if (typeof sprite.takeDamage === 'function' && !this.isNetworkControlled) {
            sprite.takeDamage(pMath.Between(50, 100), {x: this.x, y: this.y});
          }
        }
      });

      // Cleanup emitters
      this.scene.time.addEvent({
        delay: 4000,
        repeat: 0,
        callback: () => {
          this.fireParticle.destroy();
        }
      });
      this.fireEmitter.stop();
      this.destroy();
    }
  }

  offmap() {
    this.scene.time.addEvent({
      delay: 4000,
      repeat: 0,
      callback: () => {
        this.fireParticle.destroy();
      }
    });
    this.fireEmitter.stop();
    this.destroy();
  }

  preUpdate() {
    const {tilemap} = this.scene;

    if (this.isMultiplayer && !this.isNetworkControlled) {
      network.send('roboto-shell-move', {
        id: this.networkID,
        x: this.x,
        y: this.y
      });
    }

    if (this.x > tilemap.widthInPixels || this.x < 0 || this.y > tilemap.heightInPixels || this.y < 0) {
      this.offmap();

      if (this.isMultiplayer && !this.isNetworkControlled) {
        network.send('roboto-shell-offmap', {
          id: this.networkID,
          x: this.x,
          y: this.y
        });
      }
    }
  }
}

export default RobotoShell;