var canvas;
var gl;

var numVertices  = 36;

var movement = false;     // Do we rotate?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var zDist = -30.0;

var pointsArray = [];
var colorArray = [];

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
];

var vertexColors = [
    [0.0, 0.0, 0.0, 1.0],  // black
    [1.0, 0.0, 0.0, 1.0],  // red
    [1.0, 1.0, 0.0, 1.0],  // yellow
    [0.0, 1.0, 0.0, 1.0],  // green
    [0.0, 0.0, 1.0, 1.0],  // blue
    [1.0, 0.0, 1.0, 1.0],  // magenta
    [0.0, 1.0, 1.0, 1.0],  // cyan
    [1.0, 1.0, 1.0, 1.0]   // white
];


// Parameters controlling the size of the Robot's arm

var UPendul_height = 6;
var UPendul_width = 0.5;
var LPendul_height = 6;
var LPendul_width = 0.5;


// Array of rotation angles (in degrees) for each rotation axis

var UPendul= 0;
var LPendul = 1;

// ekki rétt :(:())
let upperArmMaxAngle = 70;
let upperArmMovement = 1;

let lowerArmMaxAngle = 50;
let lowerArmMovement = 0.2;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var theta = [0, 0];
var vBuffer, cBuffer;


function quad(  a,  b,  c,  d ) {
    colorArray.push(vertexColors[a]); 
    pointsArray.push(vertices[a]); 
    colorArray.push(vertexColors[a]); 
    pointsArray.push(vertices[b]); 
    colorArray.push(vertexColors[a]); 
    pointsArray.push(vertices[c]);
    colorArray.push(vertexColors[a]); 
    pointsArray.push(vertices[a]); 
    colorArray.push(vertexColors[a]); 
    pointsArray.push(vertices[c]); 
    colorArray.push(vertexColors[a]); 
    pointsArray.push(vertices[d]); 
}


function colorCube() {
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    colorCube();

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorArray), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor);

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );

    projectionMatrix = perspective( 60.0, 1.0, 0.1, 100.0 );
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );

    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.clientX;
        origY = e.clientY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY = ( spinY + (e.clientX - origX) ) % 360;
            spinX = ( spinX + (origY - e.clientY) ) % 360;
            origX = e.clientX;
            origY = e.clientY;
        }
    } );
    
    // Event listener for mousewheel
     window.addEventListener("wheel", function(e){
         if( e.deltaY > 0.0 ) {
             zDist += 0.2;
         } else {
             zDist -= 0.2;
         }
     }  );  

    render();
}



function upperPendul()
{
    var s = scalem(UPendul_width, UPendul_height, UPendul_width);
    var instanceMatrix = mult( translate( 0.0, 0.5 * UPendul_height, 0.0), s)
    var t = mult(modelViewMatrix, instanceMatrix);

    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
}
function lowerPendul()
{
    let s = scalem(LPendul_width, LPendul_height, LPendul_width);
    let instanceMatrix = mult(translate( 0.0, 0.5 * LPendul_height, 0.0 ), s);
    var t = lowerPend = mult(modelViewMatrix, instanceMatrix);

    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
}


function render(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    if(theta[UPendul] > lowerArmMaxAngle || theta[UPendul] < -lowerArmMaxAngle){lowerArmMovement *= -1; }
    if(theta[LPendul] > upperArmMaxAngle || theta[LPendul] < -upperArmMaxAngle){upperArmMovement *= -1;}

    // Snúa pendúl.
    theta[UPendul] += lowerArmMovement;
    theta[LPendul] += upperArmMovement;

    let mv = lookAt( vec3(0.0, 2.0, zDist), vec3(0.0, 2.0, 0.0), vec3(0.0, 1.0, 0.0) );
    mv = mult( mv, rotateX( spinX ) );
    mv = mult( mv, rotateY( spinY ) );


     // Búa til vörpunarfylki fyrir efri hluta.
     modelViewMatrix = mult(mv, translate(0.0, UPendul_height, 0.0));
     modelViewMatrix = mult(modelViewMatrix, rotate( theta[UPendul],0,0,1 ));
     //modelViewMatrix = mult(modelViewMatrix, translate(0.0, -(UPendul_height * 0.5), 0.0));
     upperPendul();
 
     // Búa til vörpunarfylki fyrir neðri hluta.
     modelViewMatrix  = mult(modelViewMatrix, translate(0.0,LPendul_height, 0.0));
     modelViewMatrix  = mult(modelViewMatrix, rotateZ( theta[LPendul],0,0,1 ) );
     //modelViewMatrix  = mult(modelViewMatrix, translate(0.0, -LPendul_height, 0.0));
     lowerPendul();


    requestAnimationFrame(render);
}