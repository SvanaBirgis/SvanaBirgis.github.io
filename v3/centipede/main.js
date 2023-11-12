import * as THREE from 'three';

let score = 0;
let oldPlayerPosition = new THREE.Vector3(); // Initialize with a default position
const lasers = []; // Array to keep track of lasers
const mushrooms = []; // Array to keep track of mushrooms
const centipedeSpheres = [];
const minMushrooms = 14; // Minimum number of mushrooms
const maxMushrooms = 20; // Maximum number of mushrooms

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000 );


// Function to toggle between camera and camera2
let activeCamera = camera;
function toggleCamera() {
    activeCamera = (activeCamera === camera) ? camera2 : camera;
    if (activeCamera === camera2) {
        // Attach camera2 to the player
        player.add(camera2);

        // Position the camera above and slightly behind the player, relative to the player
        camera2.position.set(0, -1.5,1 ); // Position camera above (y = -1.5) and behind (z = 1) the player

        // Rotate the camera to look up along the X-axis
        camera2.rotation.x = Math.PI / 2;
    } else {
        // When switching back to the main camera, detach camera2 from the player
        player.remove(camera2);
        scene.add(camera2); // Add camera2 back to the scene directly
    }
}

// Create canvas and set it's sise and positioning it in the middle of the window
const renderer = new THREE.WebGLRenderer();
const multiplyer = 50; // keeps it within bounderies of my screen, you can change it
const canvasInnerWidth = 16 * multiplyer; // 16 is given from teacher
const canvasInnerHeight = 15 * multiplyer; // 15 is given from teacher
renderer.setSize( canvasInnerWidth, canvasInnerHeight );
renderer.domElement.style.position = 'absolute'; // Position the canvas element absolutely
renderer.domElement.style.top = '50%'; // Align the top edge of the canvas to the vertical center of the screen
renderer.domElement.style.left = '50%'; // Align the left edge of the canvas to the horizontal center of the screen
renderer.domElement.style.transform = 'translate(-50%, -50%)'; // Offset the canvas by half of its width and height to center it
document.body.appendChild( renderer.domElement );

// Functions here are to create items inside the canvas

// Creating the player
const playerWidthX = 0.2;
const playerHeightY = 0.1;
const playerDeapthZ = 0.2;

const playerGeometry = new THREE.BoxGeometry( playerWidthX, playerHeightY, playerDeapthZ );
const playerMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } );

const player = new THREE.Mesh( playerGeometry, playerMaterial );
player.position.y = (-1 * (canvasInnerWidth / 2) / 100) + playerHeightY * 10;
player.position.x = 0;
player.position.z = 0;
scene.add( player );

camera.position.z = 5;


const light = new THREE.PointLight(0xffffff, 70, 100, 1.7);
light.position.set(0, 10, 10);
scene.add(light);

function createSphere(x, y, speed){
    const sphereGeometry = new THREE.SphereGeometry( 0.25, 64, 64 ); 
    const material = new THREE.MeshStandardMaterial( { color: '#e81809'} ); 
    const mesh = new THREE.Mesh( sphereGeometry, material );
    mesh.position.x = x;
    mesh.position.y = y;
    
    return mesh;
}

// createSphere((-(canvasInnerWidth / 100) / 2) - 2, (canvasInnerHeight / 100) * 0.4);

function createCentipede(){
    const numSphere = 6;

    // Start position for last Sphere
    const lastX = (-(canvasInnerWidth / 100) / 2) - 2;
    const lastY = (canvasInnerHeight / 100) * 0.4; 

    for (let i = 0; i < numSphere; i+=1) {
        const centipede = createSphere(lastX + i*0.5, lastY);
        scene.add( centipede );
        centipedeSpheres.push(centipede);
    }
    
}

createCentipede();


function updateCentipedePosition(){
    
}

// Creating the mushrooms
function createMushroom() {
    // Smaller radius for the mushroom cap
    const capRadius = 0.15; // Adjust this value to make the cap smaller

    // Keep the stem dimensions unchanged
    const stemRadius = 0.1;  
    const stemHeight = 0.2;  

    // Create mushroom cap (sphere)
    const capGeometry = new THREE.SphereGeometry(capRadius, 32, 32);
    const capMaterial = new THREE.MeshBasicMaterial({ color: 0xefcc00 }); // Yellow color for the cap
    const cap = new THREE.Mesh(capGeometry, capMaterial);

    // Create mushroom stem (cylinder)
    const stemGeometry = new THREE.CylinderGeometry(stemRadius, stemRadius, stemHeight, 32);
    const stemMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF }); // White color for the stem
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);

    // Position the cap on top of the stem
    cap.position.y = stemHeight / 2;

    // Create an empty object to group cap and stem
    const mushroom = new THREE.Object3D();
    mushroom.add(cap);
    mushroom.add(stem);

    // Rotate the mushroom 90 degrees (π/2 radians) on the x-axis
    mushroom.rotation.x = Math.PI / 2;

	mushroom.hits = 0; // To track the number if hits on the mushroom

    return mushroom;
}

// Function to create multiple mushrooms
function createRandomMushrooms() {
    const numMushrooms = Math.floor(Math.random() * (maxMushrooms - minMushrooms + 1)) + minMushrooms;

    // Canvas boundaries for x-coordinate
    const minX = (-(canvasInnerWidth / 100) / 2) - 2;
    const maxX = ((canvasInnerWidth / 100) / 2) + 2;

    // Canvas boundaries for y-coordinate, excluding the lowest 25%
    const minY = (-canvasInnerHeight / 100) / 4; // Start from 25% above the bottom
    const maxY = (canvasInnerHeight / 100) * 0.4; // Up to last ~10% of the canvas

    // Overlap threshold
    const overlapThreshold = 0.5; // Adjust based on the size of your mushrooms

    for (let i = 0; i < numMushrooms; i++) {
        let x, y, overlap;
        do {
            x = Math.random() * (maxX - minX) + minX;
            y = Math.random() * (maxY - minY) + minY;
            overlap = isOverlapping(x, y, mushrooms, overlapThreshold);
        } while (overlap); // Keep generating new positions until no overlap is found

        const mushroom = createMushroom();
        mushroom.position.set(x, y, 0); // Z-coordinate is set to 0 (ground level)
        scene.add(mushroom);
        mushrooms.push(mushroom); // Add each created mushroom to the array
    }
}

createRandomMushrooms();

createRandomMushrooms();


function createLaser() {
    const playerHeight = playerHeightY; // Assuming this is the player's height
    const laserLength = playerHeight / 2;
    const laserRadius = laserLength / 2; // Adjust the radius as needed

    const laserGeometry = new THREE.CylinderGeometry(laserRadius, laserRadius, laserLength, 32);
    const laserMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const laser = new THREE.Mesh(laserGeometry, laserMaterial);

    laser.rotation.x = Math.PI / 2; // Rotate the cylinder to point forward
    return laser;
}

// Function that adds more mushroom when they get down to too few
function addMushrooms(numberToAdd) {
    // Canvas boundaries for x-coordinate
    const minX = (-(canvasInnerWidth / 100) / 2) - 2;
    const maxX = ((canvasInnerWidth / 100) / 2) + 2;

    // Canvas boundaries for y-coordinate, excluding the lowest 25%
    const minY = (-canvasInnerHeight / 100) / 4; // Start from 25% above the bottom
    const maxY = (canvasInnerHeight / 100) * 0.4;  // Up to last ~10% of the canvas

	// Overlap threshold
    const overlapThreshold = 0.5; // Adjust based on the size of your mushrooms

    for (let i = 0; i < numberToAdd; i++) {
        let x, y, overlap;
        do {
            x = Math.random() * (maxX - minX) + minX;
            y = Math.random() * (maxY - minY) + minY;
            overlap = isOverlapping(x, y, mushrooms, overlapThreshold);
        } while (overlap); // Keep generating new positions until no overlap is found

        const mushroom = createMushroom();
        mushroom.position.set(x, y, 0); // Z-coordinate is set to 0 (ground level)
        scene.add(mushroom);
        mushrooms.push(mushroom); // Add each created mushroom to the array
	}
}


// Functions to check for collitions

// To make sure the player does not go out of bounds
function checkBoundsAndResetPlayer() {
    // Define the boundaries of the canvas
	const ciw = canvasInnerWidth / 100;
	const cih = canvasInnerHeight / 100;
	
    const minX = (-ciw / 2) - 2;
    const maxX = (ciw / 2) + 2;
    const minY = -cih / 2;
    const maxY = -2; // Teacher does not want us to go far up

    // Check if the player is outside the boundaries
    if (player.position.x < minX || player.position.x > maxX || 
        player.position.y < minY || player.position.y > maxY) {
        
        // Reset player position to old position
        player.position.copy( oldPlayerPosition );
    }
}

// Collision between Centipede and Mushroom
function checkCentipedeMushroomCollisions(){

}

// Collision between Centipede and Laser
function checkCentipedeLaserCollision(){

}

// Collision between Centipede and player
function checkCentipedePlayerCollision(){

}


// Check to see if you have hit a mushroom with a laser
function checkLaserMushroomCollisions() {
    for (let i = lasers.length - 1; i >= 0; i--) {
        let laser = lasers[i];
        for (let j = mushrooms.length - 1; j >= 0; j--) {
            let mushroom = mushrooms[j];
            if (isCollision(laser, mushroom)) {
                mushroom.hits += 1; // Increment hit count

                if (mushroom.hits >= 4) {
                    // Remove mushroom if hit 5 times
                    scene.remove(mushroom);
                    mushrooms.splice(j, 1);
					replenishMushroomsIfNeeded();
                } else {
                    // Reduce mushroom size by 20%
                    mushroom.scale.x *= 0.75;
                    mushroom.scale.y *= 0.75;
                    mushroom.scale.z *= 0.75;
                }

                // Remove laser from scene and array
                scene.remove(laser);
                lasers.splice(i, 1);

                // Increment score
                score++;
				updateScoreDisplay();
                // Break out of the inner loop since the laser has been removed
                break;
            }
        }
    }
}

// Helper function to check for collition on laser and mushroom
function isCollision(laser, mushroom) {
    // Simple distance check (point-based collision)
    const distance = laser.position.distanceTo(mushroom.position);
    const collisionThreshold = 0.5; // Adjust as needed
    return distance < collisionThreshold;
}

// To check if a mushroom is placed at the same space as another
function isOverlapping(newX, newY, existingMushrooms) {
    for (const mushroom of existingMushrooms) {
        if (Math.abs(mushroom.position.x - newX) < 0.01 && Math.abs(mushroom.position.y - newY) < 0.01) {
            return true;
        }
    }
    return false;
}


// Function to handle arrow key presses
function onDocumentKeyDown(event) {
	// Store the current player position before any movement
    oldPlayerPosition.copy(player.position);
	var keyCode = event.which;
	// Arrow keys have the following keyCodes: 37 (left), 38 (up), 39 (right), 40 (down)
	if (keyCode == 37) {
		player.position.x -= 0.3; // Move left
	} else if (keyCode == 38) {
		player.position.y += 0.3; // Move up
	} else if (keyCode == 39) {
		player.position.x += 0.3; // Move right
	} else if (keyCode == 40) {
		player.position.y -= 0.3; // Move down
	}
	if (keyCode == 32) { // Spacebar
        const laser = createLaser();
        laser.position.set(player.position.x, player.position.y, player.position.z);
        scene.add(laser);
        lasers.push(laser);
    }

}

// Attach event listener to the document
document.addEventListener("keydown", onDocumentKeyDown, false);
document.querySelector('.toggle-button').addEventListener('click', toggleCamera);


// Check if the mushroom count is low and add more
function replenishMushroomsIfNeeded() {
    const minimumMushrooms = 10; // Set the minimum number of mushrooms you want in the scene

    if (mushrooms.length < minimumMushrooms) {
        const mushroomsToAdd = Math.floor((Math.random() * (maxMushrooms - minMushrooms + 1)) + minMushrooms) - mushrooms.length;
        addMushrooms(mushroomsToAdd);
    }
}


// Updates score
function updateScoreDisplay() {
    document.getElementById('scoreDisplay').innerText = 'Score: ' + score;
}




// Function to animate everything
function animate() {
	requestAnimationFrame( animate );
    for (let i = lasers.length - 1; i >= 0; i--) {
        let laser = lasers[i];
        laser.position.y += 0.1; // Adjust speed as necessary
    }
     
	// Check to see if mushrooms and laser collide
	checkLaserMushroomCollisions();
	// Check and reset player position if out of bounds
	checkBoundsAndResetPlayer();
	renderer.render( scene, activeCamera );
	const oldplayer = player.position;
}
animate();
