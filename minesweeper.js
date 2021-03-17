var playing = false;
var ended = false;
var initialMines = 10;
var minesLeft = initialMines;
var time = 0;
var timer;
var totalRevealed = 0;
var mouseEvent;

// Size of the playing field
var width = 10;
var height = 10;

// Number of adjacent mines at each tile
var field;
// 0 - 8 
// 9 = mine

// State of each tile
var state;
// 0 - Not revealed
// 1 - Revealed
// 2 - Flagged
// 3 - Activated mine

function mouseInteractEvent(e) {
    if (e.target.matches('td')) {
        var elid = e.target.getAttribute('id');
        var r = parseInt(elid.split('-')[1]);
        var c = parseInt(elid.split('-')[2]);
        var rightclick;
        if (!e) var e = window.event;
        if (e.which) rightclick = (e.which == 3);
        else if (e.button) rightclick = (e.button == 2);
        if (rightclick) {
            // Right click
            flag(r, c);
        }
        else {
            // Left click
            reveal(r, c);
        }
    }
}

function addEventListeners() {
    var table = document.getElementById('game');
    table.addEventListener('contextmenu', function(e){e.preventDefault();}, false);
    table.addEventListener('mouseup', mouseInteractEvent);
}

function init() {
    width = document.getElementById('width').value;
    if (!width) {
        width = 10;
    }
    if (width < 10) {
        width = 10;
    }
    if (width > 40) {
        width = 40;
    }
    height = document.getElementById('height').value;
    if (!height) {
        height = 10;
    }
    if (height < 10) {
        height = 10;
    }
    if (height > 40) {
        height = 40;
    }
    initialMines = document.getElementById('initialMines').value;
    if (!initialMines) {
        initialMines = 10;
    }
    if (initialMines < 1) {
        initialMines = 1;
    }
    if (initialMines > width*height - 1) {
        initialMines = width*height - 1;
    }
    // Initialize field
    field = new Array(height);
    state = new Array(height);
    for (var i = 0; i < height; i++) {
        field[i] = new Array(width);
        state[i] = new Array(width);
    }
    for (i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
            field[i][j] = 0;
            state[i][j] = 0;
        }
    }
    // Create game objects
    var table = document.getElementById('game');
    // Delete anything inside the table
    table.innerHTML = '';
    // Add back the game objects
    for (i = 0; i < height; i++) {
        var row = document.createElement('tr');
        row.setAttribute('id', 'row-'+i);
        for (j = 0; j < width; j++) {
            var cell = document.createElement('td');
            cell.setAttribute('id', 'cell-'+i+'-'+j);
            cell.setAttribute('class', 'hidden');
            cell.innerHTML = ' ';
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    // Reset play variables
    time = 0;
    minesLeft = initialMines;
    totalRevealed = 0;
    document.getElementById('minesLeft').innerHTML = minesLeft;
    document.getElementById('time').innerHTML = time;
    playing = false;
    ended = false;
    document.getElementById('message').innerHTML = '';
}

function startGame(r, c) {
    // Add mines
    minesLeft = initialMines;
    // Pick random places
    var minesPlaced = 0;
    while (minesPlaced < minesLeft) {
        //console.log(minesPlaced);
        var mr = Math.floor(height*Math.random());
        var mc = Math.floor(width*Math.random());
        if (!(r == mr && c == mc) && field[mr][mc] == 0) {
            field[mr][mc] = 9;
            minesPlaced++;
        }
    }
    // Fill in all the other numbers
    for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
            if (field[i][j] != 9) {
                // Count the number of adjacent mines
                var count = 0;
                var adj = [];
                if (i > 0) {
                    if (j > 0) {
                        adj.push(field[i-1][j-1]);
                    }
                    adj.push(field[i-1][j]);
                    if (j < width-1) {
                        adj.push(field[i-1][j+1]);
                    }
                }
                if (j > 0) {
                    adj.push(field[i][j-1]);
                }
                if (j < width-1) {
                    adj.push(field[i][j+1]);
                }
                if (i < height-1) {
                    if (j > 0) {
                        adj.push(field[i+1][j-1]);
                    }
                    adj.push(field[i+1][j]);
                    if (j < width-1) {
                        adj.push(field[i+1][j+1]);
                    }
                }
                for (var k = 0; k < 8; k++) {
                    if (adj[k] == 9) {
                        count += 1;
                    }
                }
                // Set to this number
                field[i][j] = count;
            }
        }
    }
    playing = true;
    time = 0;
    totalRevealed = 0;
    document.getElementById('minesLeft').innerHTML = minesLeft;
    document.getElementById('time').innerHTML = time;
    // Increment time every second
    if (timer) {
        clearInterval(timer);
    }
    timer = setInterval(timeStep, 1000);
    // Begin
}

function timeStep() {
    time++;
    document.getElementById('time').innerHTML = time;
}

function reveal(r, c) {
    if (r < 0 || r >= height || c < 0 || c >= width) {
        console.log('('+r+', '+c+') Do not do that!');
    }
    else {
        if (!ended) {
            if (playing) {
                if (state[r][c] == 0) {
                    if (field[r][c] == 9) {
                        // It's a mine!
                        state[r][c] = 3;
                        // Show all mines
                        for (var i = 0; i < height; i++) {
                            for (var j = 0; j < width; j++) {
                                if (field[i][j] == 9) {
                                    var cell = document.getElementById('cell-'+i+'-'+j);
                                    cell.setAttribute('class', 'mine');
                                    cell.innerHTML = 'X';
                                }
                            }
                        }
                        //Lost!
                        document.getElementById('message').innerHTML = 'You lost!';
                        playing = false;
                        ended = true;
                        clearInterval(timer);
                    }
                    else {
                        // Safe.
                        state[r][c] = 1;
                        totalRevealed++;
                        var cell = document.getElementById('cell-'+r+'-'+c);
                        var value = field[r][c];
                        cell.setAttribute('class', 'revealed'+value);
                        cell.innerHTML = value;
                        if (value == 0) {
                            // Recursion recursion (careful of the recursion!)
                            if (r > 0) {
                                if (c > 0) {
                                    reveal(r-1, c-1);
                                }
                                reveal(r-1, c);
                                if (c < width-1) {
                                    reveal(r-1, c+1);
                                }
                            }
                            if (c > 0) {
                                reveal(r, c-1);
                            }
                            if (c < width-1) {
                                reveal(r, c+1);
                            }
                            if (r < height-1) {
                                if (c > 0) {
                                    reveal(r+1, c-1);
                                }
                                reveal(r+1, c);
                                if (c < width - 1) {
                                    reveal(r+1, c+1);
                                }
                            }
                        }
                        // Check for win
                        if (totalRevealed == width*height - initialMines) {
                            // Won!
                            document.getElementById('message').innerHTML = 'You won!';
                            playing = false;
                            ended = true;
                            clearInterval(timer);
                        }
                    }
                }
            }
            else {
                startGame(r, c);
                reveal(r, c);
            }
        }
    }
}

function flag(r, c) {
    //console.log('Flag '+r+' '+c);
    if (r < 0 || r >= height || c < 0 || c >= width) {
        console.log('('+r+', '+c+') Do not do that!');
    }
    else {
        if (playing && !ended) {
            if (state[r][c] == 0) {
                state[r][c] = 2;
                minesLeft--;
                document.getElementById('minesLeft').innerHTML = minesLeft;
                var cell = document.getElementById('cell-'+r+'-'+c);
                cell.setAttribute('class', 'flag');
                cell.innerHTML = 'P'
            }
            else if (state[r][c] == 2) {
                state[r][c] = 0;
                minesLeft++;
                document.getElementById('minesLeft').innerHTML = minesLeft;
                var cell = document.getElementById('cell-'+r+'-'+c);
                cell.setAttribute('class', 'hidden');
                cell.innerHTML = ' '
            }
        }
    }
}