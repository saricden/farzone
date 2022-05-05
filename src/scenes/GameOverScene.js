import { Scene, Display } from "phaser";
import moment from "moment";

class GameOverScene extends Scene {
  constructor() {
    super('scene-gameover');
  }

  init({ playerWon, totalTime, tilesDestroyed, accuracyRating, damageInflicted, damageTaken, metersMoved }) {
    this.playerWon = playerWon;
    this.totalTime = totalTime;
    this.tilesDestroyed = tilesDestroyed;
    this.accuracyRating = accuracyRating;
    this.damageInflicted = damageInflicted;
    this.damageTaken = damageTaken;
    this.metersMoved = metersMoved;
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

    this.ui = this.add.dom(0, 0, 'div', 'width: 100%;').createFromCache('dom-game-over');
    this.ui.setOrigin(0, 0);

    this.bgParticles = this.add.particles('particle-generic').createEmitter({
      lifespan: 1500,
      quantity: 4,
      alpha: {
        min: 0.1,
        max: 1
      },
      scale: {
        start: 1,
        end: 0
      },
      x: {
        min: 0,
        max: window.innerWidth
      },
      y: window.innerHeight + 50,
      speedY: {
        min: -400,
        max: -100
      },
      speedX: {
        min: 100,
        max: 200
      },
      tint: (particle, key, time) => {
        const gb = ((1 - time) / 1 * 255);
        return Display.Color.GetColor(255, gb, 0);
      }
    });

    document.getElementById('total-time').innerHTML = moment(this.totalTime).format("mm:ss");
    document.getElementById('total-destruction').innerHTML = this.tilesDestroyed;

    const loserProfile = document.getElementById('loser-profile');
    const winnerProfile = document.getElementById('winner-profile');
    const gameOverScreen = document.getElementById('game-over');
    const blurFilter = document.getElementById('blur-filter');
    const winnerName = document.getElementById('winner-name');
    const gameStats = document.getElementById('game-stats');
    const btnNextMatch = document.getElementById('btn-next-match');
    const statAccuracy = document.getElementById('accuracy-rating');
    const statDamageInflicted = document.getElementById('damage-inflicted');
    const statDamageTaken = document.getElementById('damage-taken');
    const statDistanceMoved = document.getElementById('distance-moved');

    // Set image sources & winner name
    const {p1Key, p2Key} = this.registry;
    if (this.playerWon) {
      loserProfile.setAttribute('src', `/assets/ui-dom/profiles/${p2Key}.png`);
      loserProfile.classList.add('npc');

      winnerProfile.setAttribute('src', `/assets/ui-dom/profiles/${p1Key}.png`);

      winnerName.innerHTML = p1Key;
    }
    else {
      loserProfile.setAttribute('src', `/assets/ui-dom/profiles/${p1Key}.png`);

      winnerProfile.setAttribute('src', `/assets/ui-dom/profiles/${p2Key}.png`);
      winnerProfile.classList.add('npc');

      winnerName.innerHTML = p2Key;
    }

    // Apply stats
    statAccuracy.innerHTML = `${(this.accuracyRating * 100).toFixed(2)}%`;
    statDamageInflicted.innerHTML = this.damageInflicted;
    statDamageTaken.innerHTML = this.damageTaken;
    statDistanceMoved.innerHTML = `${this.metersMoved.toFixed(2)}m`;

    // Start slow peek animation
    blurFilter.classList.add('peek');

    // Start the build
    this.sound.play('ost-gameover-build', { volume: 0.5 });

    // Bind button events
    btnNextMatch.addEventListener('mouseenter', () => {
      this.sound.play('sfx-click');
    });

    btnNextMatch.addEventListener('click', () => {
      this.sound.play('sfx-electro-click2');

      this.scene.start('scene-menu', {
        skipTo: 'level-select'
      });
    });

    // Play Mitch's "This game's winner is..."
    this.sound.add('mitch-this-games-winner-is').once('complete', () => {
      // Quick zoom and reveal
      gameOverScreen.classList.add('show');
      blurFilter.classList.add('off');

      if (this.playerWon) {
        this.sound.play(charData[p1Key].voiceKey);
      }
      else {
        this.sound.play(charData[p2Key].voiceKey);
      }
      this.sound.play('ost-gameover-fanfare', { volume: 0.5 });

      this.time.addEvent({
        delay: 2000,
        repeat: 0,
        callback: () => {
          loserProfile.classList.add('panned');
          winnerProfile.classList.add('panned');
          gameStats.classList.add('on');
        }
      });
    }).play();

  }
}

export default GameOverScene;