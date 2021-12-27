import Phaser from 'phaser';
import config from './config';
import Preloader from './scenes/Preloader';
import Game from './scenes/Game';
import GameOver from './scenes/GameOver';

new Phaser.Game(
  Object.assign(config, {
    scene: [Preloader, Game, GameOver]
  })
);
