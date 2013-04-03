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
  gui.addColor(this, 'color0' ).onChange(onColorChanged);
  gui.addColor(this, 'color1' ).onChange(onColorChanged);
  gui.addColor(this, 'color2' ).onChange(onColorChanged);
  gui.addColor(this, 'color3' ).onChange(onColorChanged);

  init();
  animate();
};


var onColorChanged = function(v) {
  for (var i = 0; i < num_particles; i++) {
    particles[i].material.color.setHex( color3.replace( '#','0x' ) );
  }
};


var onLayoutChanged = function() {
  console.log('Layout changed: ' + layout);
};


var init = function() {

  console.log("init");

  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  // create camera
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.z = 1500;

  scene = new THREE.Scene();

  // create particles
  particles = new Array();
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

  camera.position.x += ( mouseX - camera.position.x ) * .05;
  camera.position.y += ( - mouseY - camera.position.y ) * .05;
  camera.lookAt( scene.position );

  switch(layout) {
    case layout_states[0] : layout_random(); break; // Waves
    case layout_states[1] : layout_random(); break; // Expand
    case layout_states[2] : layout_random(); break; // Field
    case layout_states[3] : layout_random(); break; // Cluster
    case layout_states[4] : layout_random(); break; // Network
    case layout_states[5] : layout_logo();   break; // Logo
  }

  renderer.render( scene, camera );
};


var layout_random = function() {
  for (var i = 0; i < num_particles; i++) {
    particle = particles[ i ];
    var pos = particle.position;
    pos.x = Math.random() * 1000 - 500;
    pos.y = Math.random() * 1000 - 500;
    // pos.z = Math.random() * 1000 - 500;
  }
};


var layout_logo = function () {

  var inc = PI2 / 360; // one degree per increment
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

      particle = particles[ count++ ];
      var pos = particle.position;

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

      // particle scale
      particle.scale.x = particle.scale.y = 6;
    }
  }
};


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




////////////////////
// notes
///
//    particle.scale.x = particle.scale.y = ( Math.sin( ( i + count ) * 0.3 ) + 1 ) * 2 + ( Math.sin( ( i + count ) * 0.5 ) + 1 ) * 2;
