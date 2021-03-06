      var SEPARATION = 100, AMOUNTX = 50, AMOUNTY = 50;

      var container, stats;
      var camera, scene, renderer;

      var particles, particle, count = 0;

      var mouseX = 0, mouseY = 0;

      var windowHalfX = window.innerWidth / 2;
      var windowHalfY = window.innerHeight / 2;

      init();
      animate();

      /* DRAWING DEFAULT */
      function draw(context){
        context.beginPath();
        context.arc( 0, 0, 1, 0, Math.PI * 2, true );
        context.fill();
      }

      /* DRAWING FACE 
      function draw(context){
        context.beginPath();
          context.arc(75,75,50,0,Math.PI*2,true); // Outer circle
          context.moveTo(110,75);
          context.arc(75,75,35,0,Math.PI,false);   // Mouth (clockwise)
        context.moveTo(65,65);
        context.arc(60,65,5,0,Math.PI*2,true);  // Left eye
        context.moveTo(95,65);
        ctx.arc(90,65,5,0,Math.PI*2,true);  // Right eye
        context.stroke();  
      }*/

      /* DRAWING HEARTS
      function draw(context){
        context.beginPath();
        context.rotate(Math.PI);
        context.moveTo(75,40);
        context.bezierCurveTo(75,37,70,25,50,25);
        context.bezierCurveTo(20,25,20,62.5,20,62.5);
        context.bezierCurveTo(20,80,40,102,75,120);
        context.bezierCurveTo(110,102,130,80,130,62.5);
        context.bezierCurveTo(130,62.5,130,25,100,25);
        context.bezierCurveTo(85,25,75,37,75,40);

        context.fill();
      }*/

      function init() {

        container = document.createElement( 'div' );
        document.body.appendChild( container );

        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.z = 1000;

        scene = new THREE.Scene();

        particles = new Array();

        var PI2 = Math.PI * 2;
        var material = new THREE.ParticleCanvasMaterial( {

          color: 0xffffff,
          movement: false,
          program: function ( context ) {
            draw(context);
          }

        } );

        var i = 0,
          program = function (context){
            draw(context);
          }

        for ( var ix = 0; ix < AMOUNTX; ix ++ ) {

          for ( var iy = 0; iy < AMOUNTY; iy ++ ) {

            particle = particles[ i ++ ] = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: Math.random() * 0x808008 + 0x808080, program: program }));
            particle.position.x = ix * SEPARATION - ( ( AMOUNTX * SEPARATION ) / 2 );
            particle.position.z = iy * SEPARATION - ( ( AMOUNTY * SEPARATION ) / 2 );

            particle.animation = {
              mov : {
                unit_x : 0,
                unit_y : 0,
                unit_z : 0
              },

              target : {
                x : 0,
                y : 0,
                z : 0
              },

              isTranslated : false
            }

            particle.isTranslated = false;

            scene.add( particle );

          }

        }

        renderer = new THREE.CanvasRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        container.appendChild( renderer.domElement );

        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        container.appendChild( stats.domElement );

        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
        document.addEventListener( 'touchstart', onDocumentTouchStart, false );
        document.addEventListener( 'touchmove', onDocumentTouchMove, false );

        //

        window.addEventListener( 'resize', onWindowResize, false );
      }

      function onWindowResize() {

        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

      }

      //

      function onDocumentMouseMove( event ) {

        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;

      }

      function onDocumentTouchStart( event ) {

        if ( event.touches.length === 1 ) {

          event.preventDefault();

          mouseX = event.touches[ 0 ].pageX - windowHalfX;
          mouseY = event.touches[ 0 ].pageY - windowHalfY;

        }

      }

      function onDocumentTouchMove( event ) {

        if ( event.touches.length === 1 ) {

          event.preventDefault();

          mouseX = event.touches[ 0 ].pageX - windowHalfX;
          mouseY = event.touches[ 0 ].pageY - windowHalfY;

        }

      }

      
      var state = 0,
        stp = false;
      function animate() {

        requestAnimationFrame( animate );

        if (state === 0){
          render();
          
        }else if (state === 1){
          render1();

        }else if (state === 2){
          if (!stp){
            for ( var i = 0, ix = 0; ix < AMOUNTX; ix ++ ) {
              for ( var iy = 0; iy < AMOUNTY; iy ++ ) {

                particle = particles[ i++ ];

                var target = {
                  x : globalX,
                  y : globalY,
                  z : 0
                };

                particle.moveTo(target,10000);

                stp = true;

              }

            }
          }

          render1();
        }else {
          render();
        }

        stats.update();

      }

      function render() {
        camera.position.x += ( mouseX - camera.position.x ) * .05;
        camera.position.y += ( - mouseY - camera.position.y ) * .05;
        camera.lookAt( scene.position );

        var i = 0;

        for ( var ix = 0; ix < AMOUNTX; ix ++ ) {

          for ( var iy = 0; iy < AMOUNTY; iy ++ ) {

            particle = particles[ i++ ];

            //particle.position.x = ix + Math.cos(count) * 50;
            //particle.position.y = iy + Math.sin(count) * 50;

            particle.position.y = ( Math.sin( ( ix + count ) * 0.3 ) * 50 ) + ( Math.sin( ( iy + count ) * 0.5 ) * 50 );
            particle.scale.x = particle.scale.y = ( Math.sin( ( ix + count ) * 0.3 ) + 1 ) * 2 + ( Math.sin( ( iy + count ) * 0.5 ) + 1 ) * 2;

            /*if ( ix % 2 === 0 ){
              particle.material.color.r = 0;
              particle.material.color.g = 0;
              particle.material.color.b = 0;
            }else if ( iy < AMOUNTY/2 ){
              particle.material.color.r = 1;
              particle.material.color.g = 0;
              particle.material.color.b = 0;
            }else{
              particle.material.color.r = 1;
              particle.material.color.g = 1;
              particle.material.color.b = 1;
            }*/

          }

        }
        renderer.render( scene, camera );

        count += 0.1;

      }

      Object.prototype.isTranslated = function(){
        return this.isTranslated;
      }


      Object.prototype.moveTo = function(target,milliseconds){
        var fps = 1000/60,
          unit_x = parseFloat(target.x) - parseFloat(this.position.x),
          unit_y = parseFloat(target.y) - parseFloat(this.position.y),
          unit_z = parseFloat(target.z) - parseFloat(this.position.z);

        milliseconds /= 1000;
        this.animation.isTranslated = true;
        this.animation.mov.unit_x = ( unit_x / ( fps * milliseconds) );
        this.animation.mov.unit_y = ( unit_y / ( fps * milliseconds) );
        this.animation.mov.unit_z = ( unit_z / ( fps * milliseconds) );
        this.animation.target.x = target.x;
        this.animation.target.y = target.y;
        this.animation.target.z = target.z;
        //console.log('POSITION : '+i+' -> '+this.position.x+' '+this.position.y+' '+this.position.z+' | TARGET : '+this.animation.target.x+' '+this.animation.target.y+' '+this.animation.target.z);
        //console.log('UNIT : '+i+' -> '+this.animation.mov.unit_x+' '+this.animation.mov.unit_y+' '+this.animation.mov.unit_z);
      }

      function render1() {
        camera.position.x += ( mouseX - camera.position.x ) * .05;
        camera.position.y += ( - mouseY - camera.position.y ) * .05;
        camera.lookAt( scene.position );

        var i = 0;

        for ( var ix = 0; ix < AMOUNTX; ix ++ ) {

          for ( var iy = 0; iy < AMOUNTY; iy ++ ) {

            particle = particles[ i++ ];

            //particle.position.y = Math.sin(count) * 50;
            //particle.scale.x = Math.cos(count) * 50;
            if ( !!particle.animation.isTranslated ){
              if ( particle.position.x !== particle.animation.target.x && 
                  particle.position.y !== particle.animation.target.y &&
                  particle.position.z !== particle.animation.target.z ) {

                particle.position.x =  parseFloat(particle.position.x) + parseFloat(particle.animation.mov.unit_x);
                particle.position.y =  parseFloat(particle.position.y) + parseFloat(particle.animation.mov.unit_y);
                particle.position.z =  parseFloat(particle.position.z) + parseFloat(particle.animation.mov.unit_z);
              }else{
                particle.animation.isTranslated = false;
                console.log(i+' '+false);
              }
            }else{
              particle.position.y = ( Math.sin( ( ix + count ) * 0.3 ) * 50 ) + ( Math.sin( ( iy + count ) * 0.5 ) * 50 );
            }

            particle.scale.x = particle.scale.y = ( Math.sin( ( ix + count ) * 0.3 ) + 1 ) * 2 + ( Math.sin( ( iy + count ) * 0.5 ) + 1 ) * 2;

          
            particle.material.color.r = 1;
            particle.material.color.g = 1;
            particle.material.color.b = 1;
          

          }

        }

        renderer.render( scene, camera );

        count += 0.2;

      }

      document.onclick=function(e){
        state = (state + 1);
        //globalX  = e.clientX;
        //globalY = e.clientY;
        globalX = e.clientX - camera.position.x;
        globalY = e.clientY - camera.position.y;
      };

      /*(function timer() { 
        setTimeout(function(){
          state++;
          timer();
        },8000);
      })();*/