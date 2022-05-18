import { Scene, GameObjects } from 'phaser';
const { Rectangle } = GameObjects;

class BootScene extends Scene {
  constructor() {
    super("scene-boot");
  }

  preload() {
    // Mech1
    this.load.multiatlas('mech1', 'assets/sprites/mech1.json', 'assets/sprites');
    this.load.multiatlas('mech1-arm-left', 'assets/sprites/mech1-left-arm.json', 'assets/sprites');
    this.load.multiatlas('mech1-arm-right', 'assets/sprites/mech1-right-arm.json', 'assets/sprites');
    this.load.image('l-mech1-head', ['assets/sprites/l-mech1-head.png', 'assets/sprites/l-mech1-head_n.png']);
    this.load.image('r-mech1-head', ['assets/sprites/r-mech1-head.png', 'assets/sprites/r-mech1-head_n.png']);
    this.load.image('mech1-shell', 'assets/sprites/mech1-shell.png');
    this.load.image('mech1-victory', 'assets/sprites/mech1-victory.png');

    // Hume1
    this.load.multiatlas('hume1', 'assets/sprites/hume1.json', 'assets/sprites');
    this.load.image('hume1-head', ['assets/sprites/hume1-head.png', 'assets/sprites/hume1-head_n.png']);
    this.load.image('hume1-sword-arm', ['assets/sprites/hume1-sword-arm-aim.png', 'assets/sprites/hume1-sword-arm-aim_n.png']);
    this.load.image('hume1-shield-arm', ['assets/sprites/hume1-shield-arm-aim.png', 'assets/sprites/hume1-shield-arm-aim_n.png']);
    this.load.image('hume1-shield-arm-block', ['assets/sprites/hume1-shield-arm-block.png', 'assets/sprites/hume1-shield-arm-block_n.png']);

    // Oswald
    this.load.multiatlas('oswald', 'assets/sprites/oswald.json', 'assets/sprites');
    this.load.image('oswald-head', ['assets/sprites/oswald-head.png', 'assets/sprites/oswald-head_n.png']);
    this.load.image('oswald-arm-l', ['assets/sprites/oswald-arm-l.png', 'assets/sprites/oswald-arm-l_n.png']);
    this.load.image('oswald-arm-r', ['assets/sprites/oswald-arm-r.png', 'assets/sprites/oswald-arm-r_n.png']);
    this.load.image('oswald-grenade', 'assets/sprites/grenade.png');

    // Montserrat
    this.load.multiatlas('montserrat', 'assets/sprites/montserrat.json', 'assets/sprites');
    this.load.image('r-montserrat-head', ['assets/sprites/r-montserrat-head.png', 'assets/sprites/r-montserrat-head_n.png']);
    this.load.image('l-montserrat-head', ['assets/sprites/l-montserrat-head.png', 'assets/sprites/l-montserrat-head_n.png']);

    // Maps 2.0
    this.load.image('tileset-ex', ['assets/maps/2.0/tileset-ex.png', 'assets/maps/2.0/tileset-ex_n.png']);
    this.load.tilemapTiledJSON('map1', 'assets/maps/2.0/map1.json');
    this.load.tilemapTiledJSON('map2-the-spire', 'assets/maps/2.0/the-spire.json');
    this.load.tilemapTiledJSON('map2-the-great-wall', 'assets/maps/2.0/the-great-wall.json');

    // Music
    this.load.audio('ost-level1', 'assets/music/mech-ost1.mp3');
    this.load.audio('ost-level1b', 'assets/music/mech-ost2.mp3');
    this.load.audio('ost-title', 'assets/music/mech-ost3.mp3');
    this.load.audio('ost-level1c', 'assets/music/mech-ost4.mp3');
    this.load.audio('ost-level1d', 'assets/music/mech-ost5.mp3');
    this.load.audio('ost-gameover-build', 'assets/music/mech-ost7.mp3');
    this.load.audio('ost-gameover-fanfare', 'assets/music/mech-ost8.mp3');
    this.load.audio('ost-battle1', 'assets/music/mech-ost10.mp3');

    // SFX
    this.load.audio('sfx-shoot', 'assets/sfx/bang_02.wav');
    this.load.audio('sfx-rocket', 'assets/sfx/fw_05.wav');
    this.load.audio('sfx-explosion', 'assets/sfx/explodemini.wav');
    this.load.audio('sfx-rocket-dry', 'assets/sfx/12ga_dry.wav');
    this.load.audio('sfx-wind-loop', 'assets/sfx/amb_mountains.wav');
    this.load.audio('sfx-electro-click1', 'assets/sfx/Click_Electronic_15.wav');
    this.load.audio('sfx-electro-click2', 'assets/sfx/Click_Electronic_14.wav');
    this.load.audio('sfx-click', 'assets/sfx/Click_Standard_00.wav');
    this.load.audio('sfx-hume1-hah', 'assets/sfx/hume1-hah.mp3');
    this.load.audio('sfx-hume1-yah', 'assets/sfx/hume1-yah.mp3');
    this.load.audio('sfx-hume1-huah', 'assets/sfx/hume1-huah.mp3');
    this.load.audio('sfx-narrator-begin', 'assets/sfx/narrator-begin.wav');
    this.load.audio('sfx-time-slow', 'assets/sfx/time_stop.mp3');
    this.load.audio('sfx-sniper', 'assets/sfx/rifle.wav');
    this.load.audio('sfx-grenade-bounce', 'assets/sfx/ring_inventory.wav');

    // Mitch voiceovers
    this.load.audio('mitch-roboto', 'assets/sfx/mitch/roboto.mp3');
    this.load.audio('mitch-arial', 'assets/sfx/mitch/arial.mp3');
    this.load.audio('mitch-oswald', 'assets/sfx/mitch/oswald.mp3');
    this.load.audio('mitch-ready', 'assets/sfx/mitch/ready.mp3');
    this.load.audio('mitch-go', 'assets/sfx/mitch/go.mp3');
    this.load.audio('mitch-montserrat', 'assets/sfx/mitch/montserrat.mp3');
    this.load.audio('mitch-fira', 'assets/sfx/mitch/fira.mp3');
    this.load.audio('mitch-this-games-winner-is', 'assets/sfx/mitch/this-games-winner-is.mp3');

    // VFX
    this.load.spritesheet('particles-dirt', 'assets/sprites/particles-dirt.png', { frameWidth: 192, frameHeight: 228 });
    this.load.spritesheet('particles-grass', 'assets/sprites/particles-grass.png', { frameWidth: 45, frameHeight: 157 });
    this.load.image('particle-fire', 'assets/particles/fire.png');
    this.load.image('particle-explosion', 'assets/particles/explosion.png');
    this.load.spritesheet('particles-brick', 'assets/particles/brick.png', { frameWidth: 205, frameHeight: 78 });
    this.load.spritesheet('particles-wood', 'assets/particles/wood-splinters.png', { frameWidth: 24, frameHeight: 243 });
    this.load.spritesheet('particles-leaves', 'assets/particles/leaves.png', { frameWidth: 111, frameHeight: 281 });
    this.load.image('particle-generic', 'assets/particles/generic.png');

    // UI
    this.load.image('ui-mech1', 'assets/ui/mech1-head-icon.png');
    this.load.image('ui-mech1-shell', 'assets/ui/mech1-shell-icon.png');
    this.load.image('ui-hume1', 'assets/ui/hume1-head-icon.png');
    this.load.image('ui-oswald', 'assets/ui/oswald-head-icon.png');
    this.load.image('ui-montserrat', 'assets/ui/montserrat-head-icon.png');

    // DOM UI
    this.load.html('dom-title', 'assets/ui-dom/title.html');
    this.load.html('dom-game-over', 'assets/ui-dom/game-over.html');

    // Preloader
    this.completeText = this.add.text(window.innerWidth / 2, window.innerHeight / 2, 'Click to start', {
      fontFamily: 'monospace',
      color: '#FFF',
      fontSize: 32
    });
    this.completeText.setOrigin(0.5);

    this.preloaderLog = this.add.text(window.innerWidth - 20, window.innerHeight - 20, '', {
      fontFamily: 'monospace',
      color: '#555',
      fontSize: 24,
      align: 'right'
    });
    this.preloaderLog.setOrigin(1, 1);

    this.load.on('filecomplete', (file) => {
      this.preloaderLog.text += `\n${file}`;
    });

    this.load.on('progress', (value) => {
      this.completeText.setText(`${Math.floor(value * 100)}%`);
      this.completeText.setAlpha(value);

      if (value === 1) {
        this.completeText.setText('Click to start');
      }
    });

    // Setup resize event
    this.scale.on('resize', this.resize, this);
    this.resize({ width: window.innerWidth, height: window.innerHeight });
  }

  resize({ width, height }) {
    this.completeText.setPosition(width / 2, height / 2);
    this.preloaderLog.setPosition(width - 20, height - 20);

    if (this.fadeGfx) {
      this.fadeGfx.clear();
      this.fadeGfx.fillStyle(0xFFFFFF, 1);
      this.fadeGfx.fillRect(0, 0, width, height);
    }
  }

  create() {
    // Mech1 animations
    this.anims.create({
      key: 'l-mech1-run',
      frames: this.anims.generateFrameNames('mech1', {
        start: 0,
        end: 69,
        prefix: 'Body-Legs - Run/l-run-',
        suffix: '.png',
        zeroPad: 2
      }),
      frameRate: 70,
      repeat: -1
    });

    this.anims.create({
      key: 'r-mech1-run',
      frames: this.anims.generateFrameNames('mech1', {
        start: 0,
        end: 69,
        prefix: 'Body-Legs - Run/r-run-',
        suffix: '.png',
        zeroPad: 2
      }),
      frameRate: 70,
      repeat: -1
    });

    this.anims.create({
      key: 'l-mech1-idle',
      frames: [
        {
          key: 'mech1',
          frame: 'Body-Legs - Idle/l-body-idle.png'
        }
      ],
      frameRate: 0,
      repeat: 0
    });

    this.anims.create({
      key: 'r-mech1-idle',
      frames: [
        {
          key: 'mech1',
          frame: 'Body-Legs - Idle/r-body-idle.png'
        }
      ],
      frameRate: 0,
      repeat: 0
    });

    this.anims.create({
      key: 'l-mech1-up',
      frames: [
        {
          key: 'mech1',
          frame: 'Body-Legs - Up/l-up.png'
        }
      ],
      frameRate: 0,
      repeat: 0
    });

    this.anims.create({
      key: 'r-mech1-up',
      frames: [
        {
          key: 'mech1',
          frame: 'Body-Legs - Up/r-up.png'
        }
      ],
      frameRate: 0,
      repeat: 0
    });

    this.anims.create({
      key: 'l-mech1-down',
      frames: [
        {
          key: 'mech1',
          frame: 'Body-Legs - Down/l-down.png'
        }
      ],
      frameRate: 0,
      repeat: 0
    });

    this.anims.create({
      key: 'r-mech1-down',
      frames: [
        {
          key: 'mech1',
          frame: 'Body-Legs - Down/r-down.png'
        }
      ],
      frameRate: 0,
      repeat: 0
    });

    this.anims.create({
      key: 'l-mech1-up-down',
      frames: this.anims.generateFrameNames('mech1', {
        start: 0,
        end: 11,
        prefix: 'Body-Legs - Up-Down/l-up-down-',
        suffix: '.png',
        zeroPad: 2
      }),
      frameRate: 60,
      repeat: 0
    });

    this.anims.create({
      key: 'r-mech1-up-down',
      frames: this.anims.generateFrameNames('mech1', {
        start: 0,
        end: 11,
        prefix: 'Body-Legs - Up-Down/r-up-down-',
        suffix: '.png',
        zeroPad: 2
      }),
      frameRate: 60,
      repeat: 0
    });

    this.anims.create({
      key: 'l-mech1-arm-left-idle',
      frames: [
        {
          key: 'mech1-arm-left',
          frame: 'Left Arm - Idle/l-l-idle.png'
        }
      ],
      frameRate: 0,
      repeat: 0
    });

    this.anims.create({
      key: 'r-mech1-arm-left-idle',
      frames: [
        {
          key: 'mech1-arm-left',
          frame: 'Left Arm - Idle/r-l-idle.png'
        }
      ],
      frameRate: 0,
      repeat: 0
    });

    this.anims.create({
      key: 'l-mech1-arm-left-light-shot',
      frames: this.anims.generateFrameNames('mech1-arm-left', {
        start: 0,
        end: 5,
        prefix: 'Left Arm - Light Shot/l-l-light-',
        suffix: '.png',
        zeroPad: -1
      }),
      frameRate: 60,
      repeat: -1
    });

    this.anims.create({
      key: 'r-mech1-arm-left-light-shot',
      frames: this.anims.generateFrameNames('mech1-arm-left', {
        start: 0,
        end: 5,
        prefix: 'Left Arm - Light Shot/r-l-light-',
        suffix: '.png',
        zeroPad: -1
      }),
      frameRate: 60,
      repeat: -1
    });

    this.anims.create({
      key: 'l-mech1-arm-left-heavy-shot',
      frames: this.anims.generateFrameNames('mech1-arm-left', {
        start: 0,
        end: 23,
        prefix: 'Left Arm - Heavy Shot/l-l-heavy-',
        suffix: '.png',
        zeroPad: 2
      }),
      frameRate: 60,
      repeat: -1
    });

    this.anims.create({
      key: 'r-mech1-arm-left-heavy-shot',
      frames: this.anims.generateFrameNames('mech1-arm-left', {
        start: 0,
        end: 23,
        prefix: 'Left Arm - Heavy Shot/r-l-heavy-',
        suffix: '.png',
        zeroPad: 2
      }),
      frameRate: 60,
      repeat: -1
    });

    this.anims.create({
      key: 'l-mech1-arm-right-idle',
      frames: [
        {
          key: 'mech1-arm-right',
          frame: 'Right Arm - Idle/l-r-idle.png'
        }
      ],
      frameRate: 0,
      repeat: 0
    });

    this.anims.create({
      key: 'r-mech1-arm-right-idle',
      frames: [
        {
          key: 'mech1-arm-right',
          frame: 'Right Arm - Idle/r-r-idle.png'
        }
      ],
      frameRate: 0,
      repeat: 0
    });

    this.anims.create({
      key: 'l-mech1-arm-right-light-shot',
      frames: this.anims.generateFrameNames('mech1-arm-right', {
        start: 0,
        end: 5,
        prefix: 'Right Arm - Light Shot/l-r-light-',
        suffix: '.png',
        zeroPad: 0
      }),
      frameRate: 60,
      repeat: -1
    });

    this.anims.create({
      key: 'r-mech1-arm-right-light-shot',
      frames: this.anims.generateFrameNames('mech1-arm-right', {
        start: 0,
        end: 5,
        prefix: 'Right Arm - Light Shot/r-r-light-',
        suffix: '.png',
        zeroPad: 0
      }),
      frameRate: 60,
      repeat: -1
    });

    this.anims.create({
      key: 'l-mech1-arm-right-heavy-shot',
      frames: this.anims.generateFrameNames('mech1-arm-right', {
        start: 0,
        end: 23,
        prefix: 'Right Arm - Heavy Shot/l-r-heavy-',
        suffix: '.png',
        zeroPad: 2
      }),
      frameRate: 60,
      repeat: -1
    });

    this.anims.create({
      key: 'r-mech1-arm-right-heavy-shot',
      frames: this.anims.generateFrameNames('mech1-arm-right', {
        start: 0,
        end: 23,
        prefix: 'Right Arm - Heavy Shot/r-r-heavy-',
        suffix: '.png',
        zeroPad: 2
      }),
      frameRate: 60,
      repeat: -1
    });

    // Hume1 animations
    this.anims.create({
      key: 'hume1-idle',
      frames: this.anims.generateFrameNames('hume1', {
        start: 0,
        end: 59,
        prefix: 'idle-',
        suffix: '.png',
        zeroPad: 2
      }),
      frameRate: 60,
      repeat: -1
    });

    this.anims.create({
      key: 'hume1-run',
      frames: this.anims.generateFrameNames('hume1', {
        start: 0,
        end: 49,
        prefix: 'run-',
        suffix: '.png',
        zeroPad: 2
      }),
      frameRate: 60,
      repeat: -1
    });

    this.anims.create({
      key: 'hume1-run-back',
      frames: this.anims.generateFrameNames('hume1', {
        start: 0,
        end: 59,
        prefix: 'run-back-',
        suffix: '.png',
        zeroPad: 2
      }),
      frameRate: 60,
      repeat: -1
    });

    this.anims.create({
      key: 'hume1-jump',
      frames: this.anims.generateFrameNames('hume1', {
        start: 0,
        end: 19,
        prefix: 'jump-',
        suffix: '.png',
        zeroPad: 2
      }),
      frameRate: 60,
      repeat: -1
    });

    this.anims.create({
      key: 'hume1-flip',
      frames: this.anims.generateFrameNames('hume1', {
        start: 0,
        end: 19,
        prefix: 'flip-',
        suffix: '.png',
        zeroPad: 2
      }),
      frameRate: 60,
      repeat: -1
    });

    this.anims.create({
      key: 'hume1-fall',
      frames: this.anims.generateFrameNames('hume1', {
        start: 0,
        end: 59,
        prefix: 'fall-',
        suffix: '.png',
        zeroPad: 2
      }),
      frameRate: 60,
      repeat: -1
    });

    this.anims.create({
      key: 'hume1-aim',
      frames: [
        { key: 'hume1', frame: 'aim.png' }
      ],
      frameRate: 0,
      repeat: 0
    });

    this.anims.create({
      key: 'hume1-lunge',
      frames: this.anims.generateFrameNames('hume1', {
        start: 0,
        end: 19,
        prefix: 'lunge-',
        suffix: '.png',
        zeroPad: 2
      }),
      frameRate: 60,
      repeat: -1
    });

    this.anims.create({
      key: 'hume1-air-atk',
      frames: this.anims.generateFrameNames('hume1', {
        start: 0,
        end: 29,
        prefix: 'fall-atk-',
        suffix: '.png',
        zeroPad: 2
      }),
      frameRate: 60,
      repeat: 0
    });

    // Oswald animations
    this.anims.create({
      key: 'oswald-idle',
      frames: this.anims.generateFrameNames('oswald', {
        start: 0,
        end: 59,
        prefix: 'idle-',
        suffix: '.png',
        zeroPad: 2
      }),
      frameRate: 60,
      repeat: -1
    });

    this.anims.create({
      key: 'oswald-run-forwards',
      frames: this.anims.generateFrameNames('oswald', {
        start: 0,
        end: 59,
        prefix: 'run-forwards-',
        suffix: '.png',
        zeroPad: 2
      }),
      frameRate: 60,
      repeat: -1
    });

    this.anims.create({
      key: 'oswald-run-backwards',
      frames: this.anims.generateFrameNames('oswald', {
        start: 0,
        end: 59,
        prefix: 'run-backwards-',
        suffix: '.png',
        zeroPad: 2
      }),
      frameRate: 60,
      repeat: -1
    });

    this.anims.create({
      key: 'oswald-aim',
      frames: [
        { key: 'oswald', frame: 'aim.png' }
      ],
      frameRate: 0,
      repeat: 0
    });

    this.anims.create({
      key: 'oswald-up',
      frames: [
        { key: 'oswald', frame: 'up.png' }
      ],
      frameRate: 0,
      repeat: 0
    });

    this.anims.create({
      key: 'oswald-down',
      frames: [
        { key: 'oswald', frame: 'down.png' }
      ],
      frameRate: 0,
      repeat: 0
    });

    this.anims.create({
      key: 'oswald-down-aim',
      frames: [
        { key: 'oswald', frame: 'down-aim.png' }
      ],
      frameRate: 0,
      repeat: 0
    });

    this.anims.create({
      key: 'oswald-throw',
      frames: this.anims.generateFrameNames('oswald', {
        start: 0,
        end: 9,
        prefix: 'throw-',
        suffix: '.png',
        zeroPad: 0
      }),
      frameRate: 60,
      repeat: 0
    });

    this.anims.create({
      key: 'oswald-down-throw',
      frames: this.anims.generateFrameNames('oswald', {
        start: 0,
        end: 9,
        prefix: 'down-throw-',
        suffix: '.png',
        zeroPad: 0
      }),
      frameRate: 60,
      repeat: 0
    });

    // Montserrat animations
    this.anims.create({
      key: 'r-montserrat-idle',
      frames: this.anims.generateFrameNames('montserrat', {
        start: 0,
        end: 29,
        prefix: 'montserrat - Idle/r-idle-',
        suffix: '.png',
        zeroPad: 2
      }),
      frameRate: 60,
      repeat: -1
    });

    this.anims.create({
      key: 'l-montserrat-idle',
      frames: this.anims.generateFrameNames('montserrat', {
        start: 0,
        end: 29,
        prefix: 'montserrat - Idle/l-idle-',
        suffix: '.png',
        zeroPad: 2
      }),
      frameRate: 60,
      repeat: -1
    });

    this.input.mouse.disableContextMenu();

    this.fadeGfx = this.add.graphics();
    this.fadeGfx.fillStyle(0xFFFFFF, 1);
    this.fadeGfx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    this.fadeGfx.setAlpha(0);

    // this.sound.setVolume(0);
    // this.sound.setVolume(0.25);

    this.sound.play('sfx-electro-click1');

    this.input.on('pointerdown', () => {
      this.tweens.add({
        targets: this.fadeGfx,
        alpha: 1,
        duration: 250,
        repeat: 0,
        onComplete: () => {
          this.scene.start('scene-menu');

          // this.scene.start('scene-game', { levelKey: 'map1', p1Key: 'arial', p2Key: 'arial' });

          // this.registry.p1Key = 'oswald';
          // this.registry.p2Key = 'roboto';
          // this.scene.start('scene-gameover', {
          //   playerWon: true,
          //   totalTime: 200000,
          //   tilesDestroyed: 189
          // });
        }
      });
    });
  }
}

export default BootScene;