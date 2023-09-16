var canvas;
var gl;

var colorFrog;
var vPosition;

// Spacing er off
// Collision 
// stig


// Svæðið er frá -maxX til maxX og -maxY til maxY
var maxX = 1.0;
var maxY = 1.0;

var frog = [
    vec2( 0,    -0.85 ),
    vec2( -0.05, -0.95 ),
    vec2( 0.05,  -0.95 )
];

var sidewalk = [
    vec2(-1, 1),
    vec2(-1, 0.8),
    vec2(1, 1),
    vec2(-1, 0.8),
    vec2(1, 0.8),
    vec2(1, 1), //top
    vec2(-1, -0.8),
    vec2(-1, -1),
    vec2(1, -0.8),
    vec2(1, -0.8),
    vec2(1, -1),
    vec2(-1, -1), //bottom
];

var totalHeight = maxY * 2; // maxY represents the maximum y-coordinate value
var totalLanes = 7; // Total number of lanes (including sidewalks)
var laneHeight = totalHeight / totalLanes;

var currentLane = 0;



//var LANES = 7; // Fjöldi akgreina (með gangstétt).
//var laneSize;       // Stærð einnar akgreinar.
var cars = [];
var carWidth = 0.3;
var carHeight = 0.15;
var numCarsInLane = 5;
var carSpeeds = [0.017, 0.014, 0.011, 0.008, 0.005];
var carSpacing = 0.5;


function generateCars() {
    for (var lane = 1; lane < totalLanes; lane++) { // Start from lane 1
        var laneY = maxY - lane * laneHeight - laneHeight / 2;
        var totalWidth = numCarsInLane * carWidth + (numCarsInLane - 1) * carSpacing;
        var initialCarX = maxX + (maxX - totalWidth) / 2; // Center the cars initially on the screen

        for (var i = 0; i < numCarsInLane; i++) {
            var carX = initialCarX + i * (carWidth + carSpacing);
            cars.push({
                position: vec2(carX, laneY),
                width: carWidth,
                height: carHeight,
                speed: carSpeeds[lane - 1] // Adjust the speed based on lane
            });
        }
    }
}

function moveCars() {
    for (var i = 0; i < cars.length; i++) {
        cars[i].position[0] -= cars[i].speed; // Corrected typo

        // Check if a car moves off the screen to the left
        if (cars[i].position[0] < -maxX - carWidth) {
            // Reposition the car to the right edge of the screen
            cars[i].position[0] = maxX + carSpacing;
        }
    }
}


function collision(){

}

function points(){

}




function movement(){
    // Event listener for keyboard
    window.addEventListener("keydown", function (e) {
        xmove = 0;
        ymove = 0;
        switch (e.code) {
            case "ArrowUp":
                if (currentLane < totalLanes - 1) { // Check if not already in the top lane
                    ymove += laneHeight; // Move one lane up
                    currentLane++;
                }
                break;
            case "ArrowLeft": // vinstri ör
                xmove -= 0.1;
                break;
            case "ArrowRight": // hægri ör
                xmove += 0.1;
                break;
            case "ArrowDown":
                if (currentLane > 0) { // Check if not already in the bottom lane
                    ymove -= laneHeight; // Move one lane down
                    currentLane--;
                }
                break;
            default:
                xmove = 0.0;
                ymove = 0.0;
        }

        var newVertices = frog.map(function (vertex) {
            var newX = vertex[0] + xmove;
            var newY = vertex[1] + ymove;

            return [newX, newY];
        });

        // Check if any part of the frog is outside the boundaries
        var isOutsideBoundaries = newVertices.some(function (vertex) {
            return (
                vertex[0] < -maxX ||
                vertex[0] > maxX ||
                vertex[1] < -maxY ||
                vertex[1] > maxY
            );
        });

        // Only update the frog's position if it's not outside the boundaries
        if (!isOutsideBoundaries) {
            frog = newVertices;
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(frog));
        }
    });
}

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");
    
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }


    //  Configure WebGL

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.2, 0.2, 0.2, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    colorFrog = gl.getUniformLocation( program, "vColor" );

    movement();

    generateCars();

    render();

}

function renderSidewalk(){
    gl.bufferData( gl.ARRAY_BUFFER, flatten(sidewalk), gl.STATIC_DRAW );
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0,0);
    gl.uniform4fv( colorFrog, vec4(0.8,0.8,0.8, 1));
    gl.drawArrays( gl.TRIANGLES, 0, sidewalk.length);
}

function renderCars(){
    for (var i = 0; i < cars.length; i++) {
        var car = cars[i];
        gl.bufferData(gl.ARRAY_BUFFER, flatten([
            vec2(car.position[0] - car.width / 2, car.position[1] + car.height / 2),
            vec2(car.position[0] - car.width / 2, car.position[1] - car.height / 2),
            vec2(car.position[0] + car.width / 2, car.position[1] + car.height / 2),
            vec2(car.position[0] + car.width / 2, car.position[1] + car.height / 2),
            vec2(car.position[0] - car.width / 2, car.position[1] - car.height / 2),
            vec2(car.position[0] + car.width / 2, car.position[1] - car.height / 2)
        ]), gl.STATIC_DRAW );
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.uniform4fv(colorFrog, vec4(1.0, 0.0, 0.0, 1));
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}

function renderFrog(){
    gl.bufferData(gl.ARRAY_BUFFER, flatten(frog), gl.DYNAMIC_DRAW);
    gl.uniform4fv(colorFrog, vec4(0,0.5,0, 1));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    renderSidewalk();

    moveCars(); 

    renderCars();

    renderFrog();

    window.requestAnimationFrame(render);
}
