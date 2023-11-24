//board
let tileSize = 32; // Size of each tile in the game
let rows = 16; // Number of rows in the game board
let columns = 16; // Number of columns in the game board

let board; // Reference to the canvas element
let boardWidth = tileSize * columns; // Width of the game board in pixels
let boardHeight = tileSize * rows; // Height of the game board in pixels
let context; // Context for drawing on the canvas

//ship
let shipWidth = tileSize * 2; // Width of the player's ship
let shipHeight = tileSize; // Height of the player's ship
let shipX = tileSize * columns / 2 - tileSize; // Initial X coordinate of the player's ship
let shipY = tileSize * rows - tileSize * 2; // Initial Y coordinate of the player's ship

let ship = {
    x: shipX,
    y: shipY,
    width: shipWidth,
    height: shipHeight
}

let shipImg; // Image for the player's ship
let shipVelocityX = tileSize; // Speed of the player's ship's horizontal movement

//aliens
let alienArray = []; // Array to store information about aliens
let alienWidth = tileSize * 2; // Width of an alien
let alienHeight = tileSize; // Height of an alien
let alienX = tileSize; // Initial X coordinate of the first alien
let alienY = tileSize; // Initial Y coordinate of the first alien
let alienImg; // Image for the aliens

let alienRows = 2; // Number of rows of aliens
let alienColumns = 3; // Number of columns of aliens
let alienCount = 0; // Number of aliens to defeat
let alienVelocityX = 1; // Speed of the aliens' horizontal movement

//bullets
let bulletArray = []; // Array to store information about bullets
let bulletVelocityY = -10; // Speed of the bullets' vertical movement

let score = 0; // Player's score
let gameOver = false; // Flag to indicate if the game is over

// Execute the provided function when the window has finished loading
window.onload = function() {
    // Get references to the canvas and its context
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d"); // Context used for drawing on the board

    // Load the image for the player's ship
    shipImg = new Image();
    shipImg.src = "./ship.png";
    // Draw the player's ship on the canvas when the image is loaded
    shipImg.onload = function() {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    }

    // Load the image for the aliens
    alienImg = new Image();
    alienImg.src = "./alien.png";
    // Create the initial set of aliens
    createAliens();

    // Request the first animation frame to start the game loop
    requestAnimationFrame(update);

    // Add event listeners for keydown and keyup events to move the ship and shoot
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", shoot);
}

// Game loop function to update and render the game state
function update() {
    requestAnimationFrame(update);

    // Skip the update if the game is over
    if (gameOver) {
        return;
    }

    // Clear the canvas
    context.clearRect(0, 0, board.width, board.height);

    // Draw the player's ship
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    // Update and draw each alien
    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            // Move the alien horizontally
            alien.x += alienVelocityX;

            // Handle alien reaching the borders
            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                alienVelocityX *= -1; // Reverse the direction of alien movement
                alien.x += alienVelocityX * 2; // Move the alien by double the velocity

                // Move all aliens in the array down by one row
                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight;
                }
            }
            // Draw the alien on the canvas
            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

            // Check if the alien reaches the player's ship
            if (alien.y >= ship.y) {
                gameOver = true;
            }
        }
    }

    // Update and draw each bullet
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        // Move the bullet vertically
        bullet.y += bulletVelocityY;

        // Draw the bullet on the canvas
        context.fillStyle = "white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        // Check for collision with aliens
        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.alive = false;
                alienCount--;
                score += 100;
            }
        }
    }

    // Clear used bullets
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift(); // Remove the first element of the array
    }

    // Check if the player has defeated all aliens for the next level
    if (alienCount == 0) {
        // Increase the number of aliens in columns and rows by 1
        score += alienColumns * alienRows * 100; // Bonus points
        alienColumns = Math.min(alienColumns + 1, columns / 2 - 2); // Cap at 6
        alienRows = Math.min(alienRows + 1, rows - 4); // Cap at 12
        if (alienVelocityX > 0) {
            alienVelocityX += 0.2; // Increase the alien movement speed towards the right
        } else {
            alienVelocityX -= 0.2; // Increase the alien movement speed towards the left
        }
        alienArray = [];
        bulletArray = [];
        createAliens();
    }

    // Draw the player's score on the canvas
    context.fillStyle = "white";
    context.font = "16px courier";
    context.fillText(score, 5, 20);
}

// Function to handle the player's ship movement
function moveShip(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX; // Move the ship left one tile
    } else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX; // Move the ship right one tile
    }
}

// Function to create the initial set of aliens
function createAliens() {
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            // Create an alien object and add it to the alienArray
            let alien = {
                img: alienImg,
                x: alienX + c * alienWidth,
                y: alienY + r * alienHeight,
                width: alienWidth,
                height: alienHeight,
                alive: true
            };
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length; // Set the number of aliens to defeat
}

// Function to handle shooting bullets
function shoot(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "Space") {
        // Create a bullet object and add it to the bulletArray
        let bullet = {
            x: ship.x + shipWidth * 15 / 32,
            y: ship.y,
            width: tileSize / 8,
            height: tileSize / 2,
            used: false
        };
        bulletArray.push(bullet);
    }
}

// Function to check for collision between two objects
function detectCollision(a, b) {
    return a.x < b.x + b.width && // a's top left corner doesn't reach b's top right corner
        a.x + a.width > b.x && // a's top right corner passes b's top left corner
        a.y < b.y + b.height && // a's top left corner doesn't reach b's bottom left corner
        a.y + a.height > b.y; // a's bottom left corner passes b's top left corner
}