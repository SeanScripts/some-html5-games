// Constants
var updateInterval = 100;
var canvasWidth = 600;
var canvasHeight = 600;
var blockSize = 30;
var foodSize = 30;
var snakeWidth = 24;
var maxX = canvasWidth/blockSize;
var maxY = canvasHeight/blockSize;
var foodColor = 'red';
var snakeColor = 'green';
var backgroundColor = 'black';

var ended = false;
var score = 0;

// Initial position
var startX = Math.floor(maxX/4);
var startY = Math.floor(maxY/4);

//Direction of the snake
var direction = [1, 0];
// x and y coordinates

// Game objects
var snakeBlocks = [];
var foodBlocks = [];
var endX = startX-1;
var endY = startY;

function addEventListeners() {
    window.addEventListener('keydown', function(e) {
        var key = e.keyCode;
        // Key interactions
        if (key == 37) {
            direction = [-1, 0];
        }
        if (key == 38) {
            direction = [0, -1];
        }
        if (key == 39) {
            direction = [1, 0];
        }
        if (key == 40) {
            direction = [0, 1];
        }
    });
    //window.addEventListener('keyup', function(e) {});
}

function reset() {
    // Initial position
    startX = Math.floor(maxX/4);
    startY = Math.floor(maxY/4);

    //Direction of the snake
    direction = [1, 0];
    // x and y coordinates

    // Game objects
    snakeBlocks = [];
    foodBlocks = [];
    endX = startX-1;
    endY = startY;
    
    // Add a snake block (the head)
    snakeBlocks.push(new SnakeBlock(startX, startY, 0));
                     
    generateFood();
    ended = false;
    score = 0;
    document.getElementById('score').innerHTML = score;
    document.getElementById('message').innerHTML = '';
    
    // Start moving
    SnakeGame.interval = setInterval(updateGame, updateInterval);
}

function init() {
    SnakeGame.start();
    SnakeGame.drawStartScreen();
}

var SnakeGame = {
    canvas : document.createElement('canvas'),
    start : function() {
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.context = this.canvas.getContext('2d');
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Add background
        this.context.fillStyle = backgroundColor;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },
    interval : false,
    drawStartScreen : function() {
        this.clear();
        this.context.font = "100px Consolas";
        this.context.fillStyle = snakeColor;
        this.context.fillText("Snake", canvasWidth/2-120, canvasHeight/2+20);
    }
}

function FoodBlock(x, y) {
    this.x = x;
    this.y = y;
    this.eaten = false;
    this.update = function() {
        if (!this.eaten) {
            // Check to see if eaten
            if (snakeBlocks[0].x == this.x && snakeBlocks[0].y == this.y) {
                this.eaten = true;
                // Expand snake
                expandSnake();
            }
        }
    };
    this.draw = function() {
        if (!this.eaten) {
            // Draw
            ctx = SnakeGame.context;
            ctx.fillStyle = foodColor;
            ctx.beginPath();
            ctx.ellipse(this.x*blockSize + blockSize/2, this.y*blockSize + blockSize/2, foodSize/2, foodSize/2, 0, 0, 2*Math.PI);
            ctx.fill();
        }
    };
}

function SnakeBlock(x, y, index) {
    this.x = x;
    this.y = y;
    this.index = index;
    this.eaten = false;
    this.update = function() {
        // Update position
        if (index != 0) {
            // Body of the snake, move with the rest
            this.x = snakeBlocks[index-1].x;
            this.y = snakeBlocks[index-1].y;
        }
        else {
            // Head of the snake, move according to direction
            this.x += direction[0];
            this.y += direction[1];
            if (this.x < 0 || this.x >= maxX || this.y < 0 || this.y >= maxY) {
                // Out of bounds -- you lose
                endGame(false);
            }
        }
    };
    this.draw = function() {
        // Draw
        ctx = SnakeGame.context;
        ctx.fillStyle = snakeColor;
        ctx.fillRect(this.x*blockSize + blockSize/2 - snakeWidth/2, this.y*blockSize + blockSize/2 - snakeWidth/2, snakeWidth, snakeWidth);
        if (this.index != 0) {
            console.log(this.x);
            ctx.fillRect(blockSize*(this.x + snakeBlocks[this.index-1].x)/2.0 + blockSize/2 - snakeWidth/2, blockSize*(this.y + snakeBlocks[this.index-1].y)/2.0 + blockSize/2 - snakeWidth/2, snakeWidth, snakeWidth);
        }
    }
}

function updateGame() {
    // Clear the canvas
    SnakeGame.clear();
    // Update the position where new snake will be added to be at the current end
    endX = snakeBlocks[snakeBlocks.length-1].x;
    endY = snakeBlocks[snakeBlocks.length-1].y;
    // Move the snake forward
    for (var i = snakeBlocks.length-1; i >= 0; i--) {
        snakeBlocks[i].update();
    }
    // Check for self-collision, and also draw the snake
    for (var i = 0; i < snakeBlocks.length; i++) {
        if (i > 0) {
            if (snakeBlocks[0].x == snakeBlocks[i].x && snakeBlocks[0].y == snakeBlocks[i].y) {
                // Self-collision -- you lose
                endGame(false);
            }
        }
        snakeBlocks[i].draw();
    }
    // Check the food to see if it's been eaten, and draw them
    var hasBeenEaten = false;
    for (i = foodBlocks.length-1; i >= 0; i--) {
        foodBlocks[i].update();
        foodBlocks[i].draw();
        // Remove eaten food
        if (foodBlocks[i].eaten) {
            hasBeenEaten = true;
            foodBlocks.splice(i, 1);
        }
    }
    // Add new food if necessary
    // (Right now it's just one at a time)
    if (hasBeenEaten) {
        generateFood();
    }
}

function expandSnake() {
    var index = snakeBlocks.length;
    snakeBlocks.push(new SnakeBlock(endX, endY, index));
    score++;
    document.getElementById('score').innerHTML = score;
    // Win condition?
    //Pssh, what human can win at snake.
    if (score == maxScore) {
       endGame(true);
    }
}

function generateFood() {
    var valid = false;
    // This will infinite loop if you happen to win the game...
    while (!valid) {
        valid = true;
        var x = Math.floor(Math.random()*maxX);
        var y = Math.floor(Math.random()*maxY);
        for (var i = 0; i < foodBlocks.length; i++) {
            if (foodBlocks[i].x == x && foodBlocks[i].y == y) {
                valid = false;
            }
        }
        for (i = 0; i < snakeBlocks.length; i++) {
            if (snakeBlocks[i].x == x && snakeBlocks[i].y == y) {
                valid = false;
            }
        }
    }
    foodBlocks.push(new FoodBlock(x, y));
}

function endGame(win) {
    ended = false;
    clearInterval(SnakeGame.interval);
    if (win) {
        document.getElementById('message').innerHTML = 'You win!';
    }
    else {
        document.getElementById('message').innerHTML = 'You lose!';
    }
}