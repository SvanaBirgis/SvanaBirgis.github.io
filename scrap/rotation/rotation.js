var gl;
var canvas;

var colorFrog;
var locFrog;

var a = vec2( 0,   -0.9 );
var b = vec2(-0.1, -1 );
var c = vec2( 0.1, -1 );
var vertices = [a,b,c];
var theta = 1.5708;
var x0 = (a[0]+b[0]+c[0])/3;
var y0 = (a[1]+b[1]+c[1])/3;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //var vertices = new Float32Array([-0.1, -1, 0, -0.8, 0.1, -1]);

    //  Configure WebGL

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.75, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    colorFrog = gl.getUniformLocation( program, "color" );
    locFrog = gl.getUniformLocation( program , "frog");


    

    render();

}


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.uniform4fv( colorFrog, vec4(0,0.68,0, 1) );
    gl.drawArrays( gl.TRIANGLES, 0, 3 );

    window.requestAnimationFrame(render);
}