import { Scene } from "phaser";
import moment from "moment";
import Peer from "peerjs";

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
      },
      'montserrat': {
        voiceKey: 'mitch-montserrat'
      },
      'fira': {
        voiceKey: 'mitch-fira'
      }
    };

    this.levelKey = null;
    this.bgColor = null;
    this.p1Key = 'roboto';
    this.p2Key = 'roboto';

    this.title = this.add.dom(0, 0, 'div', 'width: 100%;').createFromCache('dom-title');
    this.title.setOrigin(0, 0);
    
    // Bind DOM events
    const btnPlay = document.getElementById('btn-play');
    const btnMultiplayer = document.getElementById('btn-multiplayer');
    const btnSettings = document.getElementById('btn-settings');
    const btnCredits = document.getElementById('btn-credits');
    const btnGitHub = document.getElementById('btn-github');
    const btnUpdate = document.getElementById('btn-update');

    const updateAvatar = document.getElementById('avatar');
    const updateMessage = document.getElementById('message');
    const updateTime = document.getElementById('update-time');

    const titleBG = document.getElementById('title-bg');
    const menuTitle = document.getElementById('menu-title');

    this.mapSelect = document.getElementById('map-select');
    const mapBtns = document.querySelectorAll('[data-map]');

    this.playerSelect = document.getElementById('player-select');
    const profilePlayer = document.getElementById('profile-player');
    const profileComputer = document.getElementById('profile-computer');
    const charBtnsPlayer = document.querySelectorAll('[data-character-player]');
    const charBtnsComputer = document.querySelectorAll('[data-character-computer]');
    const playerInfo = document.getElementById('player-info');
    const computerInfo = document.getElementById('computer-info');
    this.btnStartMatch = document.getElementById('btn-start-match');

    const multiplayerConnect = document.getElementById('multiplayer-connect');
    const mpConnectingLoader = document.getElementById('mp-connecting-loader');
    const mpPlayerID = document.getElementById('mp-player-id');
    const mpOptionBoxes = document.querySelectorAll('#multiplayer-connect .option-box');
    const mpOr = document.getElementById('mp-or');
    const mpRemoteID = document.getElementById('mp-remote-id');
    const mpBtnConnect = document.getElementById('btn-mp-connect');

    const credits = document.getElementById('credits');

    const btnTitle = document.getElementById('btn-title');

    this.registry.isMultiplayer = false;
    this.registry.isMultiplayerHost = false;

    btnMultiplayer.addEventListener('click', () => {
      multiplayerConnect.classList.add('open');
      mpConnectingLoader.classList.add('on');

      // Create new Peer
      if (typeof this.registry.peer === 'undefined') {
        this.registry.peer = new Peer({
          host: 'farzone-server.herokuapp.com',
          port: 443,
          secure: true,
          // debug: 3
          debug: 0
        });
  
        this.registry.peer.on('open', (id) => {
          mpPlayerID.innerHTML = id;
          
          mpConnectingLoader.classList.remove('on');
  
          mpOptionBoxes.forEach((box) => {
            box.classList.add('on');
          });
  
          mpOr.classList.add('on');
        });

        this.registry.peer.on('connection', (connection) => {
          this.registry.connection = connection;

          mpConnectingLoader.classList.remove('on');
          mpOptionBoxes.forEach((box) => {
            box.classList.remove('on');
          });
          mpOr.classList.remove('on');
          multiplayerConnect.classList.remove('open');

          btnMultiplayer.setAttribute('disabled', true);

          this.registry.connection.on('data', (data) => {
            this.handleMultiplayerData(data);
          });

          this.registry.isMultiplayer = true;
          this.registry.isMultiplayerHost = false;

          // Move to map select
          titleBG.classList.add('down');
          menuTitle.classList.add('off');
          btnUpdate.classList.add('off');
          this.mapSelect.classList.add('open');
          btnTitle.classList.add('on');

          // Disable map buttons for non-host
          mapBtns.forEach((btn) => {
            btn.setAttribute('disabled', true);
          });

          // Hide the main menu btn (for now, TODO: change to disconnect btn)
          btnTitle.style.display = "none";
        });
      }
      else {
        mpConnectingLoader.classList.remove('on');
      }
    });

    mpBtnConnect.addEventListener('click', () => {
      if (typeof this.registry.peer !== 'undefined') {
        const remoteID = mpRemoteID.value;
        this.registry.connection = this.registry.peer.connect(remoteID);
        
        mpOptionBoxes.forEach((box) => {
          box.classList.remove('on');
        });
        mpOr.classList.remove('on');
        
        mpConnectingLoader.classList.add('on');

        this.registry.connection.on('open', () => {
          mpConnectingLoader.classList.remove('on');
          multiplayerConnect.classList.remove('open');

          btnMultiplayer.setAttribute('disabled', true);

          this.registry.connection.on('data', (data) => {
            this.handleMultiplayerData(data);
          });

          this.registry.isMultiplayer = true;
          this.registry.isMultiplayerHost = true; // player initiating connection starts as host

          // Move to the map selection screen
          titleBG.classList.add('down');
          menuTitle.classList.add('off');
          btnUpdate.classList.add('off');
          this.mapSelect.classList.add('open');
          btnTitle.classList.add('on');

          // Hide the main menu btn (for now, TODO: change to disconnect btn)
          btnTitle.style.display = "none";
        });
      }
    });

    this.btnStartMatch.addEventListener('click', () => {
      this.sound.play('mitch-ready');
      
      this.btnStartMatch.classList.add('go');

      this.time.addEvent({
        delay: 600,
        repeat: 0,
        callback: () => {
          this.wind.stop();
        
          this.scene.start('scene-game', {
            levelKey: this.levelKey,
            bgColor: this.bgColor,
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

    charBtnsComputer.forEach((btn) => {
      btn.addEventListener('mouseenter', () => {
        this.sound.play('sfx-click');
      });

      btn.addEventListener('click', () => {
        this.sound.play('sfx-click');
        const charKey = btn.getAttribute('data-character-computer');
        const {voiceKey} = charData[charKey];

        charBtnsComputer.forEach((btn2) => {
          btn2.classList.remove('selected');
        });

        btn.classList.add('selected');

        profileComputer.setAttribute('src', `/assets/ui-dom/profiles/${charKey}.png`);

        computerInfo.querySelector('header').innerHTML = charKey;

        this.p2Key = charKey;

        this.sound.play(voiceKey);
      });
    });

    mapBtns.forEach((btn) => {
      const levelKey = btn.getAttribute('data-map');

      btn.addEventListener('mouseenter', () => {
        this.sound.play('sfx-click');

        if (this.registry.isMultiplayer && this.registry.isMultiplayerHost) {
          this.registry.connection.send({
            EVENT: 'map-hover',
            mapKey: levelKey
          });
        }
      });

      btn.addEventListener('mouseout', () => {
        if (this.registry.isMultiplayer && this.registry.isMultiplayerHost) {
          this.registry.connection.send({
            EVENT: 'map-blur',
            mapKey: levelKey
          });
        }
      });

      btn.addEventListener('click', () => {
        const bgColor = btn.getAttribute('data-map-bg-color');

        this.sound.play('sfx-electro-click2');
        
        this.levelKey = levelKey;

        if (bgColor) {
          this.bgColor = bgColor;
        }

        this.mapSelect.classList.remove('open');
        this.playerSelect.classList.add('open');
        this.btnStartMatch.classList.add('open');

        if (this.registry.isMultiplayer && this.registry.isMultiplayerHost) {
          this.registry.connection.send({
            EVENT: 'map-select',
            mapKey: levelKey
          });
        }
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
      this.mapSelect.classList.add('open');
      btnTitle.classList.add('on');
    });

    if (this.skipTo === 'level-select') {
      titleBG.classList.add('down');
      menuTitle.classList.add('off');
      btnUpdate.classList.add('off');
      this.mapSelect.classList.add('open');
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
      this.mapSelect.classList.remove('open');
      btnTitle.classList.remove('on');
      this.btnStartMatch.classList.remove('open');
    });
  }

  handleMultiplayerData(data) {
    const {EVENT} = data;

    if (EVENT === 'map-hover') {
      const {mapKey} = data;

      const hoveredMap = document.querySelector(`[data-map="${mapKey}"]`);
      hoveredMap.classList.add('remote-hover');

      this.sound.play('sfx-click');
    }
    else if (EVENT === 'map-blur') {
      const {mapKey} = data;

      const hoveredMap = document.querySelector(`[data-map="${mapKey}"]`);
      hoveredMap.classList.remove('remote-hover');
    }
    else if (EVENT === 'map-select') {
      const {mapKey} = data;

      this.levelKey = mapKey;

      console.log('RECEIVED MAP-SELECT');

      this.mapSelect.classList.remove('open');
      this.playerSelect.classList.add('open');
      this.btnStartMatch.classList.add('open');
    }
  }
}

export default MenuScene;