
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
