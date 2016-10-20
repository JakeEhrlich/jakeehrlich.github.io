"use strict;"

/* Classes */
const Game = require('./game.js');
const Player = require('./player.js');
const Bullet = require('./bullet.js');
const Asteroid = require('./asteroid.js');
const Collisions = require('./collisions.js');

/* Global variables */
objs = new Collisions();
canvas = document.getElementById('screen');
game = new Game(canvas, update, render);
player = new Player({x: canvas.width/2, y: canvas.height/2}, canvas, objs);
numAster = 10;
lives = 3;
score = 0;
objs.add(player);
for(var i = 0; i < numAster; ++i) {
  objs.add(new Asteroid(40, canvas.width, canvas.height, 100));
}
background = new Image();
background.src = 'images/nyancat.jpg';

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());


/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {
  //player.update(elapsedTime);
  //asteroid.update(elapsedTime);
  var keep = [];
  objs.objs.forEach(function(obj) {
    obj.update(elapsedTime);
    if(!(obj instanceof Bullet && obj.timer > 3000)) {
      keep.push(obj);
    }
  });
  objs.objs = keep;
  objs.check();

  if(objs.objs.every(function(o) {return !(o instanceof Asteroid)})) {
    numAster += 2;
    score *= 2;
    for(var i = 0; i < numAster; ++i) {
      objs.add(new Asteroid(40, canvas.width, canvas.height, 100));
    }
  }
}


function drawStroked(ctx, text, x, y) {
    ctx.save();
    ctx.font = "48px impact"
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 8;
    ctx.strokeText(text, x, y);
    ctx.font = "48px impact"
    ctx.fillStyle = 'white';
    ctx.fillText(text, x, y);
    ctx.restore();
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  //player.render(elapsedTime, ctx);
  //asteroid.render(elapsedTime, ctx);
  objs.objs.forEach(function(obj) {obj.render(elapsedTime, ctx)});
  drawStroked(ctx, "score: " + score, 20, 50);
  drawStroked(ctx, "lives: " + lives, 600, 50);
}
