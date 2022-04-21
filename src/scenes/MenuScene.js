import { Scene } from "phaser";
import moment from "moment";

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
    const btnUpdate = document.getElementById('btn-update');

    const updateAvatar = document.getElementById('avatar');
    const updateMessage = document.getElementById('message');
    const updateTime = document.getElementById('update-time');

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

    // Load latest update from GH
    fetch('https://api.github.com/repos/saricden/mech-game/commits')
    .then((response) => response.json())
    .then((json) => {
      const latestCommit = json[0];
      const {author, commit} = latestCommit;
      const {avatar_url} = author;
      const {message} = commit;
      const {date} = commit.author;

      updateAvatar.setAttribute('src', avatar_url);
      updateMessage.innerHTML = message;
      updateTime.innerHTML = moment(date).fromNow();
      btnUpdate.classList.add('on');
    });
  }
}

export default MenuScene;