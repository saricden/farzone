import { GameObjects, Math as pMath } from "phaser";
import { network } from "../network";
const { Image } = GameObjects;

class OswaldGrendade extends Image {
  constructor(scene, x, y, rotation, isPlayer = false, isNetworkControlled = false) {
    super(scene, x, y, 'oswald-grenade');

    this.scene = scene;

    this.rotation = rotation;

    this.scene.add.existing(this);
    this.scene.physics.world.enable(this);

    if (!isNetworkControlled) {
      const vector = this.scene.physics.velocityFromRotation(this.rotation, 1500);
      this.body.setVelocity(vector.x, vector.y);
      this.body.setBounce(0.5);

      this.scene.physics.add.collider(this, this.scene.ground);
      this.scene.physics.add.collider(this, this.scene.cat);
      this.scene.physics.add.collider(this, this.scene.dummy);
    }

    this.setDepth(100);

    if (isPlayer) {
      this.scene.registry.playerTotalAttacks++;
    }

    // Kaboom
    if (!isNetworkControlled) {
      this.networkID = Date.now();

      this.scene.time.addEvent({
        delay: 3000,
        repeat: 0,
        callback: () => {
          this.detonate();

          network.send('oswald-grenade-detonate', {
            id: this.networkID,
            x: this.x,
            y: this.y
          });
        }
      });

      network.send('oswald-grenade-create', {
        id: this.networkID,
        x,
        y
      });
    }

    this.isPlayer = isPlayer;
    this.isNetworkControlled = isNetworkControlled;
  }

  detonate() {
    if (typeof this.scene !== 'undefined') {
      this.scene.sound.play('sfx-explosion');

      const layers = [
        this.scene.ground,
        this.scene.bgd1,
        this.scene.bgd2,
        this.scene.bgd3,
        this.scene.leaves,
        this.scene.leavesBG1,
        this.scene.leavesBG2
      ];

      // Sometimes this.scene is undefined?
      this.scene.sound.play('sfx-explosion');

      // Damage tiles on any applicable layers
      layers.forEach((layer) => {
        const tiles = layer.getTilesWithinWorldXY(this.x - 400, this.y - 400, 800, 800);
        tiles.forEach((tile) => {
          const dmg = pMath.Between(4, 5);
          for (let d = 0; d < dmg; d++) {
            this.scene.damageTile(tile, { x: this.x, y: this.y }, layer, this.isPlayer);
          }
        });
      });

      this.scene.boomEmitter.setPosition(this.x, this.y);
      this.scene.boomEmitter2.setPosition(this.x, this.y);
      // this.scene.cameras.main.flash(250, 255, 255, 0, true);
      this.scene.cameras.main.shake(750, 0.05, true);
      this.scene.boomEmitter.explode(50);
      this.scene.boomEmitter2.explode(100);

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

          if (typeof sprite.takeDamage === 'function') {
            sprite.takeDamage(pMath.Between(50, 100), {x: this.x, y: this.y});
          }
        }
      });

      this.destroy();
    }
  }

  preUpdate(time, delta) {
    const flipRot = 5 * Math.PI * (delta / 1000);
    this.rotation += flipRot;

    if (!this.isNetworkControlled) {
      network.send('oswald-grenade-move', {
        id: this.networkID,
        x: this.x,
        y: this.y,
        rotation: this.rotation
      });
    }

    if (!this.body.blocked.none) {
      this.scene.sound.play('sfx-grenade-bounce');

      if (!this.isNetworkControlled) {
        network.send('oswald-grenade-bounce', {
          id: this.networkID
        });
      }
    }
  }
}

export default OswaldGrendade;