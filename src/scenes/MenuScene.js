import { Scene } from "phaser";
import moment from "moment";
import { network } from "../network";

class MenuScene extends Scene {
  constructor() {
    super('scene-menu');
  }

  init({ skipTo = 'none' }) {
    this.skipTo = skipTo;
  }

  create() {
    this.charData = {
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
    this.mpOpponentReadyForMatch = false;
    this.mpReadyForMatch = false;

    this.title = this.add.dom(0, 0, 'div', 'width: 100%;').createFromCache('dom-title');
    this.title.setOrigin(0, 0);
    
    // Bind DOM objects
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
    this.profilePlayer = document.getElementById('profile-player');
    this.profileComputer = document.getElementById('profile-computer');
    this.charBtnsPlayer = document.querySelectorAll('[data-character-player]');
    this.charBtnsComputer = document.querySelectorAll('[data-character-computer]');
    this.playerInfo = document.getElementById('player-info');
    this.computerInfo = document.getElementById('computer-info');
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

    const fadeIn = document.getElementById('fadein');

    // Skip intro
    fadeIn.addEventListener('click', () => {
      document.body.classList.add('skip-intro');
      this.introTune.stop();
    });

    this.registry.isMultiplayer = false;
    this.registry.isMultiplayerHost = false;

    btnMultiplayer.addEventListener('click', () => {
      multiplayerConnect.classList.add('open');
      mpConnectingLoader.classList.add('on');

      // Create new Peer
      if (!network.isOpen()) {
        network.open().then((id) => {
          mpPlayerID.innerHTML = id;
          
          mpConnectingLoader.classList.remove('on');
  
          mpOptionBoxes.forEach((box) => {
            box.classList.add('on');
          });
  
          mpOr.classList.add('on');
        });
        this.registerNetworkEvents();

        // this.registry.peer.on('connection', (connection) => {
        // this.registry.connection = connection;

        network.addEventListener('connection', (e) => {
          if (e.detail.side === 'incoming') {
            // if (e.detail.side === '')
            mpConnectingLoader.classList.remove('on');
            mpOptionBoxes.forEach((box) => {
              box.classList.remove('on');
            });
            mpOr.classList.remove('on');
            multiplayerConnect.classList.remove('open');
    
            btnMultiplayer.setAttribute('disabled', true);
    
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
          }
        });
      }
      else {
        mpConnectingLoader.classList.remove('on');
      }
    });

    mpBtnConnect.addEventListener('click', () => {
      if (network.isOpen()) {
        const remoteID = mpRemoteID.value;

        network.addEventListener('connection', (e) => {
          mpConnectingLoader.classList.remove('on');
          multiplayerConnect.classList.remove('open');

          btnMultiplayer.setAttribute('disabled', true);

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

        network.connectTo(remoteID);
        
        mpOptionBoxes.forEach((box) => {
          box.classList.remove('on');
        });
        mpOr.classList.remove('on');
        
        mpConnectingLoader.classList.add('on');
      }
    });

    this.btnStartMatch.addEventListener('click', () => {
      if (this.registry.isMultiplayer) {
        if (this.registry.isMultiplayerHost) {
          document.querySelector('.characters.player').classList.add('ready');
        }
        else {
          document.querySelector('.characters.computer').classList.add('ready');
        }

        this.mpReadyForMatch = true;

        if (this.mpOpponentReadyForMatch) {
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
        }

        network.send('player-ready');
      }
      else {
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
      }
    });

    this.charBtnsPlayer.forEach((btn) => {
      const charKey = btn.getAttribute('data-character-player');

      btn.addEventListener('mouseenter', () => {
        this.sound.play('sfx-click');

        if (this.registry.isMultiplayer && this.registry.isMultiplayerHost) {
          network.send('character-hover', charKey);
        }
      });

      btn.addEventListener('mouseout', () => {
        if (this.registry.isMultiplayer && this.registry.isMultiplayerHost) {
          network.send('character-blur', charKey);
        }
      });

      btn.addEventListener('click', () => {
        const {voiceKey} = this.charData[charKey];

        this.charBtnsPlayer.forEach((btn2) => {
          btn2.classList.remove('selected');
        });

        btn.classList.add('selected');

        this.profilePlayer.setAttribute('src', `/assets/ui-dom/profiles/${charKey}.png`);

        this.playerInfo.querySelector('header').innerHTML = charKey;

        this.p1Key = charKey;

        this.sound.play(voiceKey);

        if (this.registry.isMultiplayer) {
          network.send('character-select', charKey);
        }
      });
    });

    this.charBtnsComputer.forEach((btn) => {
      const charKey = btn.getAttribute('data-character-computer');

      btn.addEventListener('mouseenter', () => {
        this.sound.play('sfx-click');

        if (this.registry.isMultiplayer && !this.registry.isMultiplayerHost) {
          network.send('character-hover', charKey);
        }
      });

      btn.addEventListener('mouseout', () => {
        if (this.registry.isMultiplayer && !this.registry.isMultiplayerHost) {
          network.send('character-blur', charKey);
        }
      });

      btn.addEventListener('click', () => {
        this.sound.play('sfx-click');
        const {voiceKey} = this.charData[charKey];

        this.charBtnsComputer.forEach((btn2) => {
          btn2.classList.remove('selected');
        });

        btn.classList.add('selected');

        this.profileComputer.setAttribute('src', `/assets/ui-dom/profiles/${charKey}.png`);

        this.computerInfo.querySelector('header').innerHTML = charKey;

        this.p2Key = charKey;

        this.sound.play(voiceKey);

        if (this.registry.isMultiplayer) {
          network.send('character-select', charKey);
        }
      });
    });

    mapBtns.forEach((btn) => {
      const levelKey = btn.getAttribute('data-map');

      btn.addEventListener('mouseenter', () => {
        this.sound.play('sfx-click');

        if (this.registry.isMultiplayer && this.registry.isMultiplayerHost) {
          network.send('map-hover', levelKey);
        }
      });

      btn.addEventListener('mouseout', () => {
        if (this.registry.isMultiplayer && this.registry.isMultiplayerHost) {
          network.send('map-blur', levelKey);
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
          this.charBtnsComputer.forEach((btn) => btn.setAttribute('disabled', true));

          network.send('map-select', levelKey);
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
      this.introTune = this.sound.add('ost-title');
      this.introTune.play();
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
      this.playerSelect.classList.remove('open');
    });
  }

  registerNetworkEvents() {
    network.on('map-hover', (mapKey) => {
      const hoveredMap = document.querySelector(`[data-map="${mapKey}"]`);
      hoveredMap.classList.add('remote-hover');

      this.sound.play('sfx-click');
    });

    network.on('map-blur', (mapKey) => {
      const hoveredMap = document.querySelector(`[data-map="${mapKey}"]`);
      hoveredMap.classList.remove('remote-hover');
    });

    network.on('map-select', (mapKey) => {
      this.levelKey = mapKey;

      this.mapSelect.classList.remove('open');
      this.playerSelect.classList.add('open');
      this.btnStartMatch.classList.add('open');

      this.charBtnsPlayer.forEach((btn) => btn.setAttribute('disabled', true));
    });

    network.on('character-hover', (charKey) => {
      if (this.registry.isMultiplayerHost) {
        const hoveredCharacter = document.querySelector(`[data-character-computer="${charKey}"]`);
        hoveredCharacter.classList.add('remote-hover');
      }
      else {
        const hoveredCharacter = document.querySelector(`[data-character-player="${charKey}"]`);
        hoveredCharacter.classList.add('remote-hover');
      }
    });

    network.on('character-blur', (charKey) => {
      if (this.registry.isMultiplayerHost) {
        const hoveredCharacter = document.querySelector(`[data-character-computer="${charKey}"]`);
        hoveredCharacter.classList.remove('remote-hover');
      }
      else {
        const hoveredCharacter = document.querySelector(`[data-character-player="${charKey}"]`);
        hoveredCharacter.classList.remove('remote-hover');
      }
    });

    network.on('character-select', (charKey) => {
      if (this.registry.isMultiplayerHost) {
        const computerCharacters = document.querySelectorAll('[data-character-computer]');
        const selectedCharacter = document.querySelector(`[data-character-computer="${charKey}"]`);

        computerCharacters.forEach((btn) => {
          btn.classList.remove('selected');
        });
        selectedCharacter.classList.add('selected');

        const {voiceKey} = this.charData[charKey];

        this.profileComputer.setAttribute('src', `/assets/ui-dom/profiles/${charKey}.png`);

        this.computerInfo.querySelector('header').innerHTML = charKey;

        this.p2Key = charKey;

        this.sound.play(voiceKey);
      }
      else {
        const playerCharacters = document.querySelectorAll('[data-character-player]');
        const selectedCharacter = document.querySelector(`[data-character-player="${charKey}"]`);

        playerCharacters.forEach((btn) => {
          btn.classList.remove('selected');
        });
        selectedCharacter.classList.add('selected');

        const {voiceKey} = this.charData[charKey];

        this.profilePlayer.setAttribute('src', `/assets/ui-dom/profiles/${charKey}.png`);

        this.playerInfo.querySelector('header').innerHTML = charKey;

        this.p1Key = charKey;

        this.sound.play(voiceKey);
      }
    });

    network.on('player-ready', () => {
      if (this.registry.isMultiplayerHost) {
        document.querySelector('.characters.computer').classList.add('ready');
      }
      else {
        document.querySelector('.characters.player').classList.add('ready');
      }

      this.mpOpponentReadyForMatch = true;

      if (this.mpReadyForMatch) {
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
      }
    });
  }
}

export default MenuScene;