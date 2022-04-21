import { Scene, Display } from "phaser";

class BattleHUD extends Scene {
  constructor() {
    super('ui-battlehud');
  }

  create() {
    this.playerIcon = this.add.image(20, window.innerHeight - 20, 'ui-mech1');
    this.playerIcon.setScale(0.1);
    this.playerIcon.setOrigin(0, 1);
    
    this.enemyIcon = this.add.image(window.innerWidth - 20, window.innerHeight - 20, 'ui-mech1');
    this.enemyIcon.setScale(0.1);
    this.enemyIcon.setOrigin(1, 1);
    this.enemyIcon.setFlipX(true);
    this.enemyIcon.setTint(0xFF0000);

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

    this.enemySpecialIcon = this.add.image(window.innerWidth - 500 + 20, window.innerHeight - 20, 'ui-mech1-shell');
    this.enemySpecialIcon.setOrigin(0, 1);
    this.enemySpecialIcon.setScale(0.15);

    this.enemySpecialIcon2 = this.add.image(window.innerWidth - 500  + 20 + this.enemySpecialIcon.displayWidth + 20, window.innerHeight - 20, 'ui-mech1-shell');
    this.enemySpecialIcon2.setOrigin(0, 1);
    this.enemySpecialIcon2.setScale(0.15);

    // Layering
    this.playerIcon.setDepth(1);
    this.enemyIcon.setDepth(1);
    this.bgGfx.setDepth(0);
  }

  update() {
    const {playerHP, playerMaxHP, playerRockets, enemyHP, enemyMaxHP, enemyRockets} = this.registry;
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

export default BattleHUD;