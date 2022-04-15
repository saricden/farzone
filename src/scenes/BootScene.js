import {Scene} from 'phaser';

class BootScene extends Scene {
  constructor() {
    super("scene-boot");
  }
  
  preload() {
    // Mech1
    this.load.multiatlas('mech1', 'assets/sprites/mech1.json', 'assets/sprites');
    this.load.atlas('mech1-arm-left', 'assets/sprites/mech1-left-arm.png', 'assets/sprites/mech1-left-arm.json');
    this.load.atlas('mech1-arm-right', 'assets/sprites/mech1-right-arm.png', 'assets/sprites/mech1-right-arm.json');
    this.load.image('mech1-head', 'assets/sprites/mech1-head.png');

    this.load.tilemapTiledJSON('map-level1', 'assets/maps/level1.json');
    this.load.image('tileset-grassland-ex', 'assets/maps/tileset-grassland-ex.png');
  }

  create() {
    // Mech1 animations
    this.anims.create({
      key: 'mech1-run',
      frames: this.anims.generateFrameNames('mech1', {
        start: 0,
        end: 69,
        prefix: 'run-',
        suffix: '.png',
        zeroPad: 2
      }),
      frameRate: 70,
      repeat: -1
    });

    this.anims.create({
      key: 'mech1-idle',
      frames: [
        {
          key: 'mech1',
          frame: 'idle.png'
        }
      ],
      frameRate: 0,
      repeat: 0
    });

    this.anims.create({
      key: 'mech1-up',
      frames: [
        {
          key: 'mech1',
          frame: 'up.png'
        }
      ],
      frameRate: 0,
      repeat: 0
    });

    this.anims.create({
      key: 'mech1-down',
      frames: [
        {
          key: 'mech1',
          frame: 'down.png'
        }
      ],
      frameRate: 0,
      repeat: 0
    });

    this.anims.create({
      key: 'mech1-up-down',
      frames: this.anims.generateFrameNames('mech1', {
        start: 0,
        end: 11,
        prefix: 'up-down-',
        suffix: '.png',
        zeroPad: 2
      }),
      frameRate: 60,
      repeat: 0
    });

    this.anims.create({
      key: 'mech1-arm-left-idle',
      frames: [
        {
          key: 'mech1-arm-left',
          frame: 'idle.png'
        }
      ],
      frameRate: 0,
      repeat: 0
    });

    this.anims.create({
      key: 'mech1-arm-left-light-shot',
      frames: this.anims.generateFrameNames('mech1-arm-left', {
        start: 0,
        end: 5,
        prefix: 'light-',
        suffix: '.png',
        zeroPad: 0
      }),
      frameRate: 60,
      repeat: 0
    });

    this.anims.create({
      key: 'mech1-arm-left-heavy-shot',
      frames: this.anims.generateFrameNames('mech1-arm-left', {
        start: 0,
        end: 23,
        prefix: 'heavy-',
        suffix: '.png',
        zeroPad: 2
      }),
      frameRate: 60,
      repeat: 0
    });

    this.anims.create({
      key: 'mech1-arm-right-idle',
      frames: [
        {
          key: 'mech1-arm-right',
          frame: 'idle.png'
        }
      ],
      frameRate: 0,
      repeat: 0
    });

    this.anims.create({
      key: 'mech1-arm-right-light-shot',
      frames: this.anims.generateFrameNames('mech1-arm-right', {
        start: 0,
        end: 5,
        prefix: 'light-',
        suffix: '.png',
        zeroPad: 0
      }),
      frameRate: 60,
      repeat: 0
    });

    this.anims.create({
      key: 'mech1-arm-right-heavy-shot',
      frames: this.anims.generateFrameNames('mech1-arm-right', {
        start: 0,
        end: 23,
        prefix: 'heavy-',
        suffix: '.png',
        zeroPad: 2
      }),
      frameRate: 60,
      repeat: 0
    });

    this.scene.start('scene-game');
  }
}

export default BootScene;