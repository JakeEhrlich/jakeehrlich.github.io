(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./asteroid.js":2,"./bullet.js":3,"./collisions.js":4,"./game.js":5,"./player.js":7}],2:[function(require,module,exports){
"use strict";

const Physics = require('./physics.js');

/**
 * @module exports the abstract asteroid class
 */
module.exports = exports = Asteroid;

function rand(min, max) {
  return (max - min)*Math.random() + min;
}

function Asteroid(radius, screenW, screenH, margin) {
  var dir = rand(0, 2*Math.PI);
  var speed = rand(0.05, 0.15);
  var vx = speed * Math.cos(dir);
  var vy = speed * Math.sin(dir);
  //console.log(vx, vy);
  var mass = rand(1, 3);
  //console.log(screenW, screenH);
  this.screenW = screenW + margin;
  this.screenH = screenH + margin;
  this.margin = margin;
  Physics.call(this, [rand(0, screenW), rand(0, screenH)], mass, [vx, vy], 0.5*radius*radius, dir, rand(0.001,0.01), radius);
  //console.log(this.pos);
  this.img = new Image();
  this.img.src = 'images/me-gusta.png';
}

Asteroid.prototype = Object.create(Physics.prototype, {
  handle : {value:function(obj) {
    new Audio('sounds/megusta2.mp3').play();
    Physics.prototype.handle.call(this, obj);
  }, enumerable:false, configurable:false, writable:false},
 update : {value:function(time) {
   Physics.prototype.update.call(this, time);
   while(this.pos[0] > this.screenW + this.margin) this.pos[0] -= this.screenW + this.margin;
   while(this.pos[0] < -this.margin) this.pos[0] += this.screenW + this.margin;
   while(this.pos[1] > this.screenH + this.margin) this.pos[1] -= this.screenH + this.margin;
   while(this.pos[1] < -this.margin) this.pos[1] += this.screenH + this.margin;
 }, enumerable:false, configurable:false, writable:false},
 render : {value:function(time, ctx) {
   ctx.save();
   var rad = this.radius;
   //ctx.scale(this.radius/600, this.radius/600);
   ctx.translate(this.pos[0], this.pos[1]);
   ctx.rotate(this.rot);
   ctx.drawImage(this.img, -rad, -rad, 2*this.radius, 2*this.radius);
   //ctx.beginPath();
   //ctx.arc(0,0,50,0,2*Math.PI);
   //ctx.stroke();
   ctx.restore();
 }, enumerable:false, configurable:false, writable:false}
});

Asteroid.prototype.constructor = Asteroid;

},{"./physics.js":6}],3:[function(require,module,exports){

"use strict";

const Asteroid = require('./asteroid.js');

/**
 * @module exports the physics class
 */
module.exports = exports = Bullet;

function addv(v1, v2) {
  var out = [];
  for(var i = 0; i < Math.min(v1.length, v2.length); ++i) {
    out.push(v1[i] + v2[i]);
  }
  return out;
}

function smul(s, v) {
  var out = [];
  for(var i = 0; i < v.length; ++i) {
    out.push(s*v[i]);
  }
  return out;
}

function Bullet(pos, vol, objs) {
  this.timer = 0;
  this.objs = objs;
  this.pos = pos;
  this.vol = vol;
  this.radius = 1;
}

Bullet.prototype.getPos = function() {
  return this.pos;
}

Bullet.prototype.update = function (time) {
  this.timer += time;
  this.pos = addv(this.pos, smul(time, this.vol))
}

Bullet.prototype.handle = function(obj) {
  var add = [];
  var remove = [];
  if(obj instanceof Asteroid) {
    score = score + 1;
    remove = [obj, this];
    if(obj.radius > 18) {
      var a1 = new Asteroid(obj.radius / 1.5, canvas.width, canvas.height, 100);
      var a2 = new Asteroid(obj.radius / 1.5, canvas.width, canvas.height, 100);
      a1.mass = obj.mass / 4;
      a2.mass = obj.mass / 4;
      console.log(a1, a2);
      a1.pos = [obj.pos[0], obj.pos[1]];
      a2.pos = [obj.pos[0], obj.pos[1]];
      a1.vol = [-a2.vol[0], -a2.vol[1]];
      add = [a1, a2];
    }
    return {remove: remove, add:add };
  }
}

Bullet.prototype.render = function (time, ctx) {
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(this.pos[0],this.pos[1],5,5);
}

},{"./asteroid.js":2}],4:[function(require,module,exports){

"use strict";

/**
 * @module exports the collisions class
 */
module.exports = exports = Collisions;

function subv(v1, v2) {
  var out = [];
  for(var i = 0; i < Math.min(v1.length, v2.length); ++i) {
    out.push(v1[i] - v2[i]);
  }
  return out;
}

function mag(v) {
  var out = 0;
  for(var i = 0; i < v.length; ++i) {
    out += v[i]*v[i];
  }
  return Math.sqrt(out);
}

function Collisions() {
  this.objs = [];
}

Collisions.prototype.add = function(obj) {
  this.objs.push(obj);
}

function dist(o1, o2) {
  return mag(subv(o1.getPos(), o2.getPos()));
}

Collisions.prototype.check = function() {
  var self = this;
  var adds = [];
  var removes = [];
  this.objs.forEach(function(o1) {
    self.objs.forEach(function(o2) {
      if(o1 === o2) return;
      //console.log(dist(o1, o2), o1.radius + o2.radius);
      if(dist(o1, o2) < o1.radius + o2.radius) {
        //console.log("hit!");
        var res = o1.handle(o2); //have o1 hit o2
        if(res) {
           adds = adds.concat(res.add);
           removes = removes.concat(res.remove);
        }
      }
    });
  });
  this.objs = this.objs.filter(function(o){
    if(removes.indexOf(o) != -1) console.log(o);
    return removes.indexOf(o) == -1;
  });
  adds.forEach(function(o){self.objs.push(o)});
}

},{}],5:[function(require,module,exports){
"use strict";

/**
 * @module exports the Game class
 */
module.exports = exports = Game;

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function(flag) {
  this.paused = (flag == true);
}

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function(newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;

  if(!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}

},{}],6:[function(require,module,exports){

"use strict";

/**
 * @module exports the physics class
 */
module.exports = exports = Physics;

function addv(v1, v2) {
  var out = [];
  for(var i = 0; i < Math.min(v1.length, v2.length); ++i) {
    out.push(v1[i] + v2[i]);
  }
  return out;
}

function subv(v1, v2) {
  var out = [];
  for(var i = 0; i < Math.min(v1.length, v2.length); ++i) {
    out.push(v1[i] - v2[i]);
  }
  return out;
}

function smul(s, v) {
  var out = [];
  for(var i = 0; i < v.length; ++i) {
    out.push(s*v[i]);
  }
  return out;
}

function sadd(v, s) {
  var out = [];
  for(var i = 0; i < v.length; ++i) {
    out.push(s + v[i]);
  }
  return out;
}

function mag(v) {
  var out = 0;
  for(var i = 0; i < v.length; ++i) {
    out += v[i]*v[i];
  }
  return Math.sqrt(out);
}

function normalize(v) {
  return smul(1/mag(v), v);
}

function dot(v1, v2) {
  var out = 0;
  for(var i = 0; i < Math.min(v1.length, v2.length); ++i) {
    out += v1[i] * v2[i];
  }
  return out;
}

function Physics(pos, mass, vol, moi, rot, rotv, radius) {
  this.pos = pos;
  this.vol = vol;
  this.rot = rot;
  this.rotv = rotv;
  this.mass = mass;
  this.moi = moi;
  this.radius = radius;
}

Physics.prototype.update = function(time) {
  this.pos = addv(this.pos, smul(time, this.vol));
  this.rot += this.rotv * time;
}

Physics.prototype.getPos = function() {
  return this.pos;
}

Physics.prototype.setPos = function(newpos) {
  this.pos = newpos;
}

function physhandle(x1, x2, m1, m2, v1, v2) {
  var a1 = 2*m2/(m1 + m2)
  var a2 = 2*m1/(m1 + m2)
  var diff1 = subv(x1, x2);
  var diff2 = subv(x2, x1)
  var dst = mag(diff1);
  var mag2 = dst*dst;
  var theta1 = dot(subv(v1, v2), diff1);
  var theta2 = dot(subv(v2, v1), diff2);
  var v1f = smul(1, subv(v1, smul(theta1/mag2, diff1)));
  var v2f = smul(1, subv(v2, smul(theta2/mag2, diff2)));
  return [v1f, v2f];
}

function rothandle(m1, m2, moi1, moi2, rotv1, rov2) {

}

Physics.prototype.handle = function(obj) {
  if(!(obj instanceof Physics)) return;
  var res = physhandle(obj.pos, this.pos, obj.mass, this.mass, obj.vol, this.vol);
  obj.vol = res[0];
  this.vol = res[1];
  //res = physhandle(obj.moi, this.moi, [obj.rotv - this.rotv]);
  var lap = this.radius + obj.radius - mag(subv(obj.pos, this.pos));
  var diff = smul(0.5*lap + 0.01, normalize(subv(this.pos, obj.pos)));
  obj.pos = subv(obj.pos, diff); //push obj away from this
  this.pos = addv(this.pos, diff); //push this away from obj
}

},{}],7:[function(require,module,exports){
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

},{"./asteroid.js":2,"./bullet.js":3}]},{},[1]);
