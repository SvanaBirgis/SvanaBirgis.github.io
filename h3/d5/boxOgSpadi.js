var canvas;
var gl;

var locColor;
var spadi;

// Núverandi staðsetning miðju ferningsins
var box = vec2( 0.0, 0.0 );
var spade = vec2( 0.0, 0.0 );

// Stefna (og hraði) fernings
var dX;
var dY;

// Svæðið er frá -maxX til maxX og -maxY til maxY
var maxX = 1.0;
var maxY = 1.0;

// Hálf breidd/hæð ferningsins
var boxRad = 0.05;

// Ferningurinn er upphaflega í miðjunni
var vertices = new Float32Array([-boxRad, -boxRad, boxRad, -boxRad, boxRad, boxRad, -boxRad, boxRad]);


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

        // Gefa ferningnum slembistefnu í upphafi
    dX = Math.random()*0.1-0.05;
    dY = Math.random()*0.1-0.05;

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    spadi = [
        vec2( -0.1, -0.9 ),
        vec2( -0.1, -0.86 ),
        vec2(  0.1, -0.86 ),
        vec2(  0.1, -0.9 ) 
    ];
    
    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    locColor = gl.getUniformLocation( program, "fColor");

    locPos = gl.getUniformLocation( program, "pos" );

    // Event listener for keyboard
    window.addEventListener("keydown", function(e){
        switch( e.key ) {
            case "ArrowLeft":	// vinstri ör
                xmove = -0.1;
                break;
            case "ArrowRight":	// hægri ör
                xmove = 0.1;
                break;
            case "ArrowUp": // Auka hraða kassans;
                dX *= 1.1;
                dY *= 1.1;
                xmove = 0.0;
                break;
            case "ArrowDown": // Minnka hraða kassans.
                dX /= 1.1;
                dY /= 1.1;
                xmove = 0.0;
                break;
            default:
                xmove = 0.0;
        }
        //spade[0] += xmove;
        for(i=0; i<4; i++) {
            spadi[i][0] += xmove;
        }

        //gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(spadi));
    } );

    render();
}

function collision(){

    if (dY > 0) return;

    if (box[0] + boxRad >= spadi[0][0] &&
        box[1] - boxRad <= spadi[1][1] &&
        box[0] - boxRad <= spadi[2][0] &&
        box[1] - boxRad <= spadi[3][1]) {

        dY = -dY; 
    }
}

function renderSpadi(){
    gl.bufferData( gl.ARRAY_BUFFER, flatten(spadi), gl.DYNAMIC_DRAW );
    gl.uniform4fv(locColor, vec4(0, 0, 0, 1));
    gl.uniform2fv( locPos, flatten(spade) );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

}

function renderBox(){
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW );
     
    // Láta ferninginn skoppa af veggjunum
    if (Math.abs(box[0] + dX) > maxX - boxRad) dX = -dX;
    if (Math.abs(box[1] + dY) > maxY - boxRad) dY = -dY;

    // Uppfæra staðsetningu
    box[0] += dX;
    box[1] += dY;
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    //
    gl.uniform2fv( locPos, flatten(box) );

    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    
    collision();

    renderBox();
    renderSpadi();
    

    window.requestAnimFrame(render);
}