var gui;
var layout_states = [
  'Waves'
, 'Expand'
, 'Twinkle'
, 'Cluster'
, 'Network'
, 'Logo'
];
var line_opacity_states = [
  0
, 0
, 0
, 0
, 1
, 0
];
var layout = layout_states[0];
var lineOpacity = line_opacity_states[0];

var particleColor = '#319ba2';
var bgColor = '#222';

var container, stats;
var camera, scene, renderer;
var particles = [], particle, count = 0;
var lines;
var lineOpacityA = 0, lineOpacityB = 0;
var targets;
var targetA = [], targetB = [];

var currentLayout = 0, nextLayout = 0, transitionMix = 0;
var transitionIndex = 0;
var position = 0;

var clock = new THREE.Clock(true);

var positionBar, layoutSelector;

var logo_arc_degrees = 99;
var num_particles_per_arc = 60;
var num_logo_arcs = 23;
var num_particles = num_logo_arcs * num_particles_per_arc;

var mouseX = 0, mouseY = 0;
var windowHalfX, windowHalfY;
var PI2 = Math.PI * 2;


window.onload = function() {

  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  // init gui
  gui = new dat.GUI();
  layoutSelector = gui.add(this, 'layout', layout_states);
  layoutSelector.onFinishChange(function(value) {
    onLayoutChanged();
  });
  //layoutSelector.setValue(layout_states[0]);
  // gui.addColor(this, 'color0' ).onChange(onColorChanged);
  // gui.addColor(this, 'color1' ).onChange(onColorChanged);
  // gui.addColor(this, 'color2' ).onChange(onColorChanged);
  positionBar = gui.add(this, 'position', 0, 100).onChange(onpositionChange);
  gui.addColor(this, 'particleColor' ).onChange(function(v) {
    var c = v.replace( '#','0x' )
    var i = num_particles;
    while(i--)
      particles[i].material.color.setHex( c );
  });
  gui.addColor(this, 'bgColor' ).onChange(function(v) {
    $('body').css({ backgroundColor : v });
  });


  targetA = generateTargets(layout_states[0]);
  targetB = generateTargets(layout_states[1]);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.z = 1500;

  // create particles
  var i = num_particles;
  while(i--) {
    particle = particles[ i ] = new THREE.Particle(
      new THREE.ParticleCanvasMaterial( {
        color : particleColor,
        program: function ( context ) {
          context.beginPath();
          context.arc( 0, 0, 1, 0, PI2, true );
          context.fill();
        }
      }));
    particle.position = new THREE.Vector3(0,0,0);
    particle.scale.x = particle.scale.y = 10;
    scene.add( particle );
  }

  // lines
  lines = new Array(num_particles/2);
  var material = new THREE.LineBasicMaterial({
      color: 0x777777,
      linewidth : 1
  });
  material.opacity = 0;
  var i = lines.length;
  while (i--) {
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3());
    geometry.vertices.push(new THREE.Vector3());
    line = lines[i] = new THREE.Line(geometry, material);
    scene.add(line);
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
  //document.addEventListener( 'mousedown', onDocumentMouseDown, false );
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

var onpositionChange = function() {

  //var step = 100 / layout_states.length-1;
  var layoutID = lmap(position, 0, 100, 0, layout_states.length - 1);

  currentLayout = layout_states[parseInt(layoutID)];
  nextLayout = currentLayout == layout_states[layout_states.length - 1] ?
               currentLayout : layout_states[parseInt(layoutID) + 1];

  lineOpacityA = line_opacity_states[parseInt(layoutID)];
  lineOpacityB = lineOpacityA == line_opacity_states[line_opacity_states.length - 1] ?
                 lineOpacityA : line_opacity_states[parseInt(layoutID) + 1];

  transitionMix = layoutID - parseInt(layoutID);

  if (layout != currentLayout) {
    lineOpacity = lineOpacityA;
    layout = currentLayout;
    targetA = generateTargets(currentLayout);
    targetB = generateTargets(nextLayout);
  }
};

var onLayoutChanged = function() {
  // set position bar position based on layout change
  var pos = lmap(layout_states.indexOf(layout), 0, layout_states.length-1, 0, 100);
  positionBar.setValue(pos);
};

var updateTargets = function() {
  targetA = generateTargets(currentLayout);
  targetB = generateTargets(nextLayout);
};

var generateTargets = function(_layout) {
  var t = clock.getElapsedTime();
  return animation_states[layout_states.indexOf(_layout)].update(t);
};

var updateLines = function() {
  var i = lines.length;
  while(i--) {
    lines[i].geometry.vertices[0].copy(particles[i].position);
    lines[i].geometry.vertices[1].copy(particles[i+1].position);
    lines[i].material.opacity = lerp(lineOpacityA, lineOpacityB, transitionMix);
  }
};

var animate = function() {
  requestAnimationFrame( animate );
  updateTargets();
  updateLines();
  render();
  stats.update();
};

var render = function () {

  // update particle positions
  var i = num_particles;
  while(i--) {
    var pp = particles[i].position;
    pp.x = lerp(pp.x, lerp(targetA[i].x, targetB[i].x, transitionMix), 0.1);
    pp.y = lerp(pp.y, lerp(targetA[i].y, targetB[i].y, transitionMix), 0.1);
    pp.z = lerp(pp.z, lerp(targetA[i].z, targetB[i].z, transitionMix), 0.1);
  }

  // update camera position
  // camera.position.x += ( mouseX - camera.position.x ) * .05;
  // camera.position.y += ( - mouseY - camera.position.y ) * .05;
  camera.lookAt( scene.position );
  renderer.render( scene, camera );
};
