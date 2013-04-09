/// UTIL

// linear map
var lmap = function(v, in_min, in_max, out_min, out_max) {
  return out_min + (out_max-out_min) * ((v - in_min) / (in_max - in_min));
}

// linear interpolation
var lerp = function(start, end, amt) {
  return start + (end - start) * amt;
}

// rotation
var rotateX = function(p, angle) {
  var sina = Math.sin(angle);
  var cosa = Math.cos(angle);
  var ry = p.y * cosa - p.z * sina;
  var rz = p.y * sina + p.z * cosa;
  p.y = ry;
  p.z = rz;
  return p;
};

var rotateY = function(p, angle) {
  var sina = Math.sin(angle);
  var cosa = Math.cos(angle);
  var rx = p.x * cosa - p.z * sina;
  var rz = p.x * sina + p.z * cosa;
  p.x = rx;
  p.z = rz;
  return p;
};

var rotateZ = function(p, angle) {
  var sina = Math.sin(angle);
  var cosa = Math.cos(angle);
  var rx = p.x * cosa - p.y * sina;
  var ry = p.x * sina + p.y * cosa;
  p.x = rx;
  p.y = ry;
  return p;
};
