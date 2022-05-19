import { GameObjects, Math as pMath } from "phaser";
import { network } from "../network";
const { Container } = GameObjects;

class MontserratKunai extends Container {
  constructor(scene, x, y, rotation, flipX, isPlayer = false, isNetworkControlled = false) {
    super(scene, x, y, []);

    this.scene = scene;
    this.isPlayer = isPlayer;
    this.maxHP = 5;
    this.hp = this.maxHP;

    this.kunai = this.scene.add.image(0, 0, 'montserrat-kunai');
    this.kunai.setScale(0.3);

    this.scene.add.existing(this);
    this.scene.physics.world.enable(this);

    this.setRotation(rotation);

    const speed = this.scene.physics.velocityFromRotation(
      this.rotation,
      4000,
      new pMath.Vector2(this.body.velocity.x, this.body.velocity.y)
    );

    if (flipX) {
      this.setRotation(this.rotation - 3 * Math.PI / 2);
    }
    else {
      this.setRotation(this.rotation + Math.PI / 2);
    }

    if (!isNetworkControlled) {
      this.body.setVelocity(speed.x, speed.y);
    }
    
    this.contrailParticle = this.scene.add.particles('montserrat-kunai');
    this.contrailParticle.setDepth(17);
    
    this.contrailEmitter = this.contrailParticle.createEmitter({
      rotate: this.angle, // only degrees I guess?
      speedX: 0,
      speedY: 0,
      alpha: {
        start: 1,
        end: 0
      },
      scale: 0.3,
      quantity: 1,
      lifespan: 500,
      follow: this
    });

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

    this.scene.physics.add.collider(this, [this.scene.cat, this.scene.dummy], (kunai, object) => {
      this.doDamage(object);
      
      if (this.isMultiplayer && !this.isNetworkControlled) {
        // TODO: emit network damage event
      }
    });

    this.add([
      this.kunai
    ]);

    this.isNetworkControlled = isNetworkControlled;
    this.isMultiplayer = this.scene.registry.isMultiplayer;

    if (this.isMultiplayer && !this.isNetworkControlled) {
      this.networkID = Date.now();

      // TODO: emit network create event
    }
  }

  doDamage(target) {
    if (typeof this.scene !== 'undefined') {
      this.hp = 0;

      if (this.isPlayer) {
        this.scene.registry.playerAttacksHit++;
      }

      if (typeof target.takeDamage === 'function' && !this.isNetworkControlled) {
        target.takeDamage(pMath.Between(15, 35), {x: this.x, y: this.y});
      }
    }
  }

  destroyAndQueueCleanup() {
    this.scene.time.addEvent({
      delay: 500,
      repeat: 0,
      callback: () => {
        this.contrailParticle.destroy();
      }
    });

    this.contrailEmitter.stop();
    this.destroy();
  }

  preUpdate() {
    const {tilemap} = this.scene;

    // Damage tiles
    this.layers.forEach((layer) => {
      const tiles = layer.getTilesWithinWorldXY(this.x - 1, this.y - 1, 2, 2, { isNotEmpty: true });

      if (tiles.length > 0) {
        tiles.forEach((tile) => {
          for (let i = 0; i < 5; i++) {
            this.scene.damageTile(tile, { x: tile.pixelX, y: tile.pixelY }, layer, true);
          }
        });

        this.hp--;
      }
    });

    if (this.isMultiplayer && !this.isNetworkControlled) {
      // TODO: emit network move event
    }

    if (this.x > tilemap.widthInPixels || this.x < 0 || this.y > tilemap.heightInPixels || this.y < 0) {
      this.destroyAndQueueCleanup();

      if (this.isMultiplayer && !this.isNetworkControlled) {
        // TODO: emit network offmap event
      }
    }

    if (this.hp <= 0) {
      this.destroyAndQueueCleanup();
    }
  }
}

export default MontserratKunai;