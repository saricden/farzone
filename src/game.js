import './main.css';
import Phaser, {Game} from 'phaser';
import PhaserRaycaster from 'phaser-raycaster/dist/phaser-raycaster';
import BootScene from './scenes/BootScene';
import MenuScene from './scenes/MenuScene';
import GameScene2 from './scenes/GameScene2';
import GameOverScene from './scenes/GameOverScene';

// UI
import BattleHUD from './scenes/BattleHUD';

// Render pipelines
import HueRotatePipeline from "./pipelines/HueRotate";

const canvas = document.getElementById('game-canvas');
const config = {
  type: Phaser.WEBGL,
  scale: {
    mode: Phaser.Scale.NONE,
    parent: 'game',
    width: window.innerWidth,
    height: window.innerHeight
  },
  dom: {
    createContainer: true
  },
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
      debug: false
    }
  },
  plugins: {
    scene: [
      {
        key: 'PhaserRaycaster',
        plugin: PhaserRaycaster,
        mapping: 'raycasterPlugin'
      }
    ]
  },
  scene: [
    BootScene,
    MenuScene,
    GameScene2,
    GameOverScene,

    BattleHUD
  ],
  // pipeline: {
  //   'HueRotate': HueRotatePipeline
  // }
};

const game = new Game(config);

window.addEventListener('resize', function (event) {

  game.scale.resize(window.innerWidth, window.innerHeight);

}, false);