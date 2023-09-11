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


    const step = 0.25;
    var direction = 1;

    window.addEventListener("keydown", (event) => {
        if(event.code == "ArrowUp"){ 
            if(direction == 2){ // niður->upp
                vertices[0][1] += 0.1;
                vertices[1][1] -= 0.1;
                vertices[2][1] -= 0.1;
            }
            else if(direction == 3){ //hægri->upp (Snýr niður)
                vertices[0][1] += 0.1;
                vertices[1][1] -= 0.1;
                vertices[2][1] -= 0.1;
            }
            else if(direction == 4){ //vinstri->upp (Snýr niður)
                vertices[0][1] += 0.1;
                vertices[1][1] -= 0.1;
                vertices[2][1] -= 0.1;
            }
            for(let i = 0; i<3; i++) {
                vertices[i][1] += step
            }
            direction = 1;
        }
        else if(event.code == "ArrowDown"){
            if(direction == 1){ //upp->niður
                vertices[0][1] -= 0.1;
                vertices[1][1] += 0.1;
                vertices[2][1] += 0.1;
            }
            else if(direction == 3){ //hægri->niður (Snýr upp)
                vertices[0][1] -= 0.1;
                vertices[1][1] += 0.1;
                vertices[2][1] += 0.1;
            }
            else if(direction == 4){ //vinstri->niður (Snýr upp)
                vertices[0][1] -= 0.1;
                vertices[1][1] += 0.1;
                vertices[2][1] += 0.1;
            }
            for(let i = 0; i<3; i++) {
                vertices[i][1] -= step
            }
            direction = 2

        }
        else if(event.code == "ArrowRight"){
            //if(direction == 1){ //upp->hægri
            //    vertices[2][0] = vertices[1][0]
            //    vertices[2][1] = vertices[1][1]+0.2
            //}
            //else if(direction == 2){ //niður->hægri
            //    vertices[2][0] = vertices[1][0]
            //    vertices[2][1] = vertices[1][1]-0.2
            //}
            //else if(direction == 4){ //vinstri->hægri
            //    vertices[0][0] += 0.1;
            //    vertices[1][0] -= 0.1;
            //    vertices[2][0] -= 0.1;
            //}
            for(let i = 0; i<3; i++) {
                vertices[i][0] += step
            }
            direction = 3
        }
        else if(event.code == "ArrowLeft"){
            //if(direction == 1){ //upp->vinstri
            //    vertices[1][0] = vertices[2][0]
            //    vertices[1][1] = vertices[2][1]+0.2
            //}
            //else if(direction == 2){ //niður->vinstri
            //    vertices[1][0] = vertices[2][0]
            //    vertices[1][1] = vertices[2][1]-0.2
            //}
            //else if(direction == 3){ //hægri->vinstri
            //    vertices[0][0] -= 0.1;
            //    vertices[1][0] += 0.1;
            //    vertices[2][0] += 0.1;
            //}
            for(let i = 0; i<3; i++) {
                vertices[i][0] -= step;
            }
            direction = 4
        }

        
        console.log(direction)
        console.log(vertices);
        
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
    });

    render();

}


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.uniform4fv( colorFrog, vec4(0,0.5,0, 1) );
    gl.drawArrays( gl.TRIANGLES, 0, 3 );

    window.requestAnimationFrame(render);
}