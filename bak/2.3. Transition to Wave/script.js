var gui;
var layout_states = [
  'Waves'
, 'Expand'
, 'Field'
, 'Cluster'
, 'Network'
, 'Logo'
];


var easing_states = [
  'linear'
  , 'quad'
  , 'circ'
  , 'bow'
  , 'bounce'
  , 'elastic'
];


var layout = layout_states[5];
var easing = easing_states[0];
var speed = 1;
var progress = 100;
var color0 = '#A4CE51';
var color1 = '#5EBD72';
var color2 = '#07AD96';
var color3 = '#09979E';


var container, stats;
var camera, scene, renderer;
var particles, particle, count = 0;
var targets;
var particle_control;
var transitionIndex = 0;

var clock = new THREE.Clock();

var num_particles_per_arc = 99;
var num_logo_arcs = 23;
var num_particles = num_logo_arcs * num_particles_per_arc;

var mouseX = 0, mouseY = 0;
var windowHalfX, windowHalfY;
var PI2 = Math.PI * 2;

window.onload = function() {

  // init gui
  gui = new dat.GUI();
  var layoutButton = gui.add(this, 'layout', layout_states);
  layoutButton.onFinishChange(function(value) {
    onLayoutChanged();
  });
  var easingButton = gui.add(this, 'easing', easing_states);
  easingButton.onFinishChange(function(value) {
    easing = value;
  });
  var speedButton = gui.add(this, 'speed', 0, 20);

  var progressButton = gui.add(this, 'progress', 0, 100);


  gui.addColor(this, 'color0' ).onChange(onColorChanged);
  gui.addColor(this, 'color1' ).onChange(onColorChanged);
  gui.addColor(this, 'color2' ).onChange(onColorChanged);
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
  particle_control = new Array(num_particles);

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
    particle_control[i] = {
      x : 0,
      y : 0,
      z : 0
    }
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

var onColorChanged = function(v) {
  for (var i = 0; i < num_particles; i++) {
    particles[i].material.color.setHex( color3.replace( '#','0x' ) );
  }
};

var changingLayout = false,
    changingWhileTransition = false;

var onLayoutChanged = function() {

  switch(layout) {
    case 'Waves':

      var SEPARATION = 100,
          count = 0;

      for ( var ix = 0; ix < num_logo_arcs; ix ++ ) {

        for ( var iy = 0; iy < num_particles_per_arc; iy ++ ) {

          var pos = new THREE.Vector3(0, 0, 0);
          pos.x = ix * SEPARATION - ( ( num_logo_arcs * SEPARATION ) / 2 );
          pos.z = iy * SEPARATION - ( ( num_particles_per_arc * SEPARATION ) / 2 );

          targets[count++] = pos;
          
        }

      }

      if (!!changingLayout){
        changingWhileTransition = true;
      }else{
        changingLayout = true;
      }
      break;

    case 'Expand':
    case 'Field':
    case 'Cluster':
    case 'Network':
      for (var i = 0; i < num_particles; i++) {
        targets[i] = new THREE.Vector3(
          Math.random() * 1000 - 500,
          Math.random() * 1000 - 500,
          0);
      }

      if (!!changingLayout){
        changingWhileTransition = true;
      }else{
        changingLayout = true;
      }
      break;
    case 'Logo':
      var inc = PI2 / 360;
      var arc_radius = 700;
      var logo_radius = 300;
      var logo_center = { x : 0, y : 0};
      var arc_rot_inc = PI2 / num_logo_arcs;
      var arc_rot = 0;
      var count = 0;
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

      if (!!changingLayout){
        changingWhileTransition = true;
      }else{
        changingLayout = true;
      }
      break;
  }
};

function processProgress(currentProgress){
  
  var result;

  switch(easing) {
    case 'linear':
      result = currentProgress;
      break;

    case 'quad':
      result = Math.pow(currentProgress, 2);
      break;

    case 'circ':
      result = 1 - Math.sin(Math.acos(currentProgress));
      break;

    case 'bow':
      var x = 1.5;
      result = Math.pow(currentProgress, 2) * ((x + 1) * currentProgress - x);
      break;

    case 'bounce':
      for(var a = 0, b = 1; 1; a += b, b /= 2) {
        if (currentProgress >= (7 - 4 * a) / 11) {
          result =  -Math.pow((11 - 6 * a - 11 * currentProgress) / 4, 2) + Math.pow(b, 2);
          return result;
        }
      }
      break;

    case 'elastic':
      var x = 1.5;
      result = Math.pow(2, 10 * (currentProgress-1)) * Math.cos(20*Math.PI*x/3*currentProgress);
      break;

    default: //linear 
      result = currentProgress;
      break;

  }

  return result;
}

function tween(currentProgress, source, target){
  return ( source + ( processProgress(currentProgress) * ( target - source ) ));
}

function Transition() {

  this.startTime = Date.now();

  this.speed = speed*1000;

  requestAnimationFrame(this.tick.bind(this));

  for (var i = 0; i < num_particles; i++){
    particle_control[i].x = particles[i].position.x;
    particle_control[i].y = particles[i].position.y;
    particle_control[i].z = particles[i].position.z;
  }
}


Transition.prototype.tick = function(time) {
  var $this = this;

  if (!!changingWhileTransition){
    $this.startTime = Date.now();
    changingWhileTransition = false;
    for (var i = 0; i < num_particles; i++){
      particle_control[i].x = particles[i].position.x;
      particle_control[i].y = particles[i].position.y;
      particle_control[i].z = particles[i].position.z;
    }
  }

  $this.speed = speed*1000;
  var timePassed = time - $this.startTime,
      currentProgress = timePassed / $this.speed;

  if (currentProgress > progress/100.0){
    currentProgress = progress/100.0;
  }
  
  for (var i = 0; i < num_particles; i++) {
    particles[i].position.x = tween(currentProgress, particle_control[i].x, targets[i].x);
    particles[i].position.y = tween(currentProgress, particle_control[i].y, targets[i].y);
    particles[i].position.z = tween(currentProgress, particle_control[i].z, targets[i].z);
  }


  camera.position.x += ( mouseX - camera.position.x ) * .05;
  camera.position.y += ( - mouseY - camera.position.y ) * .05;
  camera.lookAt( scene.position );

  renderer.render( scene, camera );

  var now = Date.now();

  if (currentProgress === 1) {
    console.log('ended : '+timePassed );
    changingLayout = transition = false;
    return;
  }

  requestAnimationFrame(function(){
    $this.tick(now);
  });
}

var transition = false;

var animate = function() {
  requestAnimationFrame( animate );

  if (!!!changingLayout){
    render();
  }else if (!!!transition){
    transition = true;
    console.log('start');
    new Transition();
  }
  stats.update();
};


var render = function () {

  switch(layout) {
    case 'Waves':
      i = 0;
      for ( var ix = 0; ix < num_logo_arcs; ix ++ ) {

        for ( var iy = 0; iy < num_particles_per_arc; iy ++ ) {

          particle = particles[ i++ ];

          particle.position.y = ( Math.sin( ( ix + count ) * 0.3 ) * 50 ) + ( Math.sin( ( iy + count ) * 0.5 ) * 50 );
          particle.scale.x = particle.scale.y = ( Math.sin( ( ix + count ) * 0.3 ) + 1 ) * 2 + ( Math.sin( ( iy + count ) * 0.5 ) + 1 ) * 2;

        }

      }

      count += 0.1;
      break;

    default:
      for ( var i = 0; i < num_particles; i ++ ) {
        particles[i].scale.x = particles[i].scale.y = 6;
      }
  }

  camera.position.x += ( mouseX - camera.position.x ) * .05;
  camera.position.y += ( - mouseY - camera.position.y ) * .05;
  camera.lookAt( scene.position );

  renderer.render( scene, camera );

};

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
