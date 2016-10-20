
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
