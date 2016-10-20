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
