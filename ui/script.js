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
, 1
, 1
, 0
, 0
]
var layout = layout_states[0];
var lineOpacity = line_opacity_states[0];

var particleColor = '#319ba2';
var bgColor = '#222';

var container, stats;
var camera, scene, renderer;
var particles, particle, count = 0;
var lines;
var lineOpacityA = 0, lineOpacityB = 0;
var targets;
var targetA = [], targetB = [];
var _rand_pos = [], _rand_pos2 = [];

var currentLayout = 0, nextLayout = 0, transitionMix = 0;
var progressControl;
var transitionIndex = 0;
var progress = 0;

var clock = new THREE.Clock(true);

var progressBar, layoutSelector;

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
  progressBar = gui.add(this, 'progress', 0, 100).onChange(onProgressChange);
  gui.addColor(this, 'particleColor' ).onChange(function(v) {
    var c = v.replace( '#','0x' )
    for (var i = 0; i < num_particles; i++)
      particles[i].material.color.setHex( c );
  });
  gui.addColor(this, 'bgColor' ).onChange(function(v) {
    $('body').css({ backgroundColor : v });
  });


  targetA = generateTargets(layout_states[0]);
  targetB = generateTargets(layout_states[1]);

  // targetA = generateTargets(currentLayout);
  // targetB = generateTargets(nextLayout);

  // create some random positions for testing
  for (var i = 0; i < num_particles; i++) {
    _rand_pos[i] = new THREE.Vector3(
        (Math.random() * 1000 - 500) * 2,
        (Math.random() * 1000 - 500) * 2,
        (Math.random() * 1000 - 500) * 2);
    _rand_pos2[i] = new THREE.Vector3(
        (Math.random() * 1000 - 500) * 2,
        (Math.random() * 1000 - 500) * 2,
        (Math.random() * 1000 - 500) * 2);
    }

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.z = 1500;

  // particles
  particles = new Array(num_particles);
  for ( var i = 0; i < num_particles; i ++ ) {
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
    particle.scale.x = particle.scale.y = 6;
    scene.add( particle );
  }

  // lines
  lines = new Array(num_particles/2);
  var material = new THREE.LineBasicMaterial({
      color: 0x777777,
      linewidth : 1
  });
  material.opacity = 0;
  for (var i = 0; i < lines.length; i++) {
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

var onProgressChange = function() {

  //var step = 100 / layout_states.length-1;
  var layoutID = lmap(progress, 0, 100, 0, layout_states.length - 1);

  currentLayout = layout_states[parseInt(layoutID)];
  nextLayout = currentLayout == layout_states[layout_states.length-1] ?
               currentLayout : layout_states[parseInt(layoutID) + 1];

  lineOpacityA = line_opacity_states[parseInt(layoutID)];
  lineOpacityB = lineOpacityA == line_opacity_states[line_opacity_states.length-1] ?
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
  // set progress bar position based on layout change
  var pos = lmap(layout_states.indexOf(layout), 0, layout_states.length-1, 0, 100);
  progressBar.setValue(pos);
};

var updateTargets = function() {
  targetA = generateTargets(currentLayout);
  targetB = generateTargets(nextLayout);
};

var updateLines = function() {
  var randIds = new Array(num_particles);
  for (var i = 0; i < lines.length; i++) {
    lines[i].geometry.vertices[0].copy(particles[i].position);
    lines[i].geometry.vertices[1].copy(particles[i+1].position);
    lines[i].material.opacity = tween(transitionMix, lineOpacityA, lineOpacityB);
  }
};

var generateTargets = function(_layout) {

  var arr = new Array(num_particles);
  for (var i = 0; i < num_particles; i++) {
    arr[i] = new THREE.Vector3(0,0,0);
  }

  // timer
  var t = clock.getElapsedTime();

  switch(_layout) {
    case 'Waves':
      t *= 2.5;
      var SEPARATION = 100, AMOUNTX = 50, AMOUNTY = 50, i = 0;
      for ( var ix = 0; ix < num_logo_arcs; ix++ ) {
        for ( var iy = 0; iy < logo_arc_degrees; iy += 99 / num_particles_per_arc ) {
          arr[i].x = ix * SEPARATION - ( ( AMOUNTX * SEPARATION ) / 2 ) + 1500;
          arr[i].y = (Math.sin( ( ix + t ) * 0.3 ) * 50 ) + ( Math.sin( ( iy + t ) * 0.5 ) * 50);
          arr[i].z = iy * SEPARATION - ( ( AMOUNTY * SEPARATION ) / 2 );

          //arr[i] = rotateX(arr[i], Math.sin(t) * 0.2); // get this rotation correct
          //arr[i] = rotateZ(arr[i], t); // get this rotation correct
          arr[i] = rotateY(arr[i], t * 0.01); // get this rotation correct
          i++;
        }
      }
      break;
    case 'Expand':
      var radius = 700;
      for (var i = 0; i < num_particles; i++) {
        theta = i / 80.0 * Math.PI;
        phi = i / Math.PI + (t * 0.2);
        arr[i].x =  Math.cos(theta + t * 0.05) * Math.sin(phi) * radius;
        arr[i].y =  Math.sin(theta) * Math.sin(phi + t * 0.24) * radius;
        arr[i].z =  Math.cos(phi)   * radius;
      }
      break;
    case 'Twinkle':
      var inc = (Math.PI * 2) / num_particles;
      var rad = (Math.sin(t) * 200.2) + 500;
      for (var i = 0; i < num_particles; i++) {
        arr[i].x = Math.cos(inc*i) * rad;
        arr[i].y = Math.sin(inc*i) * rad;
        arr[i].z = Math.sin(inc * i + t) * i;
      }
      break;
    case 'Cluster':
      var radius = 700;
      t /= 10.5;
      for (var i = 0; i < num_particles; i++) {
        theta = i / 20.0 * Math.PI;
        phi = i / 8. * Math.PI + t * 11.0;
        arr[i].x =  Math.cos(theta) * Math.sin(phi) * radius;
        arr[i].y =  Math.sin(theta) * Math.sin(phi) * radius;
        arr[i].z =  Math.cos(phi)   * radius * t / 20.0;
      }
      break;
    case 'Network':
      for (var i = 0; i < num_particles; i++) {
        var tmp_x = new THREE.Vector3(0,0,0);
        arr[i] = _rand_pos[i];
        arr[i] = rotateX(arr[i], 0.001); // get this rotation correct
        arr[i] = rotateZ(arr[i], 0.0001); // get this rotation correct
        arr[i] = rotateY(arr[i], 0.0021); // get this rotation correct
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
          pos = rotateZ(pos, -1.8); // get this rotation correct
          pos.x += tmp_x;
          pos.y += tmp_y;
          arr[count++] = pos;
        }
      }
      break;
    }
    return arr;
}


var animate = function() {
  requestAnimationFrame( animate );
  updateTargets();
  updateLines();
  render();
  stats.update();
};

var render = function () {

  // update particle positions
  for (var i = 0; i < num_particles; i++) {
    var pp = particles[i].position;
    pp.x = lerp(pp.x, tween(transitionMix, targetA[i].x, targetB[i].x), 0.2);
    pp.y = lerp(pp.y, tween(transitionMix, targetA[i].y, targetB[i].y), 0.2);
    pp.z = lerp(pp.z, tween(transitionMix, targetA[i].z, targetB[i].z), 0.2);
  }

  // update camera position
  //camera.position.x += ( mouseX - camera.position.x ) * .05;
  //camera.position.y += ( - mouseY - camera.position.y ) * .05;
  camera.lookAt( scene.position );

  renderer.render( scene, camera );
};

var transition = function( pos, start, end, smoothing ) {
  pos.x = lerp(pos.x, tween(transitionMix, start.x, end.x), smoothing);
  pos.y = lerp(pos.y, tween(transitionMix, start.y, end.y), smoothing);
  pos.z = lerp(pos.z, tween(transitionMix, start.z, end.z), smoothing);
  return pos;
};

var tween = function(currentProgress, start, end) {
  return ( start + ( currentProgress * ( end - start) ));
};









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
