var canvas;
var gl;

var colorFrog;
var vPosition;

// Rotation
// stig

// Svæðið er frá -maxX til maxX og -maxY til maxY
var maxX = 1.0;
var maxY = 1.0;

var frog = [
    vec2( 0,    -0.85 ),
    vec2( -0.1, -0.95 ),
    vec2( 0.1,  -0.95 )
];

var totalHeight = maxY * 2;
var totalLanes = 7; // Total fjöldi akreina með gangstétt
var laneHeight = totalHeight / totalLanes; //Hæð akreinar

var currentLane = 0;

var sidewalk = [
    vec2(-1, 1),
    vec2(-1, 0.7),
    vec2(1, 1),
    vec2(-1, 0.7),
    vec2(1, 0.7),
    vec2(1, 1), //top
    vec2(-1, -0.7),
    vec2(-1, -1),
    vec2(1, -0.7),
    vec2(1, -0.7),
    vec2(1, -1),
    vec2(-1, -1), //bottom
];

var cars = [];
var carWidth = 0.3;
var carHeight = 0.15;
var numCarsInLane = 3;
var carSpeeds = [0.017, 0.014, 0.011, 0.008, 0.005];
var carSpacing = 0.8;


function generateCars() {
    for (var lane = 1; lane < totalLanes; lane++) {
        var laneY = maxY - lane * laneHeight - laneHeight / 2;
        var totalWidth = numCarsInLane * carWidth + (numCarsInLane - 1) * carSpacing;
        var initialCarX = maxX + (maxX - totalWidth) / 2; // Byrja með bílana í miðju skjásins

        for (var i = 0; i < numCarsInLane; i++) {
            var carX = initialCarX + i * (carWidth + carSpacing);
            cars.push({
                position: vec2(carX, laneY),
                width: carWidth,
                height: carHeight,
                speed: carSpeeds[lane - 1] // Mismunandi hraði per akrein
            });
        }
    }
}

function moveCars() {
    for (var i = 0; i < cars.length; i++) {
        cars[i].position[0] -= cars[i].speed; 

        // Tékkar ef bíll er farin af skjá vinstra megin
        if (cars[i].position[0] < -maxX - carWidth) {
            // Setja bíl rétt fyrir utan skjá hægra megin
            cars[i].position[0] = maxX + carSpacing;
        }
    }
}


function collision(){
    for (var i = 0; i < cars.length; i++) {
        var car = cars[i];
        
        // Kantarnir á froski og bíl
        var frogLeft = Math.min(frog[0][0], frog[1][0], frog[2][0]);
        var frogRight = Math.max(frog[0][0], frog[1][0], frog[2][0]);
        var frogTop = Math.max(frog[0][1], frog[1][1], frog[2][1]);
        var frogBottom = Math.min(frog[0][1], frog[1][1], frog[2][1]);

        var carLeft = car.position[0] - car.width / 2;
        var carRight = car.position[0] + car.width / 2;
        var carTop = car.position[1] + car.height / 2;
        var carBottom = car.position[1] - car.height / 2;

        // Klessa þeir saman?
        if (
            frogLeft < carRight &&
            frogRight > carLeft &&
            frogTop > carBottom &&
            frogBottom < carTop
        ) {
            // Þeir klesstust (resettar bara niðri :( )
            frog = [
                vec2(0, -0.85),
                vec2(-0.1, -0.95),
                vec2(0.1, -0.95)
            ];
            
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(frog));
        }
    }
}



function movement(){
    // Event listener for keyboard
    window.addEventListener("keydown", function (e) {
        xmove = 0;
        ymove = 0;
        switch (e.code) {
            case "ArrowUp":
                if (currentLane < totalLanes - 1) {
                    ymove += laneHeight; 
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
                if (currentLane > 0) { 
                    ymove -= laneHeight; 
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

        // Tékka ef froskur er útfyrir rammann
        var isOutsideBoundaries = newVertices.some(function (vertex) {
            return (
                vertex[0] < -maxX ||
                vertex[0] > maxX ||
                vertex[1] < -maxY ||
                vertex[1] > maxY
            );
        });

        // Updadeum stapsetningu ef froskur er innan rammans
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

    collision();

    renderCars();

    renderFrog();


    window.requestAnimationFrame(render);
}
