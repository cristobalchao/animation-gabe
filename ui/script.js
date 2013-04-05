var gui;
var layout_states = [
  'Waves'
, 'Expand'
, 'Field'
, 'Cluster'
, 'Network'
, 'Logo'
];
var layout = layout_states[5];
var color0 = '#A4CE51';
var color1 = '#5EBD72';
var color2 = '#07AD96';
var color3 = '#09979E';


var container, stats;
var camera, scene, renderer;
var particles, particle, count = 0;
var targets, targets_need_update = false;
var transitionIndex = 0;
var progress = 0;

var clock = new THREE.Clock(true);

var progressBar, layoutSelector;

var num_particles_per_arc = 99;
var num_logo_arcs = 23;
var num_particles = num_logo_arcs * num_particles_per_arc;

var mouseX = 0, mouseY = 0;
var windowHalfX, windowHalfY;
var PI2 = Math.PI * 2;

window.onload = function() {

  // init gui
  gui = new dat.GUI();
  layoutSelector = gui.add(this, 'layout', layout_states);
  layoutSelector.onFinishChange(function(value) {
    onLayoutChanged();
  });
  // gui.addColor(this, 'color0' ).onChange(onColorChanged);
  // gui.addColor(this, 'color1' ).onChange(onColorChanged);
  // gui.addColor(this, 'color2' ).onChange(onColorChanged);
  progressBar = gui.add(this, 'progress', 0, 100).onChange(onProgressChange);
  gui.addColor(this, 'color3' ).onChange(onColorChanged);


  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  // create camera
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.z = 1500;

  // scene
  scene = new THREE.Scene();

  // create particles
  particles = new Array(num_particles);
  targets = new Array(num_particles);

  for ( var i = 0; i < num_particles; i ++ ) {
    particle = particles[ i ] = new THREE.Particle(
      new THREE.ParticleCanvasMaterial( {
      color : color3,
      program: function ( context ) {
        context.beginPath();
        context.arc( 0, 0, 1, 0, PI2, true );
        context.fill();
      }
      }));
    particle.position = new THREE.Vector3(0,0,0);
    particle.scale.x = particle.scale.y = 6;
    scene.add( particle );
  }

  // set up canvas container
  container = document.createElement( 'div' );
  document.body.appendChild( container );

  // set up renderer
  renderer = new THREE.CanvasRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  // event listeners
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'touchstart', onDocumentTouchStart, false );
  document.addEventListener( 'touchmove', onDocumentTouchMove, false );
  window.addEventListener( 'resize', onWindowResize, false );

  // stats
  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  container.appendChild( stats.domElement );

  onLayoutChanged();

  animate();
};



var onProgressChange = function() {

  var step = 100 / layout_states.length-1;
  var pos = lmap(progress, 0, 100, 0, layout_states.length - 1);

  var currentState = layout_states[parseInt(pos)];

  if (currentState == layout_states[layout_states.length-1])
    nextState = currentState;
  else
    nextState = layout_states[parseInt(pos) + 1];

  var transAmount = pos - parseInt(pos);


  console.log(currentState, nextState, transAmount);

};


var onColorChanged = function(v) {
  for (var i = 0; i < num_particles; i++) {
    particles[i].material.color.setHex( color3.replace( '#','0x' ) );
  }
};

var onLayoutChanged = function() {
  updateLayout();
  // set progress bar position based on layout change
  var pos = lmap(layout_states.indexOf(layout), 0, layout_states.length-1, 0, 100);
  progressBar.setValue(pos);
};

var _rand_pos = [];
var updateLayout = function() {
  switch(layout) {
    case 'Waves': targets_need_update = true; break;
    case 'Expand':
    case 'Field':
    case 'Cluster':
    case 'Network':
    case 'Logo':    targets_need_update = false; break;
  }
  // create new random array of particles for testing
  for (var i = 0; i < num_particles; i++) {
    _rand_pos[i] = new THREE.Vector3(
        (Math.random() * 1000 - 500) * 2,
        (Math.random() * 1000 - 500) * 2,
        (Math.random() * 1000 - 500) * 2);
    }
    updateTargets();
};


var updateTargets = function() {
  switch(layout) {
    case 'Waves':
      var t = clock.getElapsedTime() * 2.5;
      var SEPARATION = 100, AMOUNTX = 50, AMOUNTY = 50, i = 0;
      for ( var ix = 0; ix < num_logo_arcs; ix++ ) {
        for ( var iy = 0; iy < num_particles_per_arc; iy++ ) {
          targets[i].x = ix * SEPARATION - ( ( AMOUNTX * SEPARATION ) / 2 ) + 1500;
          targets[i].y = (Math.sin( ( ix + t ) * 0.3 ) * 50 ) + ( Math.sin( ( iy + t ) * 0.5 ) * 50) + 250;
          targets[i].z = iy * SEPARATION - ( ( AMOUNTY * SEPARATION ) / 2 );
          i++;
        }
      }
      break;

    case 'Expand':
    case 'Field':
    case 'Cluster':
    case 'Network':
      for (var i = 0; i < num_particles; i++) {
        targets[i] = _rand_pos[i];
      }
      break;

    case 'Logo':
      var inc = PI2 / 360,
          arc_radius = 700,
          logo_radius = 300,
          logo_center = { x : 0, y : 0},
          arc_rot_inc = PI2 / num_logo_arcs,
          arc_rot = 0,
          count = 0;
      // loop through all arcs
      for (var i = 0; i < num_logo_arcs; i++) {
        arc_rot = arc_rot_inc * i;
        // draw each arc
        for ( var a = 0; a < num_particles_per_arc; a++ ) {
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
          pos = rotateZ(pos, -1.8); // get this rotation correct
          pos.x += tmp_x;
          pos.y += tmp_y;
          targets[count++] = pos;
        }
      }
      break;
    }
}


var animate = function() {
  requestAnimationFrame( animate );
  render();
  stats.update();
};



var render = function () {

  if (targets_need_update)
    updateTargets();

  // update particle positions
  for (var i = 0; i < num_particles; i++)
    particles[i].position = transition(particles[i].position, targets[i]);

  // update camera position
  camera.position.x += ( mouseX - camera.position.x ) * .05;
  camera.position.y += ( - mouseY - camera.position.y ) * .05;
  camera.lookAt( scene.position );

  // render
  renderer.render( scene, camera );
};



var transition = function( start, end ) {
    start.x += (end.x - start.x ) * 0.2;
    start.y += (end.y - start.y ) * 0.2;
    start.z += (end.z - start.z ) * 0.2;
    return start;
}




var onWindowResize = function () {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
};

var onDocumentMouseMove = function ( event ) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
};

var onDocumentTouchStart = function ( event ) {
  if ( event.touches.length === 1 ) {
    event.preventDefault();
    mouseX = event.touches[ 0 ].pageX - windowHalfX;
    mouseY = event.touches[ 0 ].pageY - windowHalfY;
  }
};

var onDocumentTouchMove = function ( event ) {
  if ( event.touches.length === 1 ) {
    event.preventDefault();
    mouseX = event.touches[ 0 ].pageX - windowHalfX;
    mouseY = event.touches[ 0 ].pageY - windowHalfY;
  }
};



/// UTIL
var lmap = function(v, in_min, in_max, out_min, out_max) {
  return out_min + (out_max-out_min) * ((v - in_min) / (in_max - in_min));
}

var rotateZ = function(p, angle) {
  var q = p;
  var sina = Math.sin(angle);
  var cosa = Math.cos(angle);
  var rx = q.x * cosa - q.y * sina;
  var ry = q.x * sina + q.y * cosa;
  p.x = rx;
  p.y = ry;
  return p;
};
