var canvasWidth = 600;
var canvasHeight = 600;
var backgroundColor = 'black';
var frameTime = 5;

var ballSize = 20;
var ballColor = 'white';
var paddleWidth = 80;
var paddleHeight = 20;
var paddleColor = 'white';
var xBlocks = 10;
var yBlocks = 5;
var blockGap = 2;
var blockWidth = 58;
var blockHeight = 30;
var maxLives = 3;
var delay = 0;
var deathDelay = 200;
var startGameDelay = 200;

var ballStartX = canvasWidth/2;
var ballStartY = 3*canvasHeight/4;
var ballStartVX = 2;
var ballStartVY = -2;
var paddleStartX = canvasWidth/2;
var paddleStartY = 7*canvasHeight/8;

var maxBallSpeed = 3;
var paddleSpeed = 3;
var pressingLeft = false;
var pressingRight = false;
var paddleMove = 0;
var stickThreshold = 0.25;
var gravity = -0.0;

var lives = maxLives;
var score = 0;
var canvas;
var context;
var interval;
var paddle;
var ball;
var blocks = [];

var lastBallX = 0;
var lastBallY = 0;

function init() {
    // Create the canvas and context on page load, add the event listeners
    canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    context = canvas.getContext('2d');
    document.body.insertBefore(canvas, document.body.childNodes[0]);
    window.addEventListener('keydown', keyDownEvent);
    window.addEventListener('keyup', keyUpEvent);
}

function keyDownEvent(e) {
    var key = e.keyCode;
    if (key == 37) {
        pressingLeft = true;
    }
    if (key == 39) {
        pressingRight = true;
    }
}

function keyUpEvent(e) {
    var key = e.keyCode;
    if (key == 37) {
        pressingLeft = false;
    }
    if (key == 38) {
        paddleWidth += 5;
        paddle = Paddle(paddle.x, paddle.y);
    }
    if (key == 39) {
        pressingRight = false;
    }
    if (key == 40) {
        paddleWidth -= 5;
        paddle = Paddle(paddle.x, paddle.y);
    }
}

function startGame() {
    // Reset and initialize game things here
    ball = Ball(ballStartX, ballStartY);
    ball.vx = 0;
    ball.vy = 0;
    paddle = Paddle(paddleStartX, paddleStartY);
    blocks = [];
    score = 0;
    lives = maxLives;
    delay = startGameDelay;
    
    generateBlocks();
    if (interval) {
        clearInterval(interval);
    }
    interval = setInterval(gameLoop, frameTime);
}

function generateBlocks() {
    for (var i = 0; i < xBlocks; i++) {
        for (var j = 0; j < yBlocks; j++) {
            if (true) {
                var count = 1+Math.floor(Math.random()*Math.random()*5);
                var block = CountBlock(blockGap+blockWidth/2+(blockWidth+blockGap)*i, blockGap+blockHeight/2+(blockHeight+blockGap)*j, blockWidth, blockHeight, count);
                blocks.push(block);
            }/*
            else if (Math.random() < 0.2) {
                var block = StaticBlock(blockGap+blockWidth/2+(blockWidth+blockGap)*i, blockGap+blockHeight/2+(blockHeight+blockGap)*j, blockWidth, blockHeight, 'gray');
                blocks.push(block);
            }
            else {
                var block = Block(blockGap+blockWidth/2+(blockWidth+blockGap)*i, blockGap+blockHeight/2+(blockHeight+blockGap)*j, blockWidth, blockHeight, 'purple');
                blocks.push(block);
            }*/
        }
    }
}

function clear() {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvasWidth, canvasHeight);
}

function gameLoop() {
    // Clear screen
    clear();
    
    // Update game objects
    
    // Move paddle
    paddleMove = 0;
    if (pressingRight && !pressingLeft) {
        paddleMove = paddleSpeed;
    }
    if (pressingLeft && !pressingRight) {
        paddleMove = -paddleSpeed;
    }
    paddle.vx = paddleMove;
    paddle.update();
    
    // Prevent paddle from going past edge of screen
    if (paddle.x - paddle.width/2 <= 0) {
        paddle.x = paddle.width/2;
        paddle.vx = 0;
    }
    if (paddle.x + paddle.width/2 >= canvasWidth) {
        paddle.x = canvasWidth - paddle.width/2;
        paddle.vx = 0;
    }
    
    // Move ball
    lastBallX = ball.x;
    lastBallY = ball.y;
    ball.update();
    
    // Check for the ball being out of bounds, and reflect it off the wall/ceiling
    // Left wall
    if (ball.x - ball.width/2 <= 0) {
        var amtPast = -(ball.x - ball.width/2);
        ball.x = ball.width/2 + amtPast; //Push the ball out of the wall
        ball.vx = Math.abs(ball.vx); //Make x velocity positive so it's going the other way
    }
    // Right wall
    if (ball.x + ball.width/2 >= canvasWidth) {
        var amtPast = (ball.x + ball.width/2 - canvasWidth);
        ball.x = canvasWidth - ball.width/2 - amtPast;
        ball.vx = -Math.abs(ball.vx);
    }
    // Ceiling (remember canvas positions start in top left corner)
    if (ball.y - ball.height/2 <= 0) {
        var amtPast = -(ball.y - ball.height/2);
        ball.y = ball.height/2 + amtPast;
        ball.vy = Math.abs(ball.vy);
    }
    // Floor (temporary; will cause a decrease in score or something really)
    if (ball.y + ball.height/2 >= canvasHeight) {
        /*
        var amtPast = (ball.y + ball.height/2 - canvasHeight);
        ball.y = canvasHeight - ball.height/2 - amtPast;
        ball.vy = -Math.abs(ball.vy);
        */
        delay = deathDelay;
        lives--;
        ball.x = ballStartX;
        ball.y = ballStartY;
        ball.vx = 0;
        ball.vy = 0;
        if (lives == 0) {
            console.log('You lose!');
            startGame();
        }
    }
    
    // Check for ball hitting paddle
    var intPB = paddle.intersection(ball);
    if (intPB[0]) {
        // Reflect the ball
        ball.x = intPB[1][0];
        ball.y = intPB[1][1];
        ball.vx = intPB[2][0];
        ball.vy = intPB[2][1];
    }
    
    ball.vy -= gravity;
    // Prevent ball from getting stuck
    /*
    if (Math.abs(ball.vy) < stickThreshold) {
        ball.vy = -1+2*Math.random();
    }
    if (Math.abs(ball.vx) < stickThreshold) {
        ball.vx = -1+2*Math.random();
    }
    */
    if (Math.abs(ball.vx) > 2*Math.abs(ball.vy)) {
        ball.vy = 2*Math.sign(ball.vy)*Math.abs(ball.vx);
    }
    // Put bounds on ball speed
    var ballSpeed = Math.sqrt(Math.pow(ball.vx, 2) + Math.pow(ball.vy, 2));
    if (ballSpeed > maxBallSpeed) {
        ball.vx = maxBallSpeed*ball.vx/ballSpeed;
        ball.vy = maxBallSpeed*ball.vy/ballSpeed;
    }
    
    // Update the blocks (mostly for intersection)
    for (var i = blocks.length-1; i >= 0; i--) {
        blocks[i].update();
        var intWB = blocks[i].intersection(ball);
        if (intWB[0]) {
            // Delete the block
            if (blocks[i].name == 'CountBlock') {
                blocks[i].color--;
                if (blocks[i].color <= 0) {
                    blocks.splice(i, 1);
                    score++;
                }
            }
            else if (blocks[i].name == 'Block') {
                blocks.splice(i, 1);
                score++;
            }
            // Reflect the ball
            ball.x = intWB[1][0];
            ball.y = intWB[1][1];
            ball.vx = intWB[2][0];
            ball.vy = intWB[2][1];
        }
    }
    
    // Render objects
    drawObject(paddle);
    if (delay > 0) {
        delay--;
        if (delay == 0) {
            ball.vx = ballStartVX;
            ball.vy = ballStartVY;
        }
    }
    if (delay == 0) {
        drawObject(ball);
    }
    for (i = 0; i < blocks.length; i++) {
        drawObject(blocks[i]);
    }
    
    //Check for win
    if (blocks.length == 0) {
        console.log('You win!');
        startGame();
    }
}

function GameObject(x, y, w, h, c, t, n) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.color = c;
    this.type = t;
    this.name = n;
    this.vx = 0;
    this.vy = 0;
    this.update = function() {
        this.x += this.vx;
        this.y += this.vy;
        // Much to do here!
    };
    this.intersection = function(obj) {
        // Option: Add horizontal velocity on side intersection
        // Do the two objects intersect?
        // This will be run for each block intersecting with the ball, so assume obj is the ball
        // Intersection of rectangle with circle
        // Let's get a precise intersection
        // Ball is (x - x0)^2 + (y - y0)^2 = r^2
        // Block is four lines, x = x1 +/- w, y = y1 +/- h
        // Check for actual intersections by solving the following:
        // (x - x0)^2 + (y1 + h - y0)^2 - r^2 = 0  [bottom]
        // (x - x0)^2 + (y1 - h - y0)^2 - r^2 = 0  [top]
        // (x1 + w - x0)^2 + (y - y0)^2 - r^2 = 0  [right]
        // (x1 - w - x0)^2 + (y - y0)^2 - r^2 = 0  [left]
        var c_bottom = Math.pow(obj.x, 2) + Math.pow(this.y + this.height/2 - obj.y, 2) - Math.pow(obj.width/2, 2);
        var c_top = Math.pow(obj.x, 2) + Math.pow(this.y - this.height/2 - obj.y, 2) - Math.pow(obj.width/2, 2);
        var c_right = Math.pow(obj.y, 2) + Math.pow(this.x + this.width/2 - obj.x, 2) - Math.pow(obj.width/2, 2);
        var c_left = Math.pow(obj.y, 2) + Math.pow(this.x - this.width/2 - obj.x, 2) - Math.pow(obj.width/2, 2);
        // Calculate discriminants
        var disc_bottom = 4*(Math.pow(obj.x, 2) - c_bottom);
        var disc_top = 4*(Math.pow(obj.x, 2) - c_top);
        var disc_right = 4*(Math.pow(obj.y, 2) - c_right);
        var disc_left = 4*(Math.pow(obj.y, 2) - c_left);
        // Based on sign of discriminant, this tells whether or not there is a solution (intersection)
        // Size of ball allows at most two intersections (for a corner) -- this case is more complicated
        // Might not actually be intersecting -- let's find out
        if (disc_bottom >= 0) {
            var dx = Math.sqrt(disc_bottom)/2;
            if (obj.x - dx > this.x + this.width/2 || obj.x + dx < this.x - this.width/2) {
                return [false, null, null];
            }
            // There is actually a collision
            else if (obj.x + dx >= this.x - this.width/2 && obj.x - dx < this.x - this.width/2) {
                // Bottom left corner case
                // Reflection like this is the wrong approach...
                // Move in the direction orthogonal to the midpoint between the two intersection points?
                /*
                var nx = obj.x - (this.x - this.width/2);
                var ny = obj.y - (this.y + this.height/2);
                var n_mag = Math.sqrt(nx*nx + ny*ny);
                nx /= n_mag;
                ny /= n_mag;
                var v_dot_n = obj.vx*nx + obj.vy*ny;
                var newVX = obj.vx - 2*v_dot_n*nx;
                var newVY = obj.vy - 2*v_dot_n*ny;
                var amtPast = -(n_mag - obj.width/2);
                var newX = this.x - this.width/2 + nx*(obj.width/2 + amtPast);
                var newY = this.y + this.height/2 + ny*(obj.width/2 + amtPast);
                console.log('Bottom left');
                return [true, [newX, newY], [newVX, newVY]];
                */
                var ix = (obj.x + dx) - (this.x - this.width/2);
                var iy = (obj.y - Math.sqrt(disc_left)/2) - (this.y + this.height/2);
                var ballSpeed = Math.sqrt(obj.vx*obj.vx + obj.vy*obj.vy);
                var mag = Math.sqrt(ix*ix + iy*iy);
                var newVX = -ballSpeed*ix/mag;
                var newVY = -ballSpeed*iy/mag;
                //var nx = obj.x - (this.x - this.width/2);
                //var ny = obj.y - (this.y + this.height/2);
                //var n_mag = Math.sqrt(nx*nx + ny*ny);
                //var amtPast = -(n_mag - obj.width/2);
                var newX = obj.x;// - ix; //+ (obj.width/2 + amtPast)*newVX;
                var newY = obj.y;// - iy;//+ (obj.width/2 + amtPast)*newVY;
                return [true, [newX, newY], [newVX, newVY]];
            }
            else if (obj.x - dx <= this.x + this.width/2 && obj.x + dx > this.x + this.width/2) {
                // Bottom right corner case
                var ix = (obj.x - dx) - (this.x + this.width/2);
                var iy = (obj.y - Math.sqrt(disc_right)/2) - (this.y + this.height/2);
                var ballSpeed = Math.sqrt(obj.vx*obj.vx + obj.vy*obj.vy);
                var mag = Math.sqrt(ix*ix + iy*iy);
                var newVX = -ballSpeed*ix/mag;
                var newVY = -ballSpeed*iy/mag;
                //var nx = obj.x - (this.x + this.width/2);
                //var ny = obj.y - (this.y + this.height/2);
                //var n_mag = Math.sqrt(nx*nx + ny*ny);
                //var amtPast = -(n_mag - obj.width/2);
                var newX = obj.x;// - ix;// + (obj.width/2 + amtPast)*newVX;
                var newY = obj.y;// - iy;//+ (obj.width/2 + amtPast)*newVY;
                return [true, [newX, newY], [newVX, newVY]];
            }
            else {
                // Bottom center case
                var amtPast = (this.y + this.height/2) - (obj.y - obj.height/2);
                var newY = (this.y + this.height/2) + obj.height/2 + amtPast;
                var newVY = Math.abs(obj.vy);
                return [true, [obj.x, newY], [obj.vx, newVY]];
            }
        }
        else if (disc_top >= 0) {
            var dx = Math.sqrt(disc_top)/2;
            if (obj.x - dx > this.x + this.width/2 || obj.x + dx < this.x - this.width/2) {
                return [false, null, null];
            }
            // There is actually a collision
            else if (obj.x + dx >= this.x - this.width/2 && obj.x - dx < this.x - this.width/2) {
                // Top left corner case
                var ix = (obj.x + dx) - (this.x - this.width/2);
                var iy = (obj.y + Math.sqrt(disc_left)/2) - (this.y - this.height/2);
                var ballSpeed = Math.sqrt(obj.vx*obj.vx + obj.vy*obj.vy);
                var mag = Math.sqrt(ix*ix + iy*iy);
                var newVX = -ballSpeed*ix/mag;
                var newVY = -ballSpeed*iy/mag;
                //var nx = obj.x - (this.x - this.width/2);
                //var ny = obj.y - (this.y - this.height/2);
                //var n_mag = Math.sqrt(nx*nx + ny*ny);
                //var amtPast = -(n_mag - obj.width/2);
                var newX = obj.x;// + ix; //+ (obj.width/2 + amtPast)*newVX;
                var newY = obj.y;// - iy; //+ (obj.width/2 + amtPast)*newVY;
                return [true, [newX, newY], [newVX, newVY]];
            }
            else if (obj.x - dx <= this.x + this.width/2 && obj.x + dx > this.x + this.width/2) {
                // Top right corner case
                var ix = (obj.x - dx) - (this.x + this.width/2);
                var iy = (obj.y + Math.sqrt(disc_right)/2) - (this.y - this.height/2);
                var ballSpeed = Math.sqrt(obj.vx*obj.vx + obj.vy*obj.vy);
                var mag = Math.sqrt(ix*ix + iy*iy);
                var newVX = -ballSpeed*ix/mag;
                var newVY = -ballSpeed*iy/mag;
                //var nx = obj.x - (this.x + this.width/2);
                //var ny = obj.y - (this.y - this.height/2);
                //var n_mag = Math.sqrt(nx*nx + ny*ny);
                //var amtPast = -(n_mag - obj.width/2);
                var newX = obj.x;// - ix;
                var newY = obj.y;// - iy;
                return [true, [newX, newY], [newVX, newVY]];
            }
            else {
                // Top center case
                var amtPast = obj.y + obj.height/2 - (this.y - this.height/2);
                var newY = (this.y - this.height/2) - obj.height/2 - amtPast;
                var newVY = -Math.abs(obj.vy);
                return [true, [obj.x, newY], [obj.vx, newVY]];
            }
        }
        else if (disc_right >= 0) {
            var dy = Math.sqrt(disc_right)/2;
            if (obj.y - dy > this.y + this.height/2 || obj.y + dy < this.y - this.height/2) {
                return [false, null, null];
            }
            // There is actually a collision
            else {
                // Right center case (corners already covered)
                var amtPast = (this.x + this.width/2) - (obj.x - obj.width/2);
                var newX = (this.x + this.width/2) + obj.width/2 + amtPast;
                var newVX = Math.abs(obj.vx);
                return [true, [newX, obj.y], [newVX, obj.vy]];
            }
        }
        else if (disc_left >= 0) {
            var dy = Math.sqrt(disc_left)/2;
            if (obj.y - dy > this.y + this.height/2 || obj.y + dy < this.y - this.height/2) {
                return [false, null, null];
            }
            // There is actually a collision
            else {
                // Left center case (corners already covered)
                var amtPast = obj.x + obj.width/2 - (this.x - this.width/2);
                var newX = (this.x - this.width/2) - obj.width/2 - amtPast;
                var newVX = -Math.abs(obj.vx);
                return [true, [newX, obj.y], [newVX, obj.vy]];
            }
        }
        else {
            // Otherwise no intersections
            // These don't account for cases when the ball ends up entirely inside the block, which could happen if it was moving too fast... Do these need to be accounted for? Realistically, probably not, but we'll see.
            return [false, null, null];
        }
    }
}

function Block(x, y, w, h, c) {
    return new GameObject(x, y, w, h, c, 'Rectangle', 'Block');
}

function CountBlock(x, y, w, h, c) {
    return new GameObject(x, y, w, h, c, 'Rectangle', 'CountBlock');
}

function StaticBlock(x, y, w, h, c) {
    return new GameObject(x, y, w, h, c, 'Rectangle', 'StaticBlock');
}

function Ball(x, y) {
    return new GameObject(x, y, ballSize, ballSize, ballColor, 'Circle', 'Ball');
}

function Paddle(x, y) {
    return new GameObject(x, y, paddleWidth, paddleHeight, paddleColor, 'Rectangle', 'Paddle');
}

function drawObject(object) {
    if (object.name == 'CountBlock') {
        if (object.color == 1) {
            context.fillStyle = 'red';
        }
        else if (object.color == 2) {
            context.fillStyle = 'orange';
        }
        else if (object.color == 3) {
            context.fillStyle = 'yellow';
        }
        else if (object.color == 4) {
            context.fillStyle = 'green';
        }
        else if (object.color == 5) {
            context.fillStyle = 'blue';
        }
    }
    else {
        context.fillStyle = object.color;
    }
    if (object.type == 'Rectangle') {
        context.fillRect(object.x - object.width/2, object.y-object.height/2, object.width, object.height);
    }
    if (object.type == 'Circle') {
        context.beginPath();
        context.ellipse(object.x, object.y, object.width/2, object.height/2, 0, 0, 2*Math.PI);
        context.fill();
    }
}