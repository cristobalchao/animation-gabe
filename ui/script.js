var gui;
var layout_states = [
  'Waves'
, 'Expand'
, 'Field'
, 'Cluster'
, 'Network'
, 'Logo'
];
var layout = layout_states[0];
var color0 = '#A4CE51';
var color1 = '#5EBD72';
var color2 = '#07AD96';
var color3 = '#09979E';

window.onload = function() {

  init();

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
};

var init = function() {
  console.log("init");
};

var onLayoutChanged = function() {
  console.log("Layout changed: " + layout);
};
