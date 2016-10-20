"use strict";

const MS_PER_FRAME = 1000/8;

const Asteroid = require('./asteroid.js');
const Bullet = require('./bullet.js');

/**
 * @module exports the Player class
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a new player object
 * @param {Postition} position object specifying an x and y
 */
function Player(position, canvas, objs) {
  this.objs = objs;
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;
  this.state = "idle";
  this.position = {
    x: position.x,
    y: position.y
  }
  this.velocity = {
    x: 0,
    y: 0
  }
  this.angle = 0;
  this.radius  = 10;
  this.thrusting = false;
  this.steerLeft = false;
  this.steerRight = false;
  var pew = new Audio('sounds/pew.mp3');

  var self = this;
  window.onkeydown = function(event) {
    //console.log(event);
    switch(event.key) {
      case 'ArrowUp': // up
      case 'w':
        self.thrusting = true;
        break;
      case 'ArrowLeft': // left
      case 'a':
        self.steerLeft = true;
        break;
      case 'ArrowRight': // right
      case 'd':
        self.steerRight = true;
        break;
      case ' ':
        var speed = 0.3;
        var angle = -(self.angle + Math.PI/2);
        var vx = speed * Math.cos(angle);
        var vy = speed * Math.sin(angle);
        self.objs.add(new Bullet([self.position.x, self.position.y], [vx, vy]))
        new Audio('sounds/pew.mp3').play();
        break;
    }
  }

  window.onkeyup = function(event) {
    switch(event.key) {
      case 'ArrowUp': // up
      case 'w':
        self.thrusting = false;
        break;
      case 'ArrowLeft': // left
      case 'a':
        self.steerLeft = false;
        break;
      case 'ArrowRight': // right
      case 'd':
        self.steerRight = false;
        break;
    }
  }
}

Player.prototype.getPos = function() {
  return [this.position.x, this.position.y];
}

function drawStroked(ctx, text, x, y) {
    ctx.font = "48px impact"
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 8;
    ctx.strokeText(text, x, y);
    ctx.font = "48px impact"
    ctx.fillStyle = 'white';
    ctx.fillText(text, x, y);
}

Player.prototype.handle = function (obj) {
  if(obj instanceof Asteroid) {
    new Audio('sounds/kaboom2.mp3').play()
    lives -= 1;
    this.position.x = Math.random()*(obj.screenW - 50) + 50
    this.position.y = Math.random()*(obj.screenH - 50) + 50;
    if(lives == 0) {
      drawStroked(this.ctx, "no me gusta", 270, 270);
      asdf.asdfasdf().asdf[3]; //crash the game because I'm a terrible person
    }
    //console.log("you defeated");
  }
}

/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Player.prototype.update = function(time) {
  // Apply angular velocity
  if(this.steerLeft) {
    this.angle += time * 0.005;
  }
  if(this.steerRight) {
    this.angle -= 0.1;
  }
  // Apply acceleration
  var thrust = 0.1;
  if(this.thrusting) {
    var acceleration = {
      x: Math.sin(this.angle) * thrust,
      y: Math.cos(this.angle) * thrust
    }
    this.velocity.x -= acceleration.x;
    this.velocity.y -= acceleration.y;
  }
  // Apply velocity
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  // Wrap around the screen
  if(this.position.x < 0) this.position.x += this.worldWidth;
  if(this.position.x > this.worldWidth) this.position.x -= this.worldWidth;
  if(this.position.y < 0) this.position.y += this.worldHeight;
  if(this.position.y > this.worldHeight) this.position.y -= this.worldHeight;
}

/**
 * @function renders the player into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Player.prototype.render = function(time, ctx) {
  this.ctx = ctx;
  ctx.save();

  // Draw player's ship
  ctx.translate(this.position.x, this.position.y);
  ctx.rotate(-this.angle);
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(-10, 10);
  ctx.lineTo(0, 0);
  ctx.lineTo(10, 10);
  ctx.closePath();
  ctx.strokeStyle = 'white';
  ctx.stroke();

  // Draw engine thrust
  if(this.thrusting) {
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(5, 10);
    ctx.arc(0, 10, 5, 0, Math.PI, true);
    ctx.closePath();
    ctx.strokeStyle = 'orange';
    ctx.stroke();
  }
  ctx.restore();
}
