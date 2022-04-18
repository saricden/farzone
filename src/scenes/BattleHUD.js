import { Scene } from "phaser";

class BattleHUD extends Scene {
  constructor() {
    super('ui-battlehud');
  }

  create() {
    this.playerIcon = this.add.image(20, window.innerHeight - 20, 'ui-mech1');
    this.playerIcon.setScale(0.15);
    this.playerIcon.setOrigin(0, 1);
    
    this.enemyIcon = this.add.image(window.innerWidth - 20, window.innerHeight - 20, 'ui-mech1');
    this.enemyIcon.setScale(0.15);
    this.enemyIcon.setOrigin(1, 1);
    this.enemyIcon.setFlipX(true);

    this.bgGfx = this.add.graphics();
    this.bgGfx.fillStyle(0xFFFFFF, 0.1);
    
    this.bgGfx.fillRect(0, window.innerHeight - 20 - this.playerIcon.displayHeight - 20, 500, 20 + this.playerIcon.displayHeight + 20);

    this.bgGfx.fillRect(window.innerWidth - 500, window.innerHeight - 20 - this.enemyIcon.displayHeight - 20, 500, 20 + this.enemyIcon.displayHeight + 20);

    this.playerIcon.setDepth(1);
    this.enemyIcon.setDepth(1);
    this.bgGfx.setDepth(0);
  }
}

export default BattleHUD;