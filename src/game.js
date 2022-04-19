import './main.css';
import Phaser, {Game} from 'phaser';
import PhaserRaycaster from 'phaser-raycaster/dist/phaser-raycaster';
import BootScene from './scenes/BootScene';
import MenuScene from './scenes/MenuScene';
import GameScene from './scenes/GameScene';

// UI
import BattleHUD from './scenes/BattleHUD';

const canvas = document.getElementById('game-canvas');
const config = {
  type: Phaser.WEBGL,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: "game",
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
    GameScene,

    BattleHUD
  ]
};

const game = new Game(config);