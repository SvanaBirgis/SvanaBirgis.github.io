var canvas;
var gl;

var NumVertices  = 9;
var NumBody = 6;
var NumTail = 3;
var NumFins = 3;

// Hn�tar fisks � xy-planinu
var vertices = [
    // l�kami (spjald)
    vec4( -0.5,  0.0, 0.0, 1.0 ),
	vec4(  0.2,  0.2, 0.0, 1.0 ),
	vec4(  0.5,  0.0, 0.0, 1.0 ),
	vec4(  0.5,  0.0, 0.0, 1.0 ),
	vec4(  0.2, -0.15, 0.0, 1.0 ),
	vec4( -0.5,  0.0, 0.0, 1.0 ),
	// spor�ur (�r�hyrningur)
    vec4( -0.5,  0.0, 0.0, 1.0 ),
    vec4( -0.65,  0.15, 0.0, 1.0 ),
    vec4( -0.65, -0.15, 0.0, 1.0 ),
    // uggi
    vec4(0.0, 0.0, 0.0, 1.0),
    vec4(0.1, 0.15, 0.0, 1.0),
    vec4(-0.1, 0.15, 0.0, 1.0),
];

var box = [
    vec4(-10, 10, -10, 1.0),
    vec4(-10, -10, -10, 1.0),
    vec4(10, -10, -10, 1.0),
    vec4(10, 10, -10, 1.0),
    vec4(-10, 10, -10, 1.0),
    vec4(-10, 10, 10, 1.0),
    vec4(-10, -10, 10, 1.0),
    vec4(10, -10, 10, 1.0),
    vec4(10, 10, 10, 1.0),
    vec4(-10, 10, 10, 1.0),
    vec4(-10, -10, 10, 1.0),
    vec4(-10, -10, -10, 1.0),
    vec4(10, -10, -10, 1.0),
    vec4(10, -10, 10, 1.0),
    vec4(10, 10, 10, 1.0),
    vec4(10, 10, -10, 1.0),

];

var v = [
    vec3( -0.5, -0.5,  0.5 ),
    vec3( -0.5,  0.5,  0.5 ),
    vec3(  0.5,  0.5,  0.5 ),
    vec3(  0.5, -0.5,  0.5 ),
    vec3( -0.5, -0.5, -0.5 ),
    vec3( -0.5,  0.5, -0.5 ),
    vec3(  0.5,  0.5, -0.5 ),
    vec3(  0.5, -0.5, -0.5 )
];

var lines = [ v[0], v[1], v[1], v[2], v[2], v[3], v[3], v[0],
              v[4], v[5], v[5], v[6], v[6], v[7], v[7], v[4],
              v[0], v[4], v[1], v[5], v[2], v[6], v[3], v[7]
            ];


var movement = false;     // Er m�sarhnappur ni�ri?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var rotTail = 0.0;        // Sn�ningshorn spor�s
var incTail = 2.0;        // Breyting � sn�ningshorni

var rotFin = 0.0;        // Sn�ningshorn ugga
var incFin = 2.0;        // Breyting � sn�ningshorni

var zView = 2.0;          // Sta�setning �horfanda � z-hniti

var proLoc;
var mvLoc;
var colorLoc;


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.95, 1.0, 1.0, 1.0 );
 
    gl.enable(gl.DEPTH_TEST);
 
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(v), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    colorLoc = gl.getUniformLocation( program, "fColor" );

    proLoc = gl.getUniformLocation( program, "projection" );
    mvLoc = gl.getUniformLocation( program, "modelview" );

    // Setjum ofanvarpsfylki h�r � upphafi
    var proj = perspective( 90.0, 1.0, 0.1, 100.0 );
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));
    

    // Atbur�af�ll fyrir m�s
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY += (e.offsetX - origX) % 360;
            spinX += (e.offsetY - origY) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );
    
    // Atbur�afall fyrir lyklabor�
     window.addEventListener("keydown", function(e){
         switch( e.keyCode ) {
            case 38:	// upp �r
                zView += 0.2;
                break;
            case 40:	// ni�ur �r
                zView -= 0.2;
                break;
         }
     }  );  

    // Atbur�afall fyri m�sarhj�l
     window.addEventListener("mousewheel", function(e){
         if( e.wheelDelta > 0.0 ) {
             zView += 0.2;
         } else {
             zView -= 0.2;
         }
     }  );  

    render();
}

function renderFish(){
    rotTail += incTail;
    if( rotTail > 35.0  || rotTail < -35.0 )
        incTail *= -1;

    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
	gl.uniform4fv( colorLoc, vec4(0.2, 0.6, 0.9, 1.0) );

	// Teikna l�kama fisks (�n sn�nings)
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
    gl.drawArrays( gl.TRIANGLES, 0, NumBody );

    // Teikna spor� og sn�a honum
	var mv_tail = mv;
    mv_tail = mult( mv_tail, translate ( -0.5, 0.0, 0.0 ) );
    mv_tail = mult( mv_tail, rotateY( rotTail ) );
	mv_tail = mult( mv_tail, translate ( 0.5, 0.0, 0.0 ) );
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv_tail));
    gl.drawArrays( gl.TRIANGLES, NumBody, NumTail );

    var mv_l = mv;
    mv_l = mult( mv_l, translate ( -0.05, 0.0, 0 ) );
    mv_l = mult(mv_l, rotateZ(90));
    mv_l = mult(mv_l, rotateX(45 + 0.5 * rotTail));
	mv_l = mult( mv_l, translate ( 0.05, 0.0, 0 ) );

    gl.uniformMatrix4fv(mvLoc, false, flatten(mv_l));
    gl.drawArrays( gl.TRIANGLES, NumBody+NumTail, NumFins );

    var mv_r = mv;
    mv_r = mult( mv_r, translate ( -0.05, 0.0, 0.0 ) );;
    mv_r = mult(mv_r, rotateZ(90));
    mv_r = mult(mv_r, rotateX(-45 - 0.5 * rotTail));
	mv_r = mult( mv_r, translate ( 0.05, 0.0, 0.0 ) );


    gl.uniformMatrix4fv(mvLoc, false, flatten(mv_r));
    gl.drawArrays( gl.TRIANGLES, NumBody+NumTail, NumFins );

}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var mv = lookAt( vec3(0.0, 0.0, zView), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0) );
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) );


    //renderFish();
   
    gl.uniform4fv( colorLoc, vec4(1.0, 0.0, 0.0, 1.0) );
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
    gl.drawArrays( gl.LINES, 0, NumVertices );
     // render Box
     //gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
     //gl.uniform4fv(colorLoc, vec4(0.0, 0.0, 0.0, 1.0));
     //gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
     //gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
     //gl.drawArrays(gl.LINE_STRIP, 0, 16);
     
    window.requestAnimationFrame(render);
}
