

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var effectFXAA;

var NUMBER_COUNT = 62500;//32768;
var NUMBER_COUNT_SQRT = 250;
var ZOOM_OUT_Z = 4500;//3800;
var mouseX = 0, mouseY = 0,

windowHalfX = window.innerWidth / 2,
windowHalfY = window.innerHeight / 2,

container, camera, scene, renderer, material,
composer, controls,projector;
var reverse = false;
var deselectTimeout;

var canvasMaterial;

var targets = new Array(NUMBER_COUNT);
var colors = new Array(NUMBER_COUNT);
var primes, primeSequence, divisors;
var particles, highlightParticles;
var transitionCount = 0, transitionIndex = 0;;
var cube;
var highlightIndex = 0;

var selectedIndex = -1;

var dragStartPoint = null;

var mouseX, mouseY,dragStartCameraPosition;
var selectedNumbers = [];

var clock = new THREE.Clock();

var canvas;
var layout = "Simple 1,2,3...";
var pulseEnabled = true;
var number = 1;

var maxX = 2500, minX = -2500, maxY = 2500, minY = -2500, maxZ = 9000, minZ = 100;
var bestPrimeRatio = 0, bestDivisorRatio = 100;
var equations = {"x²+x+1":"1,1,1"};
var equation = "1,1,1";
var equationA = 1, equationB = 1, equationC = 1;
var highlightColor = { h: 350, s: 0.9, v: 0.3 };


var gui, guiFolder, coefFolder, equationControl, colorControl;;
var equationAControl, equationBControl, equationCControl;

$(function() {

$('#accordion').accordion({
active: false,
collapsible: true
});
});
window.onload = function() {

init();
animate();

	gui = new dat.GUI();
	var layoutButton = gui.add(this, 'layout', ['Simple 1,2,3...', 'Ulam Spiral', 'Ulam-Triangular', 'Ulam-Pentagonal', 'Ulam-Hexagonal', 'Ulam-Heptagonal', 'Ulam-Octagonal', 'Archimedean Spiral', 'Odd Spiral', 'Gosper Curve', 'Hilbert 2D Curve', 'Hilbert 3D Curve' ] );
	layoutButton.onFinishChange(function(value) {
	  // Fires when a controller loses focus.
	  onLayoutChanged();
	});
	var reverseButton = gui.add(this, 'reverse');
	reverseButton.onFinishChange(function(value) {
	  // Fires when a controller loses focus.
	  onLayoutChanged();
	});
	gui.add(this, 'pulseEnabled').onFinishChange(onPulseEnabledChanged);
	gui.add(this, 'number').max(NUMBER_COUNT).step(1);
	gui.add(this, 'zoomToNumber');


	guiFolder = gui.addFolder('highlight eqn - click 3 points to derive');
	guiFolder.add(this,'clearHighlight');
	guiFolder.add(this, 'doHighlight');
	colorControl = guiFolder.addColor(this,'highlightColor').onChange(onColorChanged);
	coefFolder = guiFolder.addFolder('ax²+bx+c coefficients');
	equationAControl = coefFolder.add(this, 'equationA').max(NUMBER_COUNT).step(1);
	equationBControl = coefFolder.add(this, 'equationB').max(NUMBER_COUNT).step(1);
	equationCControl = coefFolder.add(this, 'equationC').max(NUMBER_COUNT).step(1);
	equationControl = guiFolder.add(this, 'equation',equations).onChange(onEquationChanged);
}

function onEquationChanged()
{
	console.log("onEquationChanged");
	equationA = Number(equation.split(",")[0]);
	equationB = Number(equation.split(",")[1]);
	equationC = Number(equation.split(",")[2]);
	equationAControl.updateDisplay();
	equationBControl.updateDisplay();
	equationCControl.updateDisplay();
}

function onPulseEnabledChanged()
{
	if (!pulseEnabled)
	{
		highlightParticles.geometry.vertices[0].z = -1000;
		highlightParticles.geometry.verticesNeedUpdate = true;
	}
}

function onColorChanged()
{
	console.log("onColorChanged");
	if (typeof(highlightColor) == "string")
	{
		var col = new THREE.Color(highlightColor);
		highlightColor = { h: col.getHSV().h*360, s: col.getHSV().s, v: col.getHSV().v };
	}
}

function onLayoutChanged()
{
	console.log("Layout changed:"+layout);
	var extraZoomFactor = 1.0;
	for ( var i = 0; i < NUMBER_COUNT; i ++ )
	{
		particles.geometry.colors[i].r *= .5;
		particles.geometry.colors[i].g *= .5;
		particles.geometry.colors[i].b *= .5;
	}
	particles.geometry.colorsNeedUpdate = true;
	if (layout == "Ulam Spiral")
	{
		var pos = new THREE.Vector3(0,0,0);
		var currentDir = 0;
		var maxRunLength = 1;
		var runLength = 1;
		var runCount = 2;
		for ( var i = 0; i < NUMBER_COUNT; i ++ ) {
			var newPos = pos.clone();
			if (reverse) targets[NUMBER_COUNT - 1 - i] = newPos;
			else targets[i] = newPos ;
			pos.x += Math.cos(currentDir) * 10;
			pos.y += Math.sin(currentDir) * 10;
			runLength -- ;
			if (runLength == 0)
			{
				runCount --;
				if (runCount == 0)
				{
					runCount = 2;
					maxRunLength ++;
				}
				runLength = maxRunLength;
				currentDir += Math.PI * 2 / 4;
			}
		}
	}
	else if (layout == "Ulam-Triangular")
	{
		var pos = new THREE.Vector3(0,0,0);
		var currentDir = 0;
		var maxRunLength = 1;
		var runLength = 1;
		var runCount = 1;
		for ( var i = 0; i < NUMBER_COUNT; i ++ ) {
			var newPos = pos.clone();
			if (reverse) targets[NUMBER_COUNT - 1 - i] = newPos;
			else targets[i] = newPos ;
			pos.x += Math.cos(currentDir) * 13;
			pos.y += Math.sin(currentDir) * 13;
			runLength -- ;
			if (runLength == 0)
			{
				runCount --;
				if (runCount == 0)
				{
					runCount = 1;
					maxRunLength ++;
				}
				runLength = maxRunLength;
				currentDir += Math.PI * 2 / 3;
			}
		}
	}
	else if (layout == "Ulam-Pentagonal")
	{
		var pos = new THREE.Vector3(0,0,0);
		var currentDir = 0;
		var maxRunLength = 1;
		var runLength = 1;
		var runCount = 3;
		for ( var i = 0; i < NUMBER_COUNT; i ++ ) {
			var newPos = pos.clone();
			if (reverse) targets[NUMBER_COUNT - 1 - i] = newPos;
			else targets[i] = newPos ;
			pos.x += Math.cos(currentDir) * 10;
			pos.y += Math.sin(currentDir) * 10;
			runLength -- ;
			if (runLength == 0)
			{
				runCount --;
				if (runCount == 0)
				{
					runCount = 3;
					maxRunLength ++;
				}
				runLength = maxRunLength;
				currentDir += Math.PI * 2 / 5;
			}
		}
	}
	else if (layout == "Ulam-Hexagonal")
	{
		var pos = new THREE.Vector3(0,0,0);
		var currentDir = 0;
		var maxRunLength = 1;
		var runLength = 1;
		var runCount = 3;
		for ( var i = 0; i < NUMBER_COUNT; i ++ ) {
			var newPos = pos.clone();
			if (reverse) targets[NUMBER_COUNT - 1 - i] = newPos;
			else targets[i] = newPos ;
			pos.x += Math.cos(currentDir) * 10;
			pos.y += Math.sin(currentDir) * 10;
			runLength -- ;
			if (runLength == 0)
			{
				runCount --;
				if (runCount == 0)
				{
					runCount = 3;
					maxRunLength ++;
				}
				runLength = maxRunLength;
				currentDir += Math.PI * 2 / 6;
			}
		}
	}
	else if (layout == "Ulam-Heptagonal")
	{
		var pos = new THREE.Vector3(0,0,0);
		var currentDir = 0;
		var maxRunLength = 1;
		var runLength = 1;
		var runCount = 4;
		for ( var i = 0; i < NUMBER_COUNT; i ++ ) {
			var newPos = pos.clone();
			if (reverse) targets[NUMBER_COUNT - 1 - i] = newPos;
			else targets[i] = newPos ;
			pos.x += Math.cos(currentDir) * 10;
			pos.y += Math.sin(currentDir) * 10;
			runLength -- ;
			if (runLength == 0)
			{
				runCount --;
				if (runCount == 0)
				{
					runCount = 4;
					maxRunLength ++;
				}
				runLength = maxRunLength;
				currentDir += Math.PI * 2 / 7;
			}
		}
	}
	else if (layout == "Ulam-Octagonal")
	{
		var pos = new THREE.Vector3(0,0,0);
		var currentDir = 0;
		var maxRunLength = 1;
		var runLength = 1;
		var runCount = 5;
		for ( var i = 0; i < NUMBER_COUNT; i ++ ) {
			var newPos = pos.clone();
			if (reverse) targets[NUMBER_COUNT - 1 - i] = newPos;
			else targets[i] = newPos ;
			pos.x += Math.cos(currentDir) * 10;
			pos.y += Math.sin(currentDir) * 10;
			runLength -- ;
			if (runLength == 0)
			{
				runCount --;
				if (runCount == 0)
				{
					runCount = 5;
					maxRunLength ++;
				}
				runLength = maxRunLength;
				currentDir += Math.PI * 2 / 8;
			}
		}
	}
	else if (layout == "Ulam-Hendecagonal")
	{
		var pos = new THREE.Vector3(0,0,0);
		var currentDir = 0;
		var maxRunLength = 1;
		var runLength = 1;
		var runCount = 5;
		for ( var i = 0; i < NUMBER_COUNT; i ++ ) {
			var newPos = pos.clone();
			if (reverse) targets[NUMBER_COUNT - 1 - i] = newPos;
			else targets[i] = newPos ;
			pos.x += Math.cos(currentDir) * 8;
			pos.y += Math.sin(currentDir) * 8;
			runLength -- ;
			if (runLength == 0)
			{
				runCount --;
				if (runCount == 0)
				{
					runCount = 5;
					maxRunLength ++;
				}
				runLength = maxRunLength;
				currentDir += Math.PI * 2 / 11;
			}
		}
	}
	else if (layout == "Ulam-Experimental")
	{
		var pos = new THREE.Vector3(0,0,0);
		var currentDir = 0;
		var maxRunLength = 2;
		var runLength = 1;
		var runCount = 2;
		for ( var i = 0; i < NUMBER_COUNT; i ++ ) {
			var newPos = pos.clone();
			if (reverse) targets[NUMBER_COUNT - 1 - i] = newPos;
			else targets[i] = newPos ;
			pos.x += Math.cos(currentDir) * 6;
			pos.y += Math.sin(currentDir) * 6;
			runLength -- ;
			if (runLength == 0)
			{
				runCount --;
				if (runCount == 0)
				{
					maxRunLength ++;

					runCount = Math.max(maxRunLength - 2, 2);;
				}
				runLength = maxRunLength;
				currentDir += Math.PI * 2 / (maxRunLength - 1);
			}
		}
	}
	else if (layout == "Archimedean Spiral")
	{
		var pos = new THREE.Vector3(0,0,0);
		var maxRunLength = 1;
		var runIndex = 0;
		for ( var i = 0; i < NUMBER_COUNT; i ++ ) {
			var newPos = pos.clone();
			if (reverse) targets[NUMBER_COUNT - 1 - i] = newPos;
			else targets[i] = newPos ;
			var theta = Math.PI * 2 / maxRunLength * runIndex + Math.PI / maxRunLength / maxRunLength;
			var radius = maxRunLength * 5;
			if (maxRunLength == 1) radius = 0;

			pos.x = radius * Math.cos(theta);
			pos.y = radius * Math.sin(theta);
		//	object.position.z = -radius;
			runIndex ++;
			if (runIndex == maxRunLength)
			{
				maxRunLength ++;
				runIndex = 0;
			}
		}
	}
	else if (layout == "Odd Spiral")
	{
		var pos = new THREE.Vector3();
		var maxRunLength = 1;
		var prevMaxRunLength = 1;
		var maxRunIndex = 1;
		var runIndex = 0;
		for ( var i = 0; i < NUMBER_COUNT; i ++ ) {

			var theta = Math.PI * 2 / maxRunLength * runIndex;
			var radius = Math.pow(maxRunLength, 1) * 5;

			var newPos = pos.clone();
			pos.x = radius * Math.cos(theta);
			pos.y = radius * Math.sin(theta);
			//object.position.z = -radius;
			runIndex ++;
			if (runIndex == maxRunLength)
			{
				maxRunIndex ++;
				var nextRunLength = maxRunLength+prevMaxRunLength;
				prevMaxRunLength = 2 * maxRunIndex + 1;
				maxRunLength = 2 * maxRunIndex + 1;
				console.log("mRL:"+maxRunLength);
				runIndex = 0;
			}
			if (reverse) targets[NUMBER_COUNT - 1 - i] = newPos;
			else targets[i] = newPos ;

		}
	}
	else if (layout == "Simple 1,2,3...")
	{
		var pos = new THREE.Vector3();
		for ( var i = 0; i < NUMBER_COUNT; i ++ ) {
			var newPos = pos.clone();
			pos.x = (-NUMBER_COUNT_SQRT / 2 + i % NUMBER_COUNT_SQRT) * 10;
			pos.y = (NUMBER_COUNT_SQRT / 2 - Math.floor(i / NUMBER_COUNT_SQRT) ) * 10;
			if (reverse) targets[NUMBER_COUNT - 1 - i] = pos.clone();
			else targets[i] = pos.clone() ;

		}
	}
	else if (layout == "Gosper Curve")
	{
		var xMax = 0;
		var xMin = 0;
		var yMax = 0;
		var yMin = 0;
		var verts = gosper(6);
		for (var i = 0; i < NUMBER_COUNT; i++)
		{

			var idx = (reverse) ? (NUMBER_COUNT - 1 - i) : i;
			if (idx < verts.length)
			{
				targets[idx].set(verts[i].x, verts[i].y, 0);
				xMax = Math.max(xMax, verts[i].x);
				xMin = Math.min(xMin, verts[i].x);
				yMax = Math.max(yMax, verts[i].y);
				yMin = Math.min(yMin, verts[i].y);
			}
			else targets[idx].set(0,0,20000);
		}
		console.log(xMax+","+xMin+" "+yMax+","+yMin);

		for (var i = 0; i < NUMBER_COUNT; i++)
		{

			targets[i].x -= (xMax + xMin) / 2;
			targets[i].y -= (yMax + yMin) / 2;
		}
		extraZoomFactor = 1.74;

	}
	else if (layout == "Hilbert 2D Curve")
	{
		var verts = hilbert2D_start();
		for (var i = 0; i < NUMBER_COUNT; i++)
		{

			var idx = (reverse) ? (NUMBER_COUNT - 1 - i) : i;

			if (idx < verts.length) targets[idx].set(verts[i].x, verts[i].y, 0);
			else targets[idx].set(0,0,20000);
		}

	}
	else if (layout == "Hilbert 3D Curve")
	{
		var newTargets = hilbert3D( new THREE.Vector3( 0,0,0 ), 1000.0,4, 0, 1, 2, 3, 4, 5, 6, 7 );
		for (var i = 0; i < NUMBER_COUNT; i++)
		{
			var idx = (reverse) ? (NUMBER_COUNT - 1 - i) : i;
			if (idx >= newTargets.length)
				targets[idx].set(0,0,20000);
			else
				targets[idx].copy(newTargets[i]);
		}
	}


	transitionCount = NUMBER_COUNT;
	transitionIndex = 0;

	new TWEEN.Tween( camera.position )
			.to( { x: 0, y: 0, z:ZOOM_OUT_Z * extraZoomFactor}, 2000 )
			.easing( TWEEN.Easing.Exponential.InOut )
			.start();
}

function setColors()
{
	for (var i = 0; i < NUMBER_COUNT; i++)
	{
		particles.geometry.colors[i].copy(colors[i]);
	}
	particles.geometry.colorsNeedUpdate = true;
}


function highlightDivisors()
{
	for (var i = 0; i < NUMBER_COUNT; i++)
	{
		colors[i].setHSV(0, 0, 1.0 - Math.max(0, 0.33 * (divisors[i] - 1)));
	}
	setColors();
	$("#equationinfo").fadeOut();
}

function clearHighlight()
{
	for (var i = 0; i < NUMBER_COUNT; i++)
	{
		colors[i].setHSV(0, 0, primes[i] ? .8 : .1);
	}
	setColors();
	$("#equationinfo").fadeOut();
}

function doHighlight()
{
	var A = Number(equationA);//Number(equation.split(",")[0]);
	var B = Number(equationB);//Number(equation.split(",")[1]);
	var C = Number(equationC);//Number(equation.split(",")[2]);
	var x = 0;
    var k = qdrt(A,B,C, x);
    var primeCount = 0, compositeCount = 0;
    var divisorTotal = 0;
    while (k <= NUMBER_COUNT && k > 0)
    {
    	//console.log("Highlighting "+k);
    	if (k - Math.floor(k) == 0)
    	{
    		colors[k-1].setHSV(highlightColor.h/360,highlightColor.s,(primes[k-1] == 1) ? .9 : .2);
    		if (primes[k-1]) primeCount++;
    		else compositeCount++;
    		divisorTotal += divisors[k-1];
    	}
    	x++;
    	k = qdrt(A,B,C, x);
    }

    x = -1;
    k = qdrt(A,B,C, x);
    while (k > 0 && k <= NUMBER_COUNT)
    {
    	//console.log("Highlighting "+k);
    	if (k - Math.floor(k) == 0)
    	{
    		colors[k-1].setHSV(highlightColor.h/360,highlightColor.s,(primes[k-1] == 1) ? .9 : .2);
    		if (primes[k-1]) primeCount++;
    		else compositeCount++;
    		divisorTotal += divisors[k-1];
    	}

    	x--;
    	k = qdrt(A,B,C, x);
    }
    setColors();
    divisorTotal /= (compositeCount + primeCount);

    $("#eqninfo_equation").html(A + "x² + "+ B +"x" + " + "+C);
    $("#eqninfo_total").html(NUMBER_COUNT);
    $("#eqninfo_primes").html(primeCount);
    $("#eqninfo_composites").html(compositeCount);
    $("#eqninfo_divisors").html(Math.floor(100 * divisorTotal) / 100);
    if (divisorTotal <= bestDivisorRatio)
    {
    	$("#eqninfo_bestdivisors").html("Best so far.");
    	bestDivisorRatio = divisorTotal;
    }
    else $("#eqninfo_bestdivisors").html("(Best: "+Math.floor(100 * bestDivisorRatio) / 100 +")");

    var primeRatio = primeCount / (primeCount + compositeCount);
    if (primeRatio >= bestPrimeRatio && primeCount + compositeCount > 5)
    {
    	$("#eqninfo_best").html("Best so far.");
    	bestPrimeRatio = primeRatio;
    }
    else $("#eqninfo_best").html("(Best: "+Math.floor(10000 * bestPrimeRatio) / 100 +"%)");
    $("#eqninfo_percent").html(Math.floor(10000 * primeCount / (primeCount + compositeCount)) / 100 );
    $("#equationinfo").fadeIn();
    var hc = new THREE.Color();
    hc.setHSV(highlightColor.h/360, highlightColor.s, highlightColor.v);
    $("#equationinfo").animate({backgroundColor:"#"+hc.getHexString()},500,"swing",function(){
    	$("#equationinfo").animate({backgroundColor:jQuery.Color([ 20, 20, 20, .8 ])},500,"swing");
    })
    if (!equations[A + "x² + "+ B +"x" + " + "+C])
    {
    	equations[(A + "x² + "+ B +"x" + " + "+C)] = A+","+B+","+C;
	    guiFolder.remove(equationControl);
	    equationControl = guiFolder.add(this, 'equation',equations).onChange(onEquationChanged);;
	    equation = equations[(A + "x² + "+ B +"x" + " + "+C)];
	    equationControl.updateDisplay();
	    onEquationChanged();
	    highlightColor.h += Math.random() * 60 + 60;
    	if (highlightColor.h > 360) highlightColor.h -= 360;
    	colorControl.updateDisplay();
    }
}

function gosperAdvance(level, valence)
{
	//console.log(Math.floor(gosperPos.x)+","+Math.floor(gosperPos.y)+" gosperAdvance "+level+" " + valence + " gosperAngle " + Math.floor(gosperAngle * 180 / Math.PI));
	if (level == 0)
	{
		gosperPos.x += Math.cos(gosperAngle) * 13;
		gosperPos.y += Math.sin(gosperAngle) * 13;

		gosperVerts[gosperIdx].x = gosperPos.x;
		gosperVerts[gosperIdx].y = gosperPos.y;
		gosperIdx++;
	}
	else
	{
		if (valence == 1)
		{
			gosperAngle += Math.PI / 3;

			gosperAdvance(level - 1, -1);

			gosperAngle -= Math.PI / 3;

			gosperAdvance(level - 1, 1);
			gosperAdvance(level - 1, 1);

			gosperAngle -= Math.PI / 3;
			gosperAngle -= Math.PI / 3;

			gosperAdvance(level - 1, 1);

			gosperAngle -= Math.PI / 3;

			gosperAdvance(level - 1, -1);

			gosperAngle += Math.PI / 3;
			gosperAngle += Math.PI / 3;

			gosperAdvance(level - 1, -1);

			gosperAngle += Math.PI / 3;

			gosperAdvance(level - 1, 1);
		}
		else
		{
		//	gosperAngle -= Math.PI / 3;
			gosperAdvance(level - 1, -1);
			gosperAngle -= Math.PI / 3;
			gosperAdvance(level - 1, 1);
			gosperAngle -= Math.PI / 3;
			gosperAngle -= Math.PI / 3;
			gosperAdvance(level - 1, 1);
			gosperAngle += Math.PI / 3;
			gosperAdvance(level - 1, -1);
			gosperAngle += Math.PI / 3;
			gosperAngle += Math.PI / 3;
			gosperAdvance(level - 1, -1);
			gosperAdvance(level - 1, -1);
			gosperAngle += Math.PI / 3;
			gosperAdvance(level - 1, 1);
			gosperAngle -= Math.PI / 3;

		}
	}
}
var gosperAngle = 0;
var gosperPos = {x:0,y:0};
var gosperIdx = 0;
var gosperVerts;
function gosper(level)
{
	gosperIdx = gosperAngle = 0;

	var num_verts = Math.pow(7, level) + 1;
	 gosperVerts = new Array();
	 gosperPos = {x:0, y:0};
	for (var i = 0; i < num_verts; i++) gosperVerts.push({x:0,y:0});


		gosperVerts[gosperIdx].x = gosperPos.x;
		gosperVerts[gosperIdx].y = gosperPos.y;
		gosperIdx++;
	var i = 0;

	gosperAdvance(level,1);
	return gosperVerts;

}

var hilbertIdx = 0;
function hilbert2D_start(){

  var DEPTH = 8;
  var SX = [-1,+1,+1,-1]; // corner directions for x
  var SY = [-1,-1,+1,+1]; // corner directions for y
  var SIZE = 1500;          // hilbert curve params

  var verts;
  var num_verts = Math.pow(4,DEPTH);
  if( verts == null || num_verts != verts.length){
    verts = new Array();//new var[num_verts][2];
    for (var i = 0; i < num_verts; i++) verts.push({x:0,y:0});
  }

  // precompute quad corners for each depth
  var SXD = new Array(DEPTH);//var[DEPTH][4];
  var SYD = new Array(DEPTH);//new var[DEPTH][4];
  var s = SIZE/2;
  for(var i = DEPTH-1; i >= 0; i--, s /= 2){
  	SXD[i] = new Array();
  	SYD[i] = new Array();
    for(var j = 0; j < 4; j++){
      SXD[i][j]= SX[j]*s;
      SYD[i][j]= SY[j]*s;
    }
  }
  hilbertIdx = 0;
  hilbert2D(0, 0, DEPTH, 0, 1, 2, 3, SXD, SYD, verts);
  return verts;
}

function hilbert2D(x,  y,  d,  A,  B,  C,  D, SXD, SYD, verts) {
  if (d-- == 0)  {
    verts[hilbertIdx].x = x;
    verts[hilbertIdx].y = y;
    hilbertIdx++;
  } else {
    var X = SXD[d], Y = SYD[d];
    hilbert2D(x + X[A], y + Y[A], d, A, D, C, B, SXD, SYD, verts);
    hilbert2D(x + X[B], y + Y[B], d, A, B, C, D, SXD, SYD, verts);
    hilbert2D(x + X[C], y + Y[C], d, A, B, C, D, SXD, SYD, verts);
    hilbert2D(x + X[D], y + Y[D], d, C, B, A, D, SXD, SYD, verts);
  }
}

function zoomToNumber()
{
	new TWEEN.Tween( camera.position )
			.to( { x: particles.geometry.vertices[number-1].x, y: particles.geometry.vertices[number-1].y, z:ZOOM_OUT_Z/4}, 2000 )
			.easing( TWEEN.Easing.Exponential.InOut )
			.start();
	deselect_2();
	selectedIndex = number - 1;
	particles.geometry.colors[selectedIndex].setHSV(.3,1,1);

}

function divisorCount(n) {
	if (n < 1) return 1;

	var count = 0;
	var end = Math.floor(Math.sqrt(n));
	for (var i = 1; i <= end; i++) {
		if (n % i == 0) {
			count++;
		}
	}
	return count;
}

function leastFactor(n){
 if (isNaN(n) || !isFinite(n)) return NaN;
 if (n==0) return 0;
 if (n%1 || n*n<2) return 1;
 if (n%2==0) return 2;
 if (n%3==0) return 3;
 if (n%5==0) return 5;
 var m = Math.sqrt(n);
 for (var i=7;i<=m;i+=30) {
  if (n%i==0)      return i;
  if (n%(i+4)==0)  return i+4;
  if (n%(i+6)==0)  return i+6;
  if (n%(i+10)==0) return i+10;
  if (n%(i+12)==0) return i+12;
  if (n%(i+16)==0) return i+16;
  if (n%(i+22)==0) return i+22;
  if (n%(i+24)==0) return i+24;
 }
 return n;
}

function isPrime (n) {
 if (isNaN(n) || !isFinite(n) || n%1 || n<2) return false;
 if (n==leastFactor(n)) return true;
 return false;
}

function createCanvasTexture()
{

		canvas.width = 128;
     canvas.height = 128;
     var context = canvas.getContext('2d');
     context.fillStyle = "rgba(255, 255, 255, 1)";
     context.fillRect(0,0,128,128);
     context.fillStyle = "rgba(255, 255, 255, 1)"
     context.font = "8pt Arial";
     context.textAlign = "center";
	// context.fillText("1234", 16, 16);



     var imageData = context.getImageData(0, 0, 1, 1);
     var map = new THREE.Texture(imageData);
     map.minFilter = THREE.NearestFilter;
	 map.magFilter = THREE.NearestFilter;
     map.needsUpdate = true;
     return map;
}

function init() {
	var i;

		canvas = document.createElement( 'canvas' );
		document.body.appendChild(canvas);
		canvas.style.display = "none";

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 33, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = ZOOM_OUT_Z;

	controls = new THREE.ZoomPanControls( camera );
	controls.movementSpeed = 100;
	controls.lookSpeed = 0.5;
	controls.lookVertical = true;
	controls.constrainVertical = true;
	controls.verticalMin = 1.1;
	controls.verticalMax = 2.2;

	scene = new THREE.Scene();
	projector = new THREE.Projector();
	renderer = new THREE.WebGLRenderer( { clearColor: 0x000000, clearAlpha: 1, antialias: false } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.autoClear = false;

	container.appendChild( renderer.domElement );

	var geometry = new THREE.Geometry();
	primes = new Array(NUMBER_COUNT);
	divisors = new Array(NUMBER_COUNT);
	primeSequence = new Array();
	for ( i = 0; i < NUMBER_COUNT; i ++ ) {
		var vertex = new THREE.Vector3();
		vertex.x = Math.random() * 10000 - 5000;
		vertex.y = Math.random() * 10000 - 5000;
		vertex.z = Math.random() * 4000 - 2000;
		var color = new THREE.Color(0xFFFFFF);
		var prime = isPrime(i+1);
		primes[i] = prime ? 1 : 0;
		if (!prime) divisors[i] = divisorCount(i+1);
		else divisors[i] = 1;
		if (prime) primeSequence.push(i);
		color.setHSV(0, 0, prime ? .8 : .1);
		geometry.colors.push( color );
		geometry.vertices.push( vertex );
		colors[i] = new THREE.Color();
		colors[i].copy(color);
	}


	var materials = new THREE.ParticleBasicMaterial( { map:createCanvasTexture(), size: 36, vertexColors:true } );
	materials.color.setHSV( 1, 1, 1);

	particles = new THREE.ParticleSystem( geometry, materials );
	scene.add( particles );


	geometry = new THREE.Geometry();
	var vertex = new THREE.Vector3();
	vertex.x = Math.random() * 10000 - 5000;
	vertex.y = Math.random() * 10000 - 5000;
	vertex.z = Math.random() * 4000 - 2000;
	var color = new THREE.Color(0xFFFFFF);
	color.setHSV(.5, 1, 1);
	geometry.colors.push( color );
	geometry.vertices.push( vertex );
	highlightParticles = new THREE.ParticleSystem( geometry, materials );
	scene.add( highlightParticles );

	var cubeGeom = new THREE.CubeGeometry((NUMBER_COUNT_SQRT * 1.5) * 10,(NUMBER_COUNT_SQRT * 1.5)* 10,1);
	var color = new THREE.Color( Math.random() * 0xffffff );
	cube = new THREE.Mesh( cubeGeom );
	cube.position.x = 0;
	cube.position.y = 0;
	cube.position.z = -1;

	var renderModel = new THREE.RenderPass( scene, camera );
	var effectBloom = new THREE.BloomPass( 1.3 );
	var effectCopy = new THREE.ShaderPass( THREE.CopyShader );

	effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );

	var width = window.innerWidth || 2;
	var height = window.innerHeight || 2;

	effectFXAA.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );

	effectCopy.renderToScreen = true;

	composer = new THREE.EffectComposer( renderer );

	composer.addPass( renderModel );
	//composer.addPass( effectFXAA );
	composer.addPass( effectBloom );
	composer.addPass( effectCopy );

	onLayoutChanged();

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	container.appendChild( stats.domElement );

	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	container.addEventListener( 'mousedown', onMouseDown, false );
	document.addEventListener( 'mousemove', onMouseMove, false );
	document.addEventListener( 'mouseup', onMouseUp, false );
}

function onWindowResize() {

	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
	composer.reset();
}


function applyVertexColors( g, c ) {
		g.faces.forEach( function( f ) {
			var n = ( f instanceof THREE.Face3 ) ? 3 : 4;
			for( var j = 0; j < n; j ++ ) {
				f.vertexColors[ j ] = c;
			}
		} );
	}

function nearestVertex(x, y)
{
	var vx, vy, dist;
	var minDist = 10000, minIndex = 0;
	for (var i = 0; i < NUMBER_COUNT; i++)
	{
		vx = particles.geometry.vertices[i].x;
		vy = particles.geometry.vertices[i].y;

		dist = Math.abs(vx - x) + Math.abs(vy -y);
		if (dist < minDist)
		{
			minIndex = i;
			minDist = dist;
		}
	}
	return minIndex;
}

function qdrt(a,b,c,x)
{
	return a * (x * x) + b * x + c;
}

function highlightCurve(n1, n2, n3)
{
	var nums = new Array(3);
	nums[0] = n1;
	nums[1] = n2;
	nums[2] = n3;

	var pY1 = nums[0];
	var pY2 = nums[1];
	var pY3 = nums[2];
	var pX1 = 0;
	var pX2 = 1;
	var pX3 = 2;

	var A = ((pY2 - pY1) * (pX1 - pX3) +
         (pY3 - pY1) * (pX2 - pX1)) /
        ((pX1 - pX3) * (Math.pow(pX2 , 2) - Math.pow(pX1 , 2)) +
         (pX2 - pX1) * (Math.pow(pX3 , 2) - Math.pow(pX1 , 2)));

    var B = ((pY2 - pY1) - A * (Math.pow(pX2 , 2) - Math.pow(pX1 , 2))) /
         (pX2 - pX1);

    var C = pY1 - A * Math.pow(pX1 , 2) - B * pX1;

    //C -= Math.abs(Math.floor(C / B)) * B;
    var x = 0;
    var k = qdrt(A,B,C, x);
    var primeCount = 0, compositeCount = 0;
     var divisorTotal = 0;
     equationA = A;
     equationB = B;
     equationC = C;
     doHighlight();
     return;
    while (k <= NUMBER_COUNT && k > 0)
    {
    	//console.log("Highlighting "+k);
    	if (k - Math.floor(k) == 0)
    	{
    		colors[k-1].setHSV(highlightColor.h/360,highlightColor.s,(primes[k-1] == 1) ? .9 : .2);
    		if (primes[k-1]) primeCount++;
    		else compositeCount++;
    	//	particles.geometry.colors[k-1].setHSV(.5,1,(primes[k-1] == 1) ? .9 : .2);
    	}
    	x++;
    	k = qdrt(A,B,C, x);
    }

    x = -1;
    k = qdrt(A,B,C, x);
    while (k > 0 && k <= NUMBER_COUNT)
    {
    	//console.log("Highlighting "+k);
    	if (k - Math.floor(k) == 0)
    	{
    		colors[k-1].setHSV(highlightColor.h/360,highlightColor.s,(primes[k-1] == 1) ? .9 : .2);
    		if (primes[k-1]) primeCount++;
    		else compositeCount++;
    	}
    	x--;
    	k = qdrt(A,B,C, x);
    }
    setColors();
    highlightColor.h += Math.random() * 60 + 60;
    if (highlightColor.h > 360) highlightColor.h -= 360;
    colorControl.updateDisplay();
    equations[(A + "x² + "+ B +"x" + " + "+C)] = A+","+B+","+C;
    guiFolder.remove(equationControl);
    equationControl = guiFolder.add(this, 'equation',equations).onChange(onEquationChanged);;
    equation = equations[(A + "x² + "+ B +"x" + " + "+C)];
    equationControl.updateDisplay();
    onEquationChanged();
    console.log(A + "x² + "+ B +"x" + " + "+C);

    $("#eqninfo_equation").html(A + "x² + "+ B +"x" + " + "+C);
    $("#eqninfo_total").html(NUMBER_COUNT);
    $("#eqninfo_primes").html(primeCount);
    $("#eqninfo_composites").html(compositeCount);
    $("#eqninfo_divisors").html(Math.floor(100 * divisorTotal) / 100);
    if (divisorTotal <= bestDivisorRatio)
    {
    	$("#eqninfo_bestdivisors").html("Best so far.");
    	bestDivisorRatio = divisorTotal;
    }
    else $("#eqninfo_bestdivisors").html("(Best: "+Math.floor(100 * bestDivisorRatio) / 100 +"%)");

    var primeRatio = primeCount / (primeCount + compositeCount);
    if (primeRatio >= bestPrimeRatio && primeCount + compositeCount > 5)
    {
    	$("#eqninfo_best").html("Best so far.");
    	bestPrimeRatio = primeRatio;
    }
    else $("#eqninfo_best").html("(Best: "+Math.floor(10000 * bestPrimeRatio) / 100 +"%)");
    $("#eqninfo_percent").html(Math.floor(10000 * primeCount / (primeCount + compositeCount)) / 100 );
    $("#equationinfo").fadeIn();
}

function onKeyDown(event) {
	deselect_2();
}

function onMouseDown(event) {

	var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
	projector.unprojectVector( vector, camera );

	var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

	var intersects = raycaster.intersectObjects( [ cube ] );

	if ( intersects.length > 0 ) {
		var pt = intersects[ 0 ].point;
		selectedIndex = nearestVertex(pt.x, pt.y);

		particles.geometry.colors[selectedIndex].setHSV(highlightColor.h/360,highlightColor.s,primes[selectedIndex] ? .4 : 1);

		dragStartPoint = pt;
		dragStartCameraPosition = cube.position.clone();

		$("#num").html(selectedIndex+1);
		$("#num").css("left", event.clientX - 30);
		$("#num").css("top", event.clientY- 50);
		$("#num").css("display", "block");
		var dontPush = false;
		for (var i = selectedNumbers.length - 1; i >= 0; i--)
		{
			if (selectedNumbers[i] == selectedIndex + 1)
			{
				particles.geometry.colors[selectedNumbers[i]-1].copy(colors[selectedNumbers[i]-1]);
				selectedNumbers.splice(i,1);
				dontPush = true;
			}
		}
		if (!dontPush) selectedNumbers.push(selectedIndex + 1);

		if (selectedNumbers.length == 3)
		{
			selectedNumbers.sort();
			highlightCurve(selectedNumbers[0],selectedNumbers[1],selectedNumbers[2]);
			selectedNumbers = [];
		}
		clearTimeout(deselectTimeout);
		deselectTimeout = setTimeout(deselect, 3000);
		particles.geometry.colorsNeedUpdate = true;
	}

}

function deselect() {
	$("#num").fadeOut('slow', deselect_2);

}

function deselect_2() {
	clearTimeout(deselectTimeout);
	if (selectedIndex != -1)
		particles.geometry.colors[selectedIndex].copy(colors[selectedIndex]);
	selectedIndex = -1;
	for (var i = 0; i < selectedNumbers.length; i++)
	{
		particles.geometry.colors[selectedNumbers[i]-1].copy(colors[selectedNumbers[i]-1]);
	}
	selectedNumbers = [];
	$("#num").css("display", "none");
}

function onMouseMove(event) {
	mouseX = event.clientX;
	mouseY = event.clientY;
}

function updateMouseMove() {
	if (dragStartPoint != null)
	{
		var vector = new THREE.Vector3( ( mouseX / window.innerWidth ) * 2 - 1, - ( mouseY / window.innerHeight ) * 2 + 1, 0.5 );
		projector.unprojectVector( vector, camera );

		var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

		var intersects = raycaster.intersectObjects( [ cube ] );
		if ( intersects.length > 0 ) {
			var pt = intersects[ 0 ].point;


			//console.log("mm oldpt:"+dragStartPoint.x+","+dragStartPoint.y+","+dragStartPoint.z+" intersection:"+pt.x+","+pt.y+","+pt.z+ " delta:"+ (dragStartPoint.x - pt.x)+","+ (dragStartPoint.y - pt.y));
			//dragStartPoint = newDragPoint;
		//	cube.position.x = dragStartCameraPosition.x - (dragStartPoint.x - pt.x);
		//	cube.position.y = dragStartCameraPosition.y - (dragStartPoint.y - pt.y);
		//	particles.position.x = dragStartCameraPosition.x - (dragStartPoint.x - pt.x);
		//	particles.position.y = dragStartCameraPosition.y - (dragStartPoint.y - pt.y);
		if (Math.abs(dragStartPoint.x - pt.x) > 2 || Math.abs(dragStartPoint.y - pt.y) > 2) deselect_2();
		camera.position.x += (dragStartPoint.x - pt.x) / 2;
		camera.position.y += (dragStartPoint.y - pt.y) / 2;
		;
		dragStartPoint = pt;
		}
	}
}

function onMouseUp(event) {
	dragStartPoint = null;
}

// port of Processing Java code by Thomas Diewald
// http://www.openprocessing.org/visuals/?visualID=15599

function hilbert3D( center, side, iterations, v0, v1, v2, v3, v4, v5, v6, v7 ) {

	var half = side / 2,

		vec_s = [

		new THREE.Vector3( center.x - half, center.y + half, center.z - half ),
		new THREE.Vector3( center.x - half, center.y + half, center.z + half ),
		new THREE.Vector3( center.x - half, center.y - half, center.z + half ),
		new THREE.Vector3( center.x - half, center.y - half, center.z - half ),
		new THREE.Vector3( center.x + half, center.y - half, center.z - half ),
		new THREE.Vector3( center.x + half, center.y - half, center.z + half ),
		new THREE.Vector3( center.x + half, center.y + half, center.z + half ),
		new THREE.Vector3( center.x + half, center.y + half, center.z - half )

		],

		vec = [ vec_s[ v0 ], vec_s[ v1 ], vec_s[ v2 ], vec_s[ v3 ], vec_s[ v4 ], vec_s[ v5 ], vec_s[ v6 ], vec_s[ v7 ] ];

	if( --iterations >= 0 ) {

		var tmp = [];

		Array.prototype.push.apply( tmp, hilbert3D ( vec[ 0 ], half, iterations, v0, v3, v4, v7, v6, v5, v2, v1 ) );
		Array.prototype.push.apply( tmp, hilbert3D ( vec[ 1 ], half, iterations, v0, v7, v6, v1, v2, v5, v4, v3 ) );
		Array.prototype.push.apply( tmp, hilbert3D ( vec[ 2 ], half, iterations, v0, v7, v6, v1, v2, v5, v4, v3 ) );
		Array.prototype.push.apply( tmp, hilbert3D ( vec[ 3 ], half, iterations, v2, v3, v0, v1, v6, v7, v4, v5 ) );
		Array.prototype.push.apply( tmp, hilbert3D ( vec[ 4 ], half, iterations, v2, v3, v0, v1, v6, v7, v4, v5 ) );
		Array.prototype.push.apply( tmp, hilbert3D ( vec[ 5 ], half, iterations, v4, v3, v2, v5, v6, v1, v0, v7 ) );
		Array.prototype.push.apply( tmp, hilbert3D ( vec[ 6 ], half, iterations, v4, v3, v2, v5, v6, v1, v0, v7 ) );
		Array.prototype.push.apply( tmp, hilbert3D ( vec[ 7 ], half, iterations, v6, v5, v2, v1, v0, v3, v4, v7 ) );

		return tmp;

	}

	return vec;
}

//
var tweening = false;
function animate() {

	requestAnimationFrame( animate );

	TWEEN.update();
	if (TWEEN.getAll().length > 0)
	{
		particles.geometry.verticesNeedUpdate = true;
		particles.geometry.colorsNeedUpdate = true;
		tweening = true;
	}
	else if (tweening)
	{
		particles.geometry.verticesNeedUpdate = true;
		particles.geometry.colorsNeedUpdate = true;
		tweening = false;
	}

	var delta = clock.getDelta();
	if (transitionCount > 0)
	{
		var newTransitionCount = Math.max(0,transitionCount -  delta * 5000);
		var particleCount = Math.floor(transitionCount) - Math.floor(newTransitionCount);
		transitionCount = newTransitionCount;
		particles.position.z = -2.5;
		for (var i = 0; i < particleCount; i++)
		{
			particles.geometry.colors[transitionIndex].copy(colors[transitionIndex]);
			new TWEEN.Tween( particles.geometry.vertices[transitionIndex] )
			.to( { x: targets[transitionIndex].x, y: targets[transitionIndex].y, z: targets[transitionIndex].z + 2 }, 500 )
			.easing( TWEEN.Easing.Exponential.InOut )
			.start();
			transitionIndex++;
		}

		if (transitionIndex == NUMBER_COUNT)
		{
			for (var i = 0; i < NUMBER_COUNT; i++)
			{
				particles.geometry.vertices[i].z = targets[i].z;
			}
			particles.position.z = -.5;
		}
	}
	var oldHighlightIndex = highlightIndex;
	highlightIndex = (highlightIndex + 1) % 256;
	if (pulseEnabled)
	{
		highlightParticles.geometry.vertices[0].copy(particles.geometry.vertices[highlightIndex]);
		highlightParticles.geometry.vertices[0].z ++;
		highlightParticles.geometry.verticesNeedUpdate = true;
	}
	render(delta);

	stats.update();
}

function render(delta) {

	controls.update( delta );

	updateMouseMove();

	camera.position.x = Math.max(Math.min(camera.position.x, maxX), minX);
	camera.position.y = Math.max(Math.min(camera.position.y, maxY), minY);
	camera.position.z = Math.max(Math.min(camera.position.z, maxZ), minZ);

	renderer.clear();
	composer.render();

}
