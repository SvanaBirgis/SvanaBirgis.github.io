var canvas;
var gl;

var NumVertices  = 9;
var NumBody = 6;
var NumTail = 3;
var NumFins = 3;

// Hn�tar fisks � xy-planinu
var vertices = [
    // l�kami (spjald)
    vec4( -0.5,  0.0, 0.0, 1.0 ),
	vec4(  0.2,  0.2, 0.0, 1.0 ),
	vec4(  0.5,  0.0, 0.0, 1.0 ),
	vec4(  0.5,  0.0, 0.0, 1.0 ),
	vec4(  0.2, -0.15, 0.0, 1.0 ),
	vec4( -0.5,  0.0, 0.0, 1.0 ),
	// spor�ur (�r�hyrningur)
    vec4( -0.5,  0.0, 0.0, 1.0 ),
    vec4( -0.65,  0.15, 0.0, 1.0 ),
    vec4( -0.65, -0.15, 0.0, 1.0 ),
    // uggi
    vec4(0.0, 0.0, 0.0, 1.0),
    vec4(0.1, 0.15, 0.0, 1.0),
    vec4(-0.1, 0.15, 0.0, 1.0),
];



var box = [
    vec4(-10, 10, -10, 1.0),
    vec4(-10, -10, -10, 1.0),
    vec4(10, -10, -10, 1.0),
    vec4(10, 10, -10, 1.0),
    vec4(-10, 10, -10, 1.0),
    vec4(-10, 10, 10, 1.0),
    vec4(-10, -10, 10, 1.0),
    vec4(10, -10, 10, 1.0),
    vec4(10, 10, 10, 1.0),
    vec4(-10, 10, 10, 1.0),
    vec4(-10, -10, 10, 1.0),
    vec4(-10, -10, -10, 1.0),
    vec4(10, -10, -10, 1.0),
    vec4(10, -10, 10, 1.0),
    vec4(10, 10, 10, 1.0),
    vec4(10, 10, -10, 1.0),

];


var movement = false;     // Er m�sarhnappur ni�ri?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var rotTail = 0.0;        // Sn�ningshorn spor�s
var incTail = 2.0;        // Breyting � sn�ningshorni

var rotFin = 0.0;        // Sn�ningshorn ugga
var incFin = 2.0;        // Breyting � sn�ningshorni

var zView = 2.0;          // Sta�setning �horfanda � z-hniti

var proLoc;
var mvLoc;
var colorLoc;




// Litur á fisk
let fishColor = [ Math.random(), Math.random(), Math.random(), 1.0];


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.95, 1.0, 1.0, 1.0 );
 
    gl.enable(gl.DEPTH_TEST);
 
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    //gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    colorLoc = gl.getUniformLocation( program, "fColor" );

    proLoc = gl.getUniformLocation( program, "projection" );
    mvLoc = gl.getUniformLocation( program, "modelview" );

    // Setjum ofanvarpsfylki h�r � upphafi
    var proj = perspective( 90.0, 1.0, 0.1, 100.0 );
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));
    

    // Atbur�af�ll fyrir m�s
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY += (e.offsetX - origX) % 360;
            spinX += (e.offsetY - origY) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );
    
    // Atbur�afall fyrir lyklabor�
     window.addEventListener("keydown", function(e){
         switch( e.keyCode ) {
            case 38:	// upp �r
                zView -= 0.2;
                break;
            case 40:	// ni�ur �r
                zView += 0.2;
                break;
         }
     }  );  

    // Atbur�afall fyri m�sarhj�l
     window.addEventListener("mousewheel", function(e){
         if( e.wheelDelta > 0.0 ) {
             zView += 0.2;
         } else {
             zView -= 0.2;
         }
     }  );  

    render();
}

var fishData = []; 

// Function fyrir random lit og átt
function generateRandomFishData(numFish) {
    fishData = []; 
    for (var i = 0; i < numFish; i++) {
        
        var x = Math.random() * 20 - 10; 
        var y = Math.random() * 20 - 10; 
        var z = Math.random() * 20 - 10; 
        

        var color = [Math.random(), Math.random(), Math.random(), 1.0];
        
        var speed = 0.001 + Math.random() * 0.03;
        
        fishData.push({ x, y, z, color, speed });
    }
}


generateRandomFishData(100); 


function updateFishPositions() {
    for (var i = 0; i < fishData.length; i++) {
        var fish = fishData[i];

        // Generate random direction vector
        if (!fish.direction) {
            fish.direction = vec3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
            //fish.direction = vec3(2, 3, 0);
        }

        fish.direction = normalize(fish.direction);

        fish.x += fish.speed * fish.direction[0];
        fish.y += fish.speed * fish.direction[1];
        fish.z += fish.speed * fish.direction[2];
        

        if (Math.abs(fish.x) >= 10) {
            fish.x *= -1;
        }
        if (Math.abs(fish.y) >= 10) {
            fish.y *= -1;
        }
        if (Math.abs(fish.z) >= 10) {
            fish.z *= -1;
        }
    }
}

function unNaN(x) {
    if (isNaN(x)) {
        return 0;
    }

    return x;
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    updateFishPositions();

    var mv = lookAt( vec3(0.0, 0.0, zView), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0) );
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) );

    // Box
    gl.bufferData( gl.ARRAY_BUFFER, flatten(box), gl.STATIC_DRAW );
    gl.uniform4fv( colorLoc, vec4(0.0, 0.0, 0.0, 1.0) );
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
    gl.drawArrays(gl.LINE_STRIP, 0, 16);  

    
    // Fiskur
    
      
    rotTail += incTail;
        if( rotTail > 35.0  || rotTail < -35.0 )
            incTail *= -1;

    for (var i = 0; i < fishData.length; i++) {
        var fish = fishData[i];
        var mvFish = mv;
        
        // assume direction vector is normalized (normalize just in case)
        var dir = normalize(fish.direction);
        
        var angleX = 0;
        var angleY = Math.atan2(Math.sqrt(Math.pow(dir[0], 2) + Math.pow(dir[1], 2)), dir[2]);
        var angleZ = Math.atan2(dir[1], dir[0]) * 180 / Math.PI;

        angleX = unNaN(angleX);
        angleY = unNaN(angleY);
        angleZ = unNaN(angleZ);

       

        if (i==0) {
            console.log(fish.direction, angleX, angleY, angleZ);
        }

        mvFish = mult(mvFish, translate(fish.x, fish.y, fish.z));

 
        mvFish = mult(mvFish, rotateX(angleX));
        mvFish = mult(mvFish, rotateY(angleY));
        mvFish = mult(mvFish, rotateZ(angleZ));
        
        //Random litur fyrir fiska
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
        gl.uniform4fv(colorLoc, vec4(fish.color[0], fish.color[1], fish.color[2], fish.color[3]));
        
        
        // Teikna l�kama fisks (�n sn�nings)
        gl.uniformMatrix4fv(mvLoc, false, flatten(mvFish));
        gl.drawArrays(gl.TRIANGLES, 0, NumBody);


        // Teikna spor� og sn�a honum
        var mv_tail = mvFish;
        mv_tail = mult( mv_tail, translate ( -0.5, 0.0, 0.0 ) );
        mv_tail = mult( mv_tail, rotateY( rotTail ) );
        mv_tail = mult( mv_tail, translate ( 0.5, 0.0, 0.0 ) );
        gl.uniformMatrix4fv(mvLoc, false, flatten(mv_tail));
        gl.drawArrays( gl.TRIANGLES, NumBody, NumTail );

        var mv_l = mvFish;
        mv_l = mult( mv_l, translate ( -0.05, 0.0, 0 ) );
        mv_l = mult(mv_l, rotateZ(90));
        mv_l = mult(mv_l, rotateX(45 + 0.5 * rotTail));
        mv_l = mult( mv_l, translate ( 0.05, 0.0, 0 ) );

        gl.uniformMatrix4fv(mvLoc, false, flatten(mv_l));
        gl.drawArrays( gl.TRIANGLES, NumBody+NumTail, NumFins );

        var mv_r = mvFish;
        mv_r = mult( mv_r, translate ( -0.05, 0.0, 0.0 ) );;
        mv_r = mult(mv_r, rotateZ(90));
        mv_r = mult(mv_r, rotateX(-45 - 0.5 * rotTail));
        mv_r = mult( mv_r, translate ( 0.05, 0.0, 0.0 ) );


        gl.uniformMatrix4fv(mvLoc, false, flatten(mv_r));
        gl.drawArrays( gl.TRIANGLES, NumBody+NumTail, NumFins );

    }
    window.requestAnimationFrame(render);
}
