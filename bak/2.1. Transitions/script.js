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

  for (var i = 0; i < num_particles; i++){
    particle_control[i] = {
      x : 0,
      y : 0,
      z : 0
    }
  }

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

var onColorChanged = function(v) {
  for (var i = 0; i < num_particles; i++) {
    particles[i].material.color.setHex( color3.replace( '#','0x' ) );
  }
};

var changingLayout = false;

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

      changingLayout = true;
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

      changingLayout = true;
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

      changingLayout = true;
      break;

  }
};


function linearMove(progress, source, target){
  return ( source + ( progress * ( target - source ) ));
}

function easeIn(startPosition, endPosition, friction) {
  return (endPosition-startPosition) / friction;
}




function MyAnimation(duration) {

  this.startTime = Date.now();

  this.duration = duration;
  this.animationFrame = this.duration + this.startTime; 

  requestAnimationFrame(this.tick.bind(this));

  for (var i = 0; i < num_particles; i++){
    particle_control[i].x = particles[i].position.x;
    particle_control[i].y = particles[i].position.y;
    particle_control[i].z = particles[i].position.z;
  }
}


MyAnimation.prototype.tick = function(time) {
  var $this = this,
      timePassed = time - this.startTime,
      progress = timePassed / this.duration;

  if (progress > 1){
    progress = 1;
  }
  
  if (progress === 1) {
    //this.dispatchEvent("ended");
    console.log('ended : '+timePassed );

    changing = false;
    changingLayout = false;
    return;

  }

  for (var i = 0; i < num_particles; i++) {
    particles[i].position.x = linearMove(progress, particle_control[i].x, targets[i].x);
    particles[i].position.y = linearMove(progress, particle_control[i].y, targets[i].y);
    particles[i].position.z = linearMove(progress, particle_control[i].z, targets[i].z);
  }

  

  camera.position.x += ( mouseX - camera.position.x ) * .05;
  camera.position.y += ( - mouseY - camera.position.y ) * .05;
  camera.lookAt( scene.position );

  renderer.render( scene, camera );

  var now = Date.now();

  requestAnimationFrame(function(){
    $this.tick(now);
  });

  $('canvas').on('click',function(){
    console.log(progress+' '+linearMove(progress, particles[30].position.x, targets[30].x));
  });

}

/*

    particles[i].position.x += (targets[i].x - particles[i].position.x );
    particles[i].position.y += (targets[i].y - particles[i].position.y );
    particles[i].position.z += (targets[i].z - particles[i].position.z );

*/



var st = 0;

var changing = false;

var animate = function() {
  requestAnimationFrame( animate );

  if (!!!changingLayout){
    render();
  }else if (!!!changing){
    changing = true;
    console.log('start');
    var myanim = new MyAnimation(10000);
  }
  stats.update();
};


var render = function () {

  i = 0;
  /*for ( var ix = 0; ix < num_logo_arcs; ix ++ ) {

    for ( var iy = 0; iy < num_particles_per_arc; iy ++ ) {

      particle = particles[ i++ ];

      particle.position.y = ( Math.sin( ( ix + count ) * 0.3 ) * 50 ) + ( Math.sin( ( iy + count ) * 0.5 ) * 50 );
      particle.scale.x = particle.scale.y = ( Math.sin( ( ix + count ) * 0.3 ) + 1 ) * 2 + ( Math.sin( ( iy + count ) * 0.5 ) + 1 ) * 2;

    }

  }*/

  count += 0.1;

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
