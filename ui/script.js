var gui;
var layout_states = [
    'Waves'
,   'Expand'
,   'Field'
,   'Cluster'
,   'Network'
,   'Logo'
];
var layout = layout_states[0];

window.onload = function() {

    init();

    // init gui
    gui = new dat.GUI();
    var layoutButton = gui.add(this, 'layout', layout_states);
    layoutButton.onFinishChange(function(value) {
      onLayoutChanged();
    });
};

var init = function() {
    console.log("init");
};

var onLayoutChanged = function() {
    console.log(layout);
};
