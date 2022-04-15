import {Scene, Math as pMath} from 'phaser';
import Mech1 from '../sprites/Mech1';

class GameScene extends Scene {
  constructor() {
    super("scene-game");
  }

  create() {
    this.tilemap = this.add.tilemap('map-level1');
    const tiles = this.tilemap.addTilesetImage('tileset-grassland', 'tileset-grassland-ex', 175, 175, 1, 2);

    this.ground = this.tilemap.createLayer('ground', tiles);

    // Add, scale, and make up a speed for our creature
    this.cat = new Mech1(this, 0, 0);
    this.catSpeed = 500;

    this.dummy = null;

    const spawnPoints = this.tilemap.getObjectLayer('spawn').objects;

    spawnPoints.forEach(({x, y, name}) => {
      if (name === 'mech') {
        this.cat.setPosition(x, y);
      }
      else if (name === 'dummy') {
        this.dummy = this.physics.add.image(x, y, 'mech1-head');
      }
    });

    this.ground.setCollisionByProperty({ collides: true });
    this.physics.add.collider(this.cat, this.ground);
    this.physics.add.collider(this.dummy, this.ground);
    this.physics.add.collider(this.dummy, this.cat);

    this.cameras.main.setBackgroundColor(0x225566);
    // this.cameras.main.startFollow(this.cat);
    this.cameras.main.setZoom(0.75);
    // this.cameras.main.setZoom(2);
  }

  update(time, delta) {
    this.cat.update(time, delta);

    // Pan to the midpoint between players
    const midX = (this.cat.x + this.dummy.x) / 2;
    const midY = (this.cat.y + this.dummy.y) / 2;
    this.cameras.main.pan(midX, midY, 250, 'Linear', true);
    
    // Zoom to fit both players in frame
    const dist = pMath.Distance.Between(this.cat.x, this.cat.y, this.dummy.x, this.dummy.y);
    const minZoom = (window.innerWidth / this.tilemap.widthInPixels);
    // const scale = Math.min(Math.max(((this.tilemap.widthInPixels - dist) / this.tilemap.widthInPixels), minZoom), 1);
    const scale = Math.min(Math.max(window.innerWidth / (dist * 1.35), minZoom), 1);
    this.cameras.main.zoomTo(scale, 250, 'Linear', true);
    console.log(minZoom, this.cameras.main.zoom);
  }

}
export default GameScene;