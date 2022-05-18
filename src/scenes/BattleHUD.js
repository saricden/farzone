import { Scene, Display } from "phaser";

class BattleHUD extends Scene {
  constructor() {
    super('ui-battlehud');
  }

  init({ parentScene, p1Key, p2Key }) {
    this.parentScene = parentScene;
    this.p1Key = p1Key;
    this.p2Key = p2Key;
  }

  create() {
    this.uiLocked = false;

    if (this.p1Key === 'roboto') {
      this.playerIcon = this.add.image(20, window.innerHeight - 20, 'ui-mech1');
    }
    else if (this.p1Key === 'arial') {
      this.playerIcon = this.add.image(20, window.innerHeight - 20, 'ui-hume1');
    }
    else if (this.p1Key === 'oswald') {
      this.playerIcon = this.add.image(20, window.innerHeight - 20, 'ui-oswald');
    }
    else if (this.p1Key === 'montserrat') {
      this.playerIcon = this.add.image(20, window.innerHeight - 20, 'ui-montserrat');
    }
    this.playerIcon.setScale(0.1);
    this.playerIcon.setOrigin(0, 1);
    
    if (this.p2Key === 'roboto') {
      this.enemyIcon = this.add.image(window.innerWidth - 20, window.innerHeight - 20, 'ui-mech1');
    }
    else if (this.p2Key === 'arial') {
      this.enemyIcon = this.add.image(window.innerWidth - 20, window.innerHeight - 20, 'ui-hume1');
    }
    else if (this.p2Key === 'oswald') {
      this.enemyIcon = this.add.image(window.innerWidth - 20, window.innerHeight - 20, 'ui-oswald');
    }
    else if (this.p2Key === 'montserrat') {
      this.enemyIcon = this.add.image(window.innerWidth - 20, window.innerHeight - 20, 'ui-montserrat');
    }
    this.enemyIcon.setScale(0.1);
    this.enemyIcon.setOrigin(1, 1);
    this.enemyIcon.setFlipX(true);
    // this.enemyIcon.setTint(0xFF0000);

    // const hueRotatePipeline = this.renderer.pipelines.get('HueRotate');
    // this.enemyIcon.setPipeline(hueRotatePipeline);
    // hueRotatePipeline.time = 180.25;

    this.bgGfx = this.add.graphics();
    this.bgGfx.fillStyle(0xFFFFFF, 0.1);
    
    this.bgGfx.fillRect(0, window.innerHeight - 20 - this.playerIcon.displayHeight - 20, 500, 20 + this.playerIcon.displayHeight + 20);

    this.bgGfx.fillRect(window.innerWidth - 500, window.innerHeight - 20 - this.enemyIcon.displayHeight - 20, 500, 20 + this.enemyIcon.displayHeight + 20);

    this.playerHPGfx = this.add.graphics();
    this.enemyHPGfx = this.add.graphics();

    this.playerHPText = this.add.text(20 + this.playerIcon.displayWidth + 20, window.innerHeight - 20, '', {
      fontFamily: 'monospace',
      fontSize: 28,
      color: '#FFF',
      align: 'left',
      stroke: '#000',
      strokeThickness: 2
    });
    this.playerHPText.setOrigin(0, 1);

    this.enemyHPText = this.add.text(window.innerWidth - 20 - this.enemyIcon.displayWidth - 20, window.innerHeight - 20, '', {
      fontFamily: 'monospace',
      fontSize: 28,
      color: '#FFF',
      align: 'right',
      stroke: '#000',
      strokeThickness: 2
    });
    this.enemyHPText.setOrigin(1, 1);

    this.playerSpecialIcon = this.add.image(500 - 20, window.innerHeight - 20, 'ui-mech1-shell');
    this.playerSpecialIcon.setOrigin(1, 1);
    this.playerSpecialIcon.setScale(0.15);

    this.playerSpecialIcon2 = this.add.image(500 - 20 - this.playerSpecialIcon.displayWidth - 20, window.innerHeight - 20, 'ui-mech1-shell');
    this.playerSpecialIcon2.setOrigin(1, 1);
    this.playerSpecialIcon2.setScale(0.15);

    if (this.p1Key !== 'roboto') {
      this.playerSpecialIcon.setVisible(false);
      this.playerSpecialIcon2.setVisible(false);
    }

    this.enemySpecialIcon = this.add.image(window.innerWidth - 500 + 20, window.innerHeight - 20, 'ui-mech1-shell');
    this.enemySpecialIcon.setOrigin(0, 1);
    this.enemySpecialIcon.setScale(0.15);

    this.enemySpecialIcon2 = this.add.image(window.innerWidth - 500  + 20 + this.enemySpecialIcon.displayWidth + 20, window.innerHeight - 20, 'ui-mech1-shell');
    this.enemySpecialIcon2.setOrigin(0, 1);
    this.enemySpecialIcon2.setScale(0.15);

    if (this.p2Key !== 'roboto') {
      this.enemySpecialIcon.setVisible(false);
      this.enemySpecialIcon2.setVisible(false);
    }

    this.gameOverText = this.add.text(window.innerWidth / 2, window.innerHeight / 2 + 100, '', {
      fontFamily: 'monospace',
      fontSize: 82,
      color: '#FFF',
      stroke: '#000',
      strokeThickness: 10
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setAlpha(0);

    this.fadeGfx = this.add.graphics();
    this.fadeGfx.fillStyle(0xFFFFFF, 1);
    this.fadeGfx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    this.fadeGfx.setAlpha(1);

    // Layering
    this.fadeGfx.setDepth(10);
    this.playerIcon.setDepth(1);
    this.enemyIcon.setDepth(1);
    this.bgGfx.setDepth(0);

    // Fade in to start
    this.tweens.add({
      targets: this.fadeGfx,
      duration: 500,
      repeat: 0,
      alpha: 0
    });

    // Setup window resizing event
    this.scale.on('resize', this.resize, this);
    this.resize({width: window.innerWidth, height: window.innerHeight});
  }

  resize({width, height}) {
    this.playerIcon.setPosition(20, height - 20);
    this.enemyIcon.setPosition(width - 20, height - 20);
    this.playerHPText.setPosition(20 + this.playerIcon.displayWidth + 20, height - 20);
    this.enemyHPText.setPosition(width - 20 - this.enemyIcon.displayWidth - 20, height - 20);
    this.playerSpecialIcon.setPosition(500 - 20, height - 20);
    this.playerSpecialIcon2.setPosition(500 - 20 - this.playerSpecialIcon.displayWidth - 20, height - 20);
    this.enemySpecialIcon.setPosition(width - 500 + 20, height - 20);
    this.enemySpecialIcon2.setPosition(width - 500  + 20 + this.enemySpecialIcon.displayWidth + 20, height - 20);

    this.bgGfx.clear();
    this.bgGfx.fillStyle(0xFFFFFF, 0.1);
    this.bgGfx.fillRect(0, height - 20 - this.playerIcon.displayHeight - 20, 500, 20 + this.playerIcon.displayHeight + 20);
    this.bgGfx.fillRect(width - 500, height - 20 - this.enemyIcon.displayHeight - 20, 500, 20 + this.enemyIcon.displayHeight + 20);

    this.fadeGfx.clear();
    this.fadeGfx.fillStyle(0xFFFFFF, 1);
    this.fadeGfx.fillRect(0, 0, width, height);
  }

  doGameOver(playerWon) {
    this.uiLocked = true;
    const totalTime = Date.now() -  this.parentScene.startTime;
    const {tilesDestroyed} = this.parentScene;
    const {playerTotalAttacks, playerAttacksHit, playerDamageInflicted, playerDamageTaken, playerDistanceMoved} = this.registry;

    this.time.addEvent({
      delay: 5000,
      repeat: 0,
      callback: () => {
        this.tweens.add({
          targets: this.fadeGfx,
          duration: 5000,
          alpha: 1,
          onComplete: () => {
            this.scene.stop(this.parentScene);
            this.scene.start('scene-gameover', {
              playerWon,
              totalTime,
              tilesDestroyed,
              accuracyRating: (playerAttacksHit / playerTotalAttacks),
              damageInflicted: playerDamageInflicted,
              damageTaken: playerDamageTaken,
              metersMoved: (playerDistanceMoved / 250)
            });
          }
        });
      }
    });
  }

  update() {
    const {playerHP, playerMaxHP, playerRockets, enemyHP, enemyMaxHP, enemyRockets} = this.registry;

    if (!this.uiLocked) {
      if (playerHP === 0) {
        this.doGameOver(false);
      }
      else if (enemyHP === 0) {
        this.doGameOver(true);
      }
      else {
        const playerRatio = playerHP / playerMaxHP;
        const enemyRatio = enemyHP / enemyMaxHP;
        const playerColor = Display.Color.GetColor(255 * (1 - playerRatio), 255 * playerRatio, 0);
        const enemyColor = Display.Color.GetColor(255 * (1 - enemyRatio), 255 * enemyRatio, 0);
  
        this.playerHPText.setText(`${playerHP} / ${playerMaxHP}`);
  
        this.playerHPGfx.clear();
        this.playerHPGfx.fillStyle(playerColor);
        this.playerHPGfx.lineStyle(2, playerColor);
  
        this.playerHPGfx.fillRect(20 + this.playerIcon.displayWidth + 20, window.innerHeight - 20 - this.playerIcon.displayHeight, (500  - 20 - this.playerIcon.displayWidth - 20 - 20) * playerRatio, 20);
        this.playerHPGfx.strokeRect(20 + this.playerIcon.displayWidth + 20, window.innerHeight - 20 - this.playerIcon.displayHeight, 500 - 20 - this.playerIcon.displayWidth - 20 - 20, 20);
  
        this.enemyHPText.setText(`${enemyHP} / ${enemyMaxHP}`);
  
        this.enemyHPGfx.clear();
        this.enemyHPGfx.fillStyle(enemyColor);
        this.enemyHPGfx.lineStyle(2, enemyColor);
  
        this.enemyHPGfx.fillRect(window.innerWidth - 20 - this.enemyIcon.displayWidth - 20 - (500  - 20 - this.enemyIcon.displayWidth - 20 - 20) * enemyRatio, window.innerHeight - 20 - this.enemyIcon.displayHeight, (500  - 20 - this.enemyIcon.displayWidth - 20 - 20) * enemyRatio, 20);
        this.enemyHPGfx.strokeRect(window.innerWidth - 20 - this.enemyIcon.displayWidth - 20 - (500  - 20 - this.enemyIcon.displayWidth - 20 - 20), window.innerHeight - 20 - this.enemyIcon.displayHeight, 500 - 20 - this.enemyIcon.displayWidth - 20 - 20, 20);
  
        this.playerSpecialIcon.setAlpha(playerRockets >= 1 ? 1 : 0.25);
        this.playerSpecialIcon2.setAlpha(playerRockets >= 2 ? 1 : 0.25);
  
        this.enemySpecialIcon.setAlpha(enemyRockets >= 1 ? 1 : 0.25);
        this.enemySpecialIcon2.setAlpha(enemyRockets >= 2 ? 1 : 0.25);
      }
    }
    else {
      this.bgGfx.clear();
      this.playerHPGfx.clear();
      this.enemyHPGfx.clear();
      this.playerHPText.setText('');
      this.enemyHPText.setText('');
      this.playerSpecialIcon.setVisible(false);
      this.playerSpecialIcon2.setVisible(false);
      this.enemySpecialIcon.setVisible(false);
      this.enemySpecialIcon2.setVisible(false);
      this.playerIcon.setVisible(false);
      this.enemyIcon.setVisible(false);
    }
  }
}

export default BattleHUD;