
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
