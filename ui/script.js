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
  gui.addColor(this, 'color0');
  gui.addColor(this, 'color1');
  gui.addColor(this, 'color2');
  gui.addColor(this, 'color3');

  init();
  animate();
};

var onLayoutChanged = function() {
  console.log("Layout changed: " + layout);
};

var init = function() {

  console.log("init");

  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  // create camera
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.z = 700;

  scene = new THREE.Scene();

  // particle material
  var material = new THREE.ParticleCanvasMaterial( {
    color: color3,
    program: function ( context ) {
      context.beginPath();
      context.arc( 0, 0, 1, 0, PI2, true );
      context.fill();
    }
  } );

  // create particles
  particles = new Array();
  for ( var i = 0; i < num_particles; i ++ ) {
    particle = particles[ i ] = new THREE.Particle( material );
    particle.position.x = 0;
    particle.position.y = 0;
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
};

var animate = function() {
  requestAnimationFrame( animate );
  render();
  stats.update();
};

var render = function () {

  /*

  var rot = 0;
  var inc = PI2 / 60;
  var radius = 1000;
  pos.x + radius * Math.cos(inc * i) * rot;
  pos.y + radius * Math.sin(inc * i) * rot;

  */

  camera.position.x += ( mouseX - camera.position.x ) * .05;
  camera.position.y += ( - mouseY - camera.position.y ) * .05;
  camera.lookAt( scene.position );

  var pos = { x : 0, y : 0};
  var inc = PI2 / 360; // one degree per increment
  var radius = 500;

  // for (var i = 0; i < num_logo_arcs; i++) {
    // one arc
    for ( var a = 0; a < num_particles_per_arc; a++ ) {
      //console.log('b:' + a);

      particle = particles[ a ];
      //a++;
      //console.log('a:' + a);
      particle.position.x = pos.x + Math.cos(inc * a) * radius * 1.15;
      particle.position.y = pos.y + Math.sin(inc * a) * radius * 1.0;
      particle.scale.x = particle.scale.y = 6;
    }
  // }


  renderer.render( scene, camera );

  count += 0.1;

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
}

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




////////////////////
// notes
///
//    particle.scale.x = particle.scale.y = ( Math.sin( ( i + count ) * 0.3 ) + 1 ) * 2 + ( Math.sin( ( i + count ) * 0.5 ) + 1 ) * 2;
