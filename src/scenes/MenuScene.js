import { Scene } from "phaser";

class MenuScene extends Scene {
  constructor() {
    super('scene-menu');
  }

  create() {
    this.title = this.add.dom(0, 0, 'div', 'width: 100%;').createFromCache('dom-title');
    this.title.setOrigin(0, 0);
    
    // Bind DOM events
    const btnPlay = document.getElementById('btn-play');
    const btnSettings = document.getElementById('btn-settings');
    const btnGitHub = document.getElementById('btn-github');

    btnPlay.addEventListener('click', () => {
      this.wind.stop();
      this.scene.start('scene-game');
    });

    btnGitHub.addEventListener('click', () => {
      window.open('https://github.com/saricden/mech-game', '_blank');
    });

    // Play intro tune
    this.sound.play('ost-title');
    this.wind = this.sound.add('sfx-wind-loop', { loop: true, volume: 0.1 });
    this.wind.play();
  }
}

export default MenuScene;