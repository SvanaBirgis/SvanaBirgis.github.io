var canvas;
var gl;

var sideWalkBuffer;
var colorA = vec4(0,0,0,1);
var carBuffer;
var colorB = vec4(1,0,0,1);
var frogBuffer;
var colorC = vec4(0,1,0,1)
var vPosition;
var vertices = [
    vec2( 0,   -0.8 ),
    vec2( 0.1, -0.9 ),
    vec2(-0.1, -0.9 )];
var sideWalk = [];
var cars = [];
var color;
var carDir;
var car1 = [];

function generateCars(n){
    for(let i = 0; i < n; i++){
        cars.push(
            // first street
            // car1 = [
            vec2(0.9+i*0.7, -0.6),
            vec2(0.9+i*0.7, -0.7),
            vec2(0.7+i*0.7, -0.6),
            vec2(0.7+i*0.7, -0.6),
            vec2(0.7+i*0.7, -0.7),
            vec2(0.9+i*0.7, -0.7),
            // ],
            // second street
            vec2(0.9+i*0.7, -0.4),
            vec2(0.9+i*0.7, -0.5),
            vec2(0.7+i*0.7, -0.5),
            vec2(0.7+i*0.7, -0.5),
            vec2(0.7+i*0.7, -0.4),
            vec2(0.9+i*0.7, -0.4),

            // third street
            vec2(0.9+i*0.7, -0.2),
            vec2(0.9+i*0.7, -0.3),
            vec2(0.7+i*0.7, -0.2),
            vec2(0.7+i*0.7, -0.2),
            vec2(0.7+i*0.7, -0.3),
            vec2(0.9+i*0.7, -0.3),

            // fourth street
            vec2(0.9+i*0.7, 0.2),
            vec2(0.9+i*0.7, 0.3),
            vec2(0.7+i*0.7, 0.2),
            vec2(0.7+i*0.7, 0.2),
            vec2(0.7+i*0.7, 0.3),
            vec2(0.9+i*0.7, 0.3),

            //fifth street
            vec2(0.9+i*0.7, 0.4),
            vec2(0.9+i*0.7, 0.5),
            vec2(0.7+i*0.7, 0.5),
            vec2(0.7+i*0.7, 0.5),
            vec2(0.7+i*0.7, 0.4),
            vec2(0.9+i*0.7, 0.4),

            // sixth street
            vec2(0.9+i*0.7, 0.6),
            vec2(0.9+i*0.7, 0.7),
            vec2(0.7+i*0.7, 0.6),
            vec2(0.7+i*0.7, 0.6),
            vec2(0.7+i*0.7, 0.7),
            vec2(0.9+i*0.7, 0.7),
        );
    }
    return cars;
}

function moveCars(offset){
    for(let i = 0; i<cars.length; i++){
        cars[i][0] = cars[i][0]+offset
    }
    for(let i = 0; i < cars.length; i+=6){
        if(cars[i][0]+offset < -1 ){ //&& carDir == 1 
            cars[i][0] = cars[i][0]+2.2
            cars[i+1][0] = cars[i+1][0]+2.2
            cars[i+2][0] = cars[i+2][0]+2.2
            cars[i+3][0] = cars[i+3][0]+2.2
            cars[i+4][0] = cars[i+4][0]+2.2
            cars[i+5][0] = cars[i+5][0]+2.2
        }
    }
    return cars;
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    sideWalk = [
        vec2(-1, 1),
        vec2(-1, 0.8),
        vec2(1, 1),
        vec2(-1, 0.8),
        vec2(1, 0.8),
        vec2(1, 1),//topsidewalk ends here  
        vec2(-1, 0.1),  
        vec2(-1, -0.1),  
        vec2(1, 0.1),  
        vec2(1, 0.1),  
        vec2(1, -0.1),  
        vec2(-1, -0.1),//midsidewalk ends here  
        vec2(-1, -0.8),
        vec2(-1, -1),
        vec2(1, -0.8),
        vec2(1, -0.8),
        vec2(1, -1),
        vec2(-1, -1),//bottomsidewalk ends here
    ];
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    sideWalkBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, sideWalkBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(sideWalk), gl.STATIC_DRAW );
    
    carBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, carBuffer);
    generateCars(3);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cars), gl.STATIC_DRAW );

    frogBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, frogBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW );

    // Associate out shader variables with our data buffer
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( vPosition );

    // uniform breytur
    color = gl.getUniformLocation(program, "vColor");

    const step = 0.1;
    var dir = 1;
    // Event listener for keyboard
    window.addEventListener("keydown", (e) => {
        if(e.code == "ArrowUp" && vertices[0][1]+step <= 1){
            if(dir == 2){// var að benda niður
                vertices[0][1] += 0.1;
                vertices[1][1] -= 0.1;
                vertices[2][1] -= 0.1;
            }
            for(let i = 0; i<3; i++) {
                vertices[i][1] += step
            }
            dir = 1
        }
        else if(e.code == "ArrowRight" && vertices[0][0]+step <= 1) {
            for(let i = 0; i<3; i++) {
                vertices[i][0] += step 
            }
        }
        else if(e.code == "ArrowDown" && vertices[0][1]-step >= -1){
            if(dir == 1){// var að benda upp
                vertices[0][1] -= 0.1;
                vertices[1][1] += 0.1;
                vertices[2][1] += 0.1;
            }
            for(let i = 0; i<3; i++) {
                vertices[i][1] -= step
            }
            dir = 2
        }
        else if(e.code == "ArrowLeft" && vertices[0][0]-step >= -1){
            for(let i = 0; i<3; i++) {
                vertices[i][0] -= step;
            }
        }   
        gl.bindBuffer(gl.ARRAY_BUFFER, frogBuffer); 
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
    });
    render();
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    //sideWalkBuffer
    gl.bindBuffer(gl.ARRAY_BUFFER, sideWalkBuffer);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0,0);
    gl.uniform4fv(color, flatten(colorA));
    gl.drawArrays( gl.TRIANGLES, 0, sideWalk.length);

    //carBuffer
    gl.bindBuffer( gl.ARRAY_BUFFER, carBuffer );    
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(cars));
    moveCars(-0.01);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0,0);
    gl.uniform4fv(color, flatten(colorB));
    gl.drawArrays( gl.TRIANGLES, 0, cars.length );

    //frogBuffer
    gl.bindBuffer( gl.ARRAY_BUFFER, frogBuffer);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0,0);
    gl.uniform4fv(color, flatten(colorC));
    gl.drawArrays( gl.TRIANGLES, 0, 3 );
 
    window.requestAnimationFrame(render);
}
