/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Sýnir notkun á lyklaborðsatburðum til að hreyfa spaða
//
//    Hjálmtýr Hafsteinsson, september 2023
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var xmove;
var ymove;

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var vertices = [
        vec2( 0,    -0.7 ),
        vec2( -0.1, -0.9 ),
        vec2( 0.1,  -0.9 )
    ];
    
    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Event listener for keyboard
    window.addEventListener("keydown", function(e){
        console.log(vertices)
        xmove = 0
        ymove = 0
        switch( e.code ) {
            case "ArrowUp":
                ymove = 0.04;

                break;
            case "ArrowLeft":	// vinstri ör
                xmove = -0.04;
                break;
            case "ArrowRight":	// hægri ör
                xmove = 0.04;
                
                break;
            case "ArrowDown":
                ymove = -0.04;
                break;
            default:
                xmove = 0.0;
                ymove = 0.0;
        }
        for(i=0; i<3; i++) {
            vertices[i][0] += xmove;
            console.log(ymove)
            vertices[i][1] += ymove;
            console.log(ymove)

        }

        console.log(vertices)
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
    } );

    render();
}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, 3 );

    window.requestAnimationFrame(render);
}
