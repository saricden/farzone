import { Scene } from "phaser";
import moment from "moment";

class GameOverScene extends Scene {
  constructor() {
    super('scene-gameover');
  }

  init({ playerWon, totalTime, tilesDestroyed }) {
    this.playerWon = playerWon;
    this.totalTime = totalTime;
    this.tilesDestroyed = tilesDestroyed;
  }

  create() {
    this.ui = this.add.dom(0, 0, 'div', 'width: 100%;').createFromCache('dom-game-over');
    this.ui.setOrigin(0, 0);

    this.victor = this.add.image(300, window.innerHeight / 2 + 100, 'mech1-victory');
    this.loser = this.add.image(this.victor.x + this.victor.displayWidth / 2 - 40, this.victor.y - this.victor.displayHeight / 2 - 25, 'mech1-head');

    if (this.playerWon) {
      this.loser.setTint(0xFF0000);
      document.getElementById('game-heading').innerHTML = "VICTORY";
    }
    else {
      this.victor.setTint(0xFF0000);
      document.getElementById('game-heading').innerHTML = "DEFEAT";
    }

    this.loser.setFlipX(true);

    this.loser.setDepth(0);
    this.victor.setDepth(1);

    document.getElementById('game-over').classList.add('open');
    document.getElementById('total-time').innerHTML = moment(this.totalTime).format("mm:ss");
    document.getElementById('total-destruction').innerHTML = this.tilesDestroyed;

    const btnNext = document.getElementById('btn-next-game');

    btnNext.addEventListener('mouseenter', () => {
      this.sound.play('sfx-click');
    });

    btnNext.addEventListener('click', () => {
      this.sound.play('sfx-electro-click2');

      this.scene.start('scene-menu', {
        skipTo: 'level-select'
      });
    });

    this.time.addEvent({
      delay: 7000,
      repeat: 0,
      callback: () => {
        btnNext.classList.add('on');
      }
    });
  }
}

export default GameOverScene;