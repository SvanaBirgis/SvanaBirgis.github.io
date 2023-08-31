"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 5;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2(-1, -1),
        vec2(-1, 1),
        vec2(1, 1),
        vec2(1, -1)
    ];

    divideSquare( vertices[0], vertices[1], vertices[2], vertices[3],
                    NumTimesToSubdivide);

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

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function square( a, b, c ,d)
{
    points.push( a, b, c );
    points.push( b, c, d );
    points.push( a, b, d );
}

function divideSquare( a, b, c, d, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        square( a, b, c, d );
    }
    else {

        //bisect the sides

        var AAB = mix(a, b, 1/3);
        var ABB = mix(b, a, 1/3);
        var BCC = mix(c, b, 1/3);
        var BBC = mix(b, c, 1/3);
        var CCD = mix(c, d, 1/3);
        var CDD = mix(d, c, 1/3);
        var DDA = mix(d, a, 1/3);
        var DAA = mix(a, d, 1/3);
        var AABCDD = mix(AAB, CDD, 1/3);
        var ABBCCD = mix(ABB, CCD, 1/3);
        var AABCDD2 = mix(CDD, AAB, 1/3);
        var ABBCCD2 = mix(CCD, ABB, 1/3);


        --count;

        // átta nýjir kassar

        divideSquare(a, AAB, AABCDD, DAA, count);
        divideSquare(AAB, ABB, ABBCCD, AABCDD, count);
        divideSquare(b, BBC, ABBCCD, ABB, count);
        divideSquare(BBC, BCC, ABBCCD2, ABBCCD, count);
        divideSquare(c, CCD, ABBCCD2, BCC, count);
        divideSquare(CCD, CDD, AABCDD2, ABBCCD2, count);
        divideSquare(d, DDA, AABCDD2, CDD, count);
        divideSquare(DAA, AABCDD, AABCDD2, DDA, count);
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}