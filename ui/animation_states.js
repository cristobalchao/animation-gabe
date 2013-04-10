// invitae animation states

var animation_states = [


  {
    "label" : "Waves",
    "particleScale" : 6,
    "lineOpacity" : 0,
    update : function(t) {

      var i = num_particles, arr = [];
      while(i--)
        arr[i] = new THREE.Vector3(0,0,0);

      t *= 2.5;
      var SEPARATION = 100, AMOUNTX = 50, AMOUNTY = 50, i = 0;
      for ( var ix = 0; ix < num_logo_arcs; ix++ ) {
        for ( var iy = 0; iy < logo_arc_degrees; iy += logo_arc_degrees / num_particles_per_arc ) {
          arr[i].x = ix * SEPARATION - ( ( AMOUNTX * SEPARATION ) / 2 ) + 1500;
          arr[i].y = (Math.sin( ( ix + t ) * 0.3 ) * 50 ) + ( Math.sin( ( iy + t ) * 0.5 ) * 50);
          arr[i].z = iy * SEPARATION - ( ( AMOUNTY * SEPARATION ) / 2 );
          //arr[i] = rotateX(arr[i], Math.sin(t) * 0.2); // get this rotation correct
          //arr[i] = rotateZ(arr[i], t); // get this rotation correct
          //arr[i] = rotateY(arr[i], t * 0.01); // get this rotation correct
          i++;
        }
      }
      return arr;
    }
  },



  {
    "label" : "Expand",
    "particleScale" : 6,
    "lineOpacity" : 0,
    update : function(t) {

      var i = num_particles, arr = [];
      while(i--)
        arr[i] = new THREE.Vector3(0,0,0);

      t *= 2.5;
      var SEPARATION = 100, AMOUNTX = 50, AMOUNTY = 50, i = 0;
      for ( var ix = 0; ix < num_logo_arcs; ix++ ) {
        for ( var iy = 0; iy < logo_arc_degrees; iy += logo_arc_degrees / num_particles_per_arc ) {
          arr[i].x = (_rand_pos2[i].x * 0.2) + ix * SEPARATION - ( ( AMOUNTX * SEPARATION ) / 2 ) + 1500;
          arr[i].y = _rand_pos2[i].y + ((Math.sin( ( ix + t ) * 0.3 ) * 50 ) + ( Math.sin( ( iy + t ) * 0.5 ) * 50) * 0.3);
          arr[i].z = _rand_pos2[i].z * 2.0;//+ iy * SEPARATION - ( ( AMOUNTY * SEPARATION ) / 2 );
        	arr[i] = rotateX(arr[i], -t * 0.003);
          i++;
        }
      }
      return arr;
    }
  },

  {
    "label" : "Twinkle",
    "particleScale" : 6,
    "lineOpacity" : 1,
    update : function(t) {

      var i = num_particles, arr = [];
      while(i--)
        arr[i] = new THREE.Vector3(0,0,0);

      for (var i = 0; i < num_particles; i++) {
        var tmp_x = new THREE.Vector3(0,0,0);
        arr[i] = _rand_pos[i];
        arr[i] = rotateX(arr[i], 0.001); // get this rotation correct
        arr[i] = rotateZ(arr[i], 0.0001); // get this rotation correct
        arr[i] = rotateY(arr[i], 0.0021); // get this rotation correct
      }
      return arr;
    }
  },

  {
    "label" : "Cluster",
    "particleScale" : 6,
    "lineOpacity" : 1,
    update : function(t) {

      var i = num_particles, arr = [];
      while(i--)
        arr[i] = new THREE.Vector3(0,0,0);

      var origin = new THREE.Vector3(0, 0, 0);

      t *= 0.5;

      var num_cluster_pnts = num_particles / num_clusters;

      var c = 0, cc = num_particles;

      for (var i = 0; i < num_clusters; i++) {
				arr[c] = _cluster_positions[i];
				c++;
				cc--;
				for (var j = 0; j < num_cluster_pnts - 5; j++) {

					arr[c] = _cluster_positions[i].clone();
					arr[c].y = _rands[c] * 100;

          arr[c].x -= _cluster_positions[i].x;
          arr[c].y -= _cluster_positions[i].y / 4;

          //arr[c]    = rotateY( arr[c], t * _rands[cc] * .5 );
          arr[c]    = rotateZ( arr[c], t * 2.6 * (_rands[_rand_keys[cc]]) );
          arr[c]    = rotateY( arr[c], t * 1.0 * (_rands[c]) );
          arr[c]    = rotateX( arr[c], t * -1.0 * (_rands[c]) );

          //arr[c].y = Math.sin(arr[c].y * t * 0.2) * 100;

          arr[c].x += _cluster_positions[i].x;
          arr[c].y += _cluster_positions[i].y / 2;

          c++;
          cc--;
          for (var k = j; k < 5; j++, k++) {
          	arr[c] = _rand_pos[c];
          	c++;
          	cc--;
          }
				}
      }
      return arr;
    }
  },

  {
    "label" : "Network",
    "particleScale" : 6,
    "lineOpacity" : 0,
    update : function(t) {

      var i = num_particles, arr = [];
      while(i--)
        arr[i] = new THREE.Vector3(0,0,0);

      for (var i = 0; i < num_particles; i++) {
        var tmp_x = new THREE.Vector3(0,0,0);
        arr[i] = _rand_pos[i];
        arr[i] = rotateX(arr[i], 0.001); // get this rotation correct
        arr[i] = rotateZ(arr[i], 0.0001); // get this rotation correct
        arr[i] = rotateY(arr[i], 0.0021); // get this rotation correct
      }
      return arr;
    }
  },

  {
    "label" : "Logo",
    "particleScale" : 6,
    "lineOpacity" : 0,
    update : function(t) {

      var i = num_particles, arr = [];
      while(i--)
        arr[i] = new THREE.Vector3(0,0,0);

			var inc = PI2 / 360,
          arc_radius = 700,
          logo_radius = 300,
          logo_center = { x : 0, y : 0},
          arc_rot_inc = PI2 / num_logo_arcs,
          arc_rot = 0,
          count = 0;
      // loop through all arcs
      for (var i = 0; i < num_logo_arcs; i++) {
        arc_rot = arc_rot_inc * i + t * -0.1;
        // draw each arc
        for ( var a = 0; a < logo_arc_degrees; a += 99/num_particles_per_arc ) {
          var pos = new THREE.Vector3(0, 0, 0);
          // generate particle position based on scaled ellipse
          pos.x = logo_center.x + Math.cos(inc * a) * arc_radius * 1.15;
          pos.y = logo_center.y + Math.sin(inc * a) * arc_radius * 1.0;
          // do rotation per arc
          pos = rotateZ(pos, arc_rot);
          // individual arc rotation
          var tmp_x = logo_center.x + Math.cos(arc_rot) * logo_radius,
              tmp_y = logo_center.y + Math.sin(arc_rot) * logo_radius;
          pos.x -= tmp_x;
          pos.y -= tmp_y;
          pos = rotateZ(pos, -1.8);
          pos.x += tmp_x;
          pos.y += tmp_y;
          arr[count++] = pos;
        }
      }
      return arr;
    }
  }
];


var _rand_pos = [], _rand_pos2 = [], _rand_pos3 = [];
var _rands = [], _rand_keys = [];
// create some random positions for testing
var i = num_particles;
while (i--) {
  _rand_pos[i] = new THREE.Vector3(
      (Math.random() * 1000 - 500) * 2,
      (Math.random() * 1000 - 500) * 2,
      (Math.random() * 1000 - 500) * 2);
  _rand_pos2[i] = new THREE.Vector3(
      (Math.random() * 1000 - 500) * 2,
      (Math.random() * 1000 - 500) * 2,
      (Math.random() * 1000 - 500) * 2);
	_rands[i] = Math.random();
	_rand_keys[i] = parseInt(Math.random() * (num_particles-1));
}


var num_clusters = 6;
var _cluster_positions = [];
var i = num_clusters;
while (i--) {
	_cluster_positions[i] = new THREE.Vector3(
      (Math.random() * 2500 - 1250) * 2,
      (Math.random() * 500 - 250) * 2,
      (Math.random() * 500 - 250) * 2);
}

