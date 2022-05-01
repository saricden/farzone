import { Scene } from "phaser";
import moment from "moment";

class MenuScene extends Scene {
  constructor() {
    super('scene-menu');
  }

  init({ skipTo = 'none' }) {
    this.skipTo = skipTo;
  }

  create() {
    const charData = {
      'roboto': {
        voiceKey: 'mitch-roboto'
      },
      'arial': {
        voiceKey: 'mitch-arial'
      },
      'oswald': {
        voiceKey: 'mitch-oswald'
      }
    };

    this.levelKey = null;
    this.p1Key = 'roboto';
    this.p2Key = 'roboto';

    this.title = this.add.dom(0, 0, 'div', 'width: 100%;').createFromCache('dom-title');
    this.title.setOrigin(0, 0);
    
    // Bind DOM events
    const btnPlay = document.getElementById('btn-play');
    const btnSettings = document.getElementById('btn-settings');
    const btnCredits = document.getElementById('btn-credits');
    const btnGitHub = document.getElementById('btn-github');
    const btnUpdate = document.getElementById('btn-update');

    const updateAvatar = document.getElementById('avatar');
    const updateMessage = document.getElementById('message');
    const updateTime = document.getElementById('update-time');

    const titleBG = document.getElementById('title-bg');
    const menuTitle = document.getElementById('menu-title');

    const mapSelect = document.getElementById('map-select');
    const mapBtns = document.querySelectorAll('[data-map]');

    const playerSelect = document.getElementById('player-select');
    const profilePlayer = document.getElementById('profile-player');
    const profileComputer = document.getElementById('profile-computer');
    const charBtnsPlayer = document.querySelectorAll('[data-character-player]');
    const charBtnsComputer = document.querySelectorAll('[data-character-computer]');
    const playerInfo = document.getElementById('player-info');
    const computerInfo = document.getElementById('computer-info');
    const btnStartMatch = document.getElementById('btn-start-match');

    const credits = document.getElementById('credits');

    const btnTitle = document.getElementById('btn-title');

    btnStartMatch.addEventListener('click', () => {
      this.sound.play('mitch-ready');
      
      btnStartMatch.classList.add('go');

      this.time.addEvent({
        delay: 600,
        repeat: 0,
        callback: () => {
          this.wind.stop();
        
          this.scene.start('scene-game', {
            levelKey: this.levelKey,
            p1Key: this.p1Key,
            p2Key: this.p2Key
          });
        }
      });
    });

    charBtnsPlayer.forEach((btn) => {
      btn.addEventListener('mouseenter', () => {
        this.sound.play('sfx-click');
      });

      btn.addEventListener('click', () => {
        const charKey = btn.getAttribute('data-character-player');
        const {voiceKey} = charData[charKey];

        charBtnsPlayer.forEach((btn2) => {
          btn2.classList.remove('selected');
        });

        btn.classList.add('selected');

        profilePlayer.setAttribute('src', `/assets/ui-dom/profiles/${charKey}.png`);

        playerInfo.querySelector('header').innerHTML = charKey;

        this.p1Key = charKey;

        this.sound.play(voiceKey);
      });
    });

    // charBtnsComputer.forEach((btn) => {
    //   btn.addEventListener('mouseenter', () => {
    //     this.sound.play('sfx-click');
    //   });

    //   btn.addEventListener('click', () => {
    //     this.sound.play('sfx-click');
    //     const charKey = btn.getAttribute('data-character-computer');
    //     const {voiceKey} = charData[charKey];

    //     charBtnsComputer.forEach((btn2) => {
    //       btn2.classList.remove('selected');
    //     });

    //     btn.classList.add('selected');

    //     profileComputer.setAttribute('src', `/assets/ui-dom/profiles/${charKey}.png`);

    //     computerInfo.querySelector('header').innerHTML = charKey;

    //     this.p2Key = charKey;

    //     this.sound.play(voiceKey);
    //   });
    // });

    mapBtns.forEach((btn) => {
      btn.addEventListener('mouseenter', () => {
        this.sound.play('sfx-click');
      });

      btn.addEventListener('click', () => {
        const levelKey = btn.getAttribute('data-map');

        this.sound.play('sfx-electro-click2');
        
        this.levelKey = levelKey;

        mapSelect.classList.remove('open');
        playerSelect.classList.add('open');
        btnStartMatch.classList.add('open');
      });
    });

    btnCredits.addEventListener('mouseenter', () => {
      this.sound.play('sfx-click');
    });

    btnCredits.addEventListener('click', () => {
      this.sound.play('sfx-electro-click2');

      menuTitle.classList.add('off');
      btnUpdate.classList.add('off');
      btnUpdate.style = "transition-delay: 0s;";
      credits.classList.add('on');

      this.time.addEvent({
        delay: 20000,
        repeat: 0,
        callback: () => {
          credits.classList.remove('on');
          menuTitle.classList.remove('off');
          btnUpdate.classList.remove('off');
        }
      })
    });

    btnPlay.addEventListener('mouseenter', () => {
      this.sound.play('sfx-click');
    });

    btnPlay.addEventListener('click', () => {
      this.sound.play('sfx-electro-click2');

      titleBG.classList.add('down');
      menuTitle.classList.add('off');
      btnUpdate.classList.add('off');
      mapSelect.classList.add('open');
      btnTitle.classList.add('on');
    });

    if (this.skipTo === 'level-select') {
      titleBG.classList.add('down');
      menuTitle.classList.add('off');
      btnUpdate.classList.add('off');
      mapSelect.classList.add('open');
      btnTitle.classList.add('on');
    }

    btnGitHub.addEventListener('mouseenter', () => {
      this.sound.play('sfx-click');
    });

    btnGitHub.addEventListener('click', () => {
      window.open('https://github.com/saricden/farzone', '_blank');
    });

    // Play intro tune
    if (this.skipTo === 'none') {
      this.sound.play('ost-title');
    }
    
    this.wind = this.sound.add('sfx-wind-loop', { loop: true, volume: 0.1 });
    this.wind.play();

    // Load latest update from GH
    fetch('https://api.github.com/repos/saricden/mech-game/commits')
    .then((response) => response.json())
    .then((json) => {
      const latestCommit = json[0];
      const {author, commit, html_url} = latestCommit;
      const {avatar_url} = author;
      const {message} = commit;
      const {date} = commit.author;

      updateAvatar.setAttribute('src', avatar_url);
      updateMessage.innerHTML = message;
      updateTime.innerHTML = moment(date).fromNow();
      btnUpdate.classList.add('on');

      btnUpdate.addEventListener('mouseenter', () => {
        this.sound.play('sfx-click');
      });

      btnUpdate.addEventListener('click', () => {
        window.open(html_url, '_blank');
      });
    });

    btnSettings.addEventListener('mouseenter', () => {
      this.sound.play('sfx-click');
    });

    btnTitle.addEventListener('mouseenter', () => {
      this.sound.play('sfx-click');
    });

    btnTitle.addEventListener('click', () => {
      this.sound.play('sfx-electro-click2');
      
      titleBG.classList.remove('down');
      menuTitle.classList.remove('off');
      btnUpdate.classList.remove('off');
      mapSelect.classList.remove('open');
      btnTitle.classList.remove('on');
      playerSelect.classList.remove('open');
      btnStartMatch.classList.remove('open');
    });
  }
}

export default MenuScene;