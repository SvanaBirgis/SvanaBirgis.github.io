"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 4; // Adjust this value as needed

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    //
    //  Initialize our data for the Sierpinski Carpet
    //

    // First, initialize the square that will be the base of our carpet.

    var vertices = [
        vec2(-0.5, -0.5),
        vec2(-0.5, 0.5),
        vec2(0.5, 0.5),
        vec2(0.5, -0.5)
    ];

    divideSquare(vertices[0], vertices[1], vertices[2], vertices[3],
        NumTimesToSubdivide);

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.75, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    render();
};

function square(a, b, c, d) {
    points.push(a, b, c);
    points.push(a, c, d);
}

function divideSquare(a, b, c, d, count) {
    if (count === 0) {
        square(a, b, c, d);
    } else {
        var midAB = mix(a, b, 0.5);
        var midBC = mix(b, c, 0.5);
        var midCD = mix(c, d, 0.5);
        var midDA = mix(d, a, 0.5);
        var center = mix(midAB, midCD, 0.5);

        --count;

        // Carve out the middle square
        divideSquare(a, midAB, center, midDA, count);
        divideSquare(midAB, b, midBC, center, count);
        divideSquare(center, midBC, c, midCD, count);
        divideSquare(midDA, center, midCD, d, count);
        
        // Carve out the middle square
        divideSquare(midAB, midBC, midCD, midDA, count);
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
}