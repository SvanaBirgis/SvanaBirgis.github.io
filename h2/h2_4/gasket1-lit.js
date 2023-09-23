/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Sýnir hvernig hægt er að breyta lit með uniform breytu
//
//    Hjálmtýr Hafsteinsson, ágúst 2023
/////////////////////////////////////////////////////////////////
var gl;
var points = [];

var colorLoc;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.
   
    for ( let i = 0; i < 100; i++){
        const x = Math.random() * 2 - 1; // Random x between -1 and 1
        const y = Math.random() * 2 - 1; 
        points.push(
            vec2( x - 0.1, y - 0.1 ),
            vec2( x , y + 0.1 ),
            vec2( x + 0.1, y - 0.1 )
        );
    };
    
    // Compute new points
    // Each new point is located midway between
    // last point and a randomly chosen vertex



    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Find the location of the variable fColor in the shader program
    colorLoc = gl.getUniformLocation( program, "color" );
    offsetLoc = gl.getUniformLocation( program, "offset" );
    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

	// Setjum litinn sem rauðann og teiknum helming punktanna
    for (let i = 0; i < 100; i++) {
        gl.uniform4fv( colorLoc, vec4(Math.random(), Math.random(), Math.random(), 1) );
        gl.uniform2fv( offsetLoc, points.slice(i, i+3));
        gl.drawArrays( gl.TRIANGLES, 3*i, 3 );
    }

}