var canvasWidth = 800;
var canvasHeight = 600;
var backgroundColor = 'black';
var suits = ['C', 'D', 'H', 'S'];

var canMove = false;
var deck = [];
var usedDeck = [];
var drawPile = [];
var stackC = [];
var stackD = [];
var stackS = [];
var stackH = [];
var gameBoard = [];

var canvas;
var context;

var cardFont = '16px Consolas';
var cardBorderColor = 'gray';
var borderSize = 2;
var cardColor = 'white';
var cardBackColor = 'blue';
var cardWidth = 80;
var cardHeight = 120;
var numberX = 5;
var numberY = 15;
var suitX = 5;
var suitY = 30;
var bottomOffsetX = -18;
var bottomOffsetY = 10;

var gameRow1Y = 30;
var deckX = 30;
var drawX = 30*2+80;
var drawDiff = 40;
var stackCX = 30*4+80*3;
var stackDX = 30*5+80*4;
var stackHX = 30*6+80*5;
var stackSX = 30*7+80*6;

var gameRow2Y = 30*2+120;
var gameBoardX = 30;
var boardDiffX = 80+30;
var boardDiffY = 30;

var dragStack = 'none';
var dragPosition = 0;


function getSuitSymbol(suit) {
    if (suit == 'C') {
        return '\u2663';
    }
    else if (suit == 'D') {
        return '\u2666';
    }
    else if (suit == 'H') {
        return '\u2665';
    }
    else if (suit == 'S') {
        return '\u2660';
    }
    else {
        console.log('What??');
        return 'X';
    }
}

function init() {
    canMove = false;
    canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    context = canvas.getContext('2d');
    document.body.insertBefore(canvas, document.body.childNodes[0]);
    canvas.addEventListener('contextmenu', function(e){e.preventDefault();}, false);
    canvas.addEventListener('mousedown', mouseDownEvent);
    canvas.addEventListener('mouseup', mouseUpEvent);
}

// Problem: Canvas will be slightly offset from the page position...
function mouseDownEvent(e) {
    // Begin click
    if (canMove) {
        canMove = false;
        var cardLoc = getCardFromClick(e.pageX, e.pageY);
        if (cardLoc[0] != 'none') {
            if (e.button == 2) {
                // Right click
                // Can only click the top card of the draw pile
                if (cardLoc[0] == 'draw' && drawPile.length > 0 && cardLoc[1] == drawPile.length-1) {
                    if (canAddToSolution(drawPile[cardLoc[1]])) {
                        var card = drawPile.pop();
                        addToSolution(card);
                    }
                }
                // Can only add from the top card of the stacks
                if (cardLoc[0] == 'board' && gameBoard[cardLoc[1][0]].length > 0 && cardLoc[1][1] == gameBoard[cardLoc[1][0]].length-1) {
                    if (canAddToSolution(gameBoard[cardLoc[1][0]][cardLoc[1][1]])) {
                        var card = gameBoard[cardLoc[1][0]].pop();
                        addToSolution(card);
                    }
                }
            }
            else {
                // Left click
                if (cardLoc[0] == 'deck') {
                    // Draw (up to) 3 more cards
                    if (deck.length == 0) {
                        reshuffle();
                        console.log('Shuffled');
                        draw3();
                    }
                    else {
                        draw3();
                    }
                }
                else {
                    // Dragging
                    // Can only click the top card of the draw pile
                    if (cardLoc[0] == 'draw') {
                        if (drawPile.length > 0 && cardLoc[1] == drawPile.length-1) {
                            dragStack = cardLoc[0];
                            dragPosition = cardLoc[1]; // Redundant
                            console.log('Dragging '+dragStack+' '+dragPosition);
                        }
                    }
                    // Not true of the game board, but there still must be a card present, and the card must be visible
                    else if (cardLoc[0] == 'board') {
                        if (gameBoard[cardLoc[1][0]].length > 0 && gameBoard[cardLoc[1][0]][cardLoc[1][1]].visible) {
                            dragStack = cardLoc[0];
                            dragPosition = cardLoc[1];
                            console.log('Dragging '+dragStack+' '+dragPosition);
                        }
                    }
                    // Solution stacks
                    else if (cardLoc[0] == 'stackC') {
                        if (stackC.length > 0) {
                            dragStack = cardLoc[0];
                            dragPosition = 0;
                            console.log('Dragging '+dragStack+' '+dragPosition);
                        }
                    }
                    else if (cardLoc[0] == 'stackD') {
                        if (stackD.length > 0) {
                            dragStack = cardLoc[0];
                            dragPosition = 0;
                            console.log('Dragging '+dragStack+' '+dragPosition);
                        }
                    }
                    else if (cardLoc[0] == 'stackH') {
                        if (stackH.length > 0) {
                            dragStack = cardLoc[0];
                            dragPosition = 0;
                            console.log('Dragging '+dragStack+' '+dragPosition);
                        }
                    }
                    else if (cardLoc[0] == 'stackS') {
                        if (stackS.length > 0) {
                            dragStack = cardLoc[0];
                            dragPosition = 0;
                            console.log('Dragging '+dragStack+' '+dragPosition);
                        }
                    }
                }
            }
            revealCards();
            render();
            checkEndConditions();
        }
        canMove = true;
    }
}

function mouseUpEvent(e) {
    // End click (for dragging, only left click)
    if (canMove && dragStack != 'none' && e.button == 0) {
        canMove = false;
        var cardLoc = getCardFromClick(e.pageX, e.pageY);
        if (cardLoc[0] == 'board') {
            // Potentially drag a whole stack of cards...
            // What's the bottom of the stack?
            var bottom;
            if (dragStack == 'draw') {
                bottom = drawPile[drawPile.length-1];
            }
            else if (dragStack == 'stackC') {
                bottom = stackC[stackC.length-1];
            }
            else if (dragStack == 'stackD') {
                bottom = stackD[stackD.length-1];
            }
            else if (dragStack == 'stackH') {
                bottom = stackH[stackH.length-1];
            }
            else if (dragStack == 'stackS') {
                bottom = stackS[stackS.length-1];
            }
            else if (dragStack == 'board') {
                bottom = gameBoard[dragPosition[0]][dragPosition[1]];
            }
            var valid = false;
            if (gameBoard[cardLoc[1][0]].length == 0 && bottom.number == 13) {
                valid = true;
            }
            else if (cardLoc[1][1] == gameBoard[cardLoc[1][0]].length-1) {
                // What's the target?
                target = gameBoard[cardLoc[1][0]][cardLoc[1][1]];
                console.log('here');
                valid = canStack(target, bottom);
            }
            if (valid) {
                // Stack
                var tempstack = [];
                if (dragStack == 'board') {
                    var tempLength = gameBoard[dragPosition[0]].length;
                    for (var i = dragPosition[1]; i < tempLength; i++) {
                        tempstack.push(gameBoard[dragPosition[0]].pop());
                    }
                }
                else if (dragStack == 'draw') {
                    tempstack.push(drawPile.pop());
                }
                else if (dragStack == 'stackC') {
                    tempstack.push(stackC.pop());
                }
                else if (dragStack == 'stackD') {
                    tempstack.push(stackD.pop());
                }
                else if (dragStack == 'stackH') {
                    tempstack.push(stackH.pop());
                }
                else if (dragStack == 'stackS') {
                    tempstack.push(stackS.pop());
                }
                for (i = tempstack.length-1; i >= 0; i--) {
                    gameBoard[cardLoc[1][0]].push(tempstack[i]);
                }
            }
        }
        else if (cardLoc[0] == 'stackC' || cardLoc[0] == 'stackD' || cardLoc[0] == 'stackH' || cardLoc[0] == 'stackS') {
            // Make sure selected stack is a single card
            if (dragStack == 'draw') {
                if (canAddToSolution(drawPile[drawPile.length-1])) {
                    var card = drawPile.pop();
                    addToSolution(card);
                }
            } 
            else if (dragStack == 'board' && dragPosition[1] == gameBoard[dragPosition[0]].length-1) {
                if (canAddToSolution(gameBoard[dragPosition[0]][dragPosition[1]])) {
                    var card = gameBoard[dragPosition[0]].pop();
                    addToSolution(card);
                }
            }
        }
        dragStack = 'none';
        dragPosition = 0;
        revealCards();
        render();
        checkEndConditions();
        canMove = true;
    }
}

function getCardFromClick(x, y) {
    if (y >= gameRow1Y && y <= gameRow1Y + cardHeight) {
        if (x >= deckX && x <= deckX + cardWidth) {
            // Deck
            return ['deck', 0];
        }
        else if (x >= drawX && x <= drawX + drawDiff*2 + cardWidth) {
            // Draw pile
            if (drawPile.length == 0) {
                if (x <= drawX + cardWidth) {
                    return ['draw', 0];
                }
                else {
                    return ['none', 0];
                }
            }
            else if (x > drawX + drawDiff*(drawPile.length - 1) + cardWidth) {
                return ['none', 0];
            }
            else if (x < drawX + drawDiff*(drawPile.length - 1)) {
                return ['draw', Math.floor((x - drawX)/drawDiff)];
            }
            else {
                return ['draw', drawPile.length-1];
            }
        }
        else if (x >= stackCX && x <= stackCX + cardWidth) {
            // Stack C
            return ['stackC', 0];
        }
        else if (x >= stackDX && x <= stackDX + cardWidth) {
            // Stack D
            return ['stackD', 0];
        }
        else if (x >= stackHX && x <= stackHX + cardWidth) {
            // Stack H
            return ['stackH', 0];
        }
        else if (x >= stackSX && x <= stackSX + cardWidth) {
            // Stack S
            return ['stackS', 0];
        }
    }
    else if (y >= gameRow2Y) {
        if ((x - gameBoardX) % boardDiffX <= cardWidth) {
            var i = Math.floor((x - gameBoardX) / boardDiffX);
            
            if (gameBoard[i].length == 0) {
                if (y <= gameRow2Y + cardHeight) {
                    return ['board', [i, 0]];
                }
                else {
                    return ['none', 0];
                }
            }
            else if (y > gameRow2Y + boardDiffY*(gameBoard[i].length - 1) + cardHeight) {
                return ['none', 0];
            }
            else if (y < gameRow2Y + boardDiffY*(gameBoard[i].length - 1)) {
                return ['board', [i, Math.floor((y - gameRow2Y)/boardDiffY)]];
            }
            else {
                return ['board', [i, gameBoard[i].length-1]];
            }
            
        }
        else {
            return ['none', 0];
        }
    }
    return ['none', 0];
}

function render() {
    // Clear
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw game
    if (deck.length > 0) {
        renderCard(null, deckX, gameRow1Y, false);
    }
    for (var i = 0; i < drawPile.length; i++) {
        renderCard(drawPile[i], drawX+drawDiff*i, gameRow1Y, true);
    }
    if (stackC.length > 0) {
        renderCard(stackC[stackC.length-1], stackCX, gameRow1Y, true);
    }
    if (stackD.length > 0) {
        renderCard(stackD[stackD.length-1], stackDX, gameRow1Y, true);
    }
    if (stackH.length > 0) {
        renderCard(stackH[stackH.length-1], stackHX, gameRow1Y, true);
    }
    if (stackS.length > 0) {
        renderCard(stackS[stackS.length-1], stackSX, gameRow1Y, true);
    }
    for (i = 0; i < gameBoard.length; i++) {
        for (var j = 0; j < gameBoard[i].length; j++) {
            renderCard(gameBoard[i][j], gameBoardX+boardDiffX*i, gameRow2Y+boardDiffY*j, gameBoard[i][j].visible);
        }
    }
}

function drawOutline(x, y) {
    // How?
}
        
function renderCard(card, x, y, faceUp) {
    if (faceUp) {
        // Draw box for card
        context.fillStyle = cardBorderColor;
        context.fillRect(x, y, cardWidth, cardHeight);
        context.fillStyle = cardColor;
        context.fillRect(x+borderSize, y+borderSize, cardWidth-2*borderSize, cardHeight-2*borderSize);
        // Write number and suit at corners
        this.context.font = cardFont;
        context.fillStyle = card.color;
        context.fillText(card.name, x+numberX, y+numberY);
        context.fillText(getSuitSymbol(card.suit), x+suitX, y+suitY);
        var tmpNumber = ''+card.number
        if (tmpNumber.length == 1) {
            tmpNumber = ' '+tmpNumber;
        }
        var tmpName = card.name;
        if (card.number != 10) {
            tmpName = ' ' + tmpName;
        }
        context.fillText(tmpName, x+cardWidth-numberX+bottomOffsetX, y+cardHeight-numberY+bottomOffsetY);
        context.fillText(' '+getSuitSymbol(card.suit), x+cardWidth-suitX+bottomOffsetX, y+cardHeight-suitY+bottomOffsetY);
        // Could rotate to get the more realistic card, but oh well
        // These are strangely blurry...
    }
    else {
        context.fillStyle = cardBorderColor;
        context.fillRect(x, y, cardWidth, cardHeight);
        context.fillStyle = cardBackColor;
        context.fillRect(x+borderSize, y+borderSize, cardWidth-2*borderSize, cardHeight-2*borderSize);
        //console.log(x + ' ' + y + ' ' + cardWidth + ' ' + cardHeight);
    }
}


function startGame() {
    // Generate deck
    deck = [];
    usedDeck = [];
    for (var suitIndex = 0; suitIndex < 4; suitIndex++) {
        for (var number = 1; number < 14; number++) {
            var card = new Card(number, suits[suitIndex], false);
            deck.push(card);
        }
    }
    shuffle(deck);
    // Initialize game state
    drawPile = [];
    stackC = [];
    stackD = [];
    stackS = [];
    stackH = [];
    gameBoard = new Array(7);
    for (var i = 0; i < 7; i++) {
        gameBoard[i] = [];
    }
    
    // Put cards onto game board
    for (i = 0; i < gameBoard.length; i++) {
        for (var j = i; j < gameBoard.length; j++) {
            var card = drawCard();
            if (i == j) {
                card.flip();
            }
            gameBoard[j].push(card);
        }
    }
    dragStack = 'none';
    dragPosition = 0;
    render();
    canMove = true;
}

function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function drawCard() {
    return deck.pop();
}

function draw3() {
    var tempLength = drawPile.length;
    var toDraw = 3 - drawPile.length;
    if (drawPile.length == 3) {
        for (var i = 0; i < tempLength; i++) {
            usedDeck.push(drawPile.pop());
        }
        toDraw = 3;
    }
    console.log(toDraw);
    for (i = 0; i < toDraw; i++) {
        if (deck.length > 0) {
            var card = drawCard();
            card.flip();
            drawPile.push(card);
        }
    }
}

function reshuffle() {
    var tempLength = drawPile.length;
    for (var i = 0; i < tempLength; i++) {
        usedDeck.push(drawPile.pop());
    }
    deck = usedDeck;
    usedDeck = [];
    shuffle(deck);
}

function canAddToSolution(card) {
    if (card.suit == 'C') {
        if (stackC.length == 0) {
            return (card.number == 1);
        }
        else {
            return (card.number == stackC[stackC.length-1].number + 1);
        }
    }
    else if (card.suit == 'D') {
        if (stackD.length == 0) {
            return (card.number == 1);
        }
        else {
            return (card.number == stackD[stackD.length-1].number + 1);
        }
    }
    else if (card.suit == 'H') {
        if (stackH.length == 0) {
            return (card.number == 1);
        }
        else {
            return (card.number == stackH[stackH.length-1].number + 1);
        }
    }
    else if (card.suit == 'S') {
        if (stackS.length == 0) {
            return (card.number == 1);
        }
        else {
            return (card.number == stackS[stackS.length-1].number + 1);
        }
    }
    else {
        console.log('What have you done???');
        return false;
    }
}

// Assume canAddToSolution has been called and returned true
function addToSolution(card) {
    if (card.suit == 'C') {
        stackC.push(card);
    }
    else if (card.suit == 'D') {
        stackD.push(card);
    }
    else if (card.suit == 'H') {
        stackH.push(card);
    }
    else if (card.suit == 'S') {
        stackS.push(card);
    }
    else {
        console.log('What have you done???');
    }
}

function canStack(topcard, bottomcard) {
    return (topcard.number == bottomcard.number + 1 && topcard.color != bottomcard.color); 
}

function revealCards() {
    for (var i = 0; i < gameBoard.length; i++) {
        if (gameBoard[i].length > 0 && !gameBoard[i][gameBoard[i].length-1].visible) {
            gameBoard[i][gameBoard[i].length-1].flip();
        }
    }
}

function checkEndConditions() {
    // Win: No gameboard left
    var gameBoardLeft = 0;
    for (var i = 0; i < gameBoard.length; i++) {
        gameBoardLeft += gameBoard[i].length;
    }
    if (gameBoardLeft == 0) {
        // Game won
        console.log('You won!');
    }
    
    // Lose: No moves possible left (and not won)
    else {
        // TODO: Need to somehow not account for when you can only move a card back and forth without any real change
        var possibleMoves = 0;
        for (i = 0; i < gameBoard.length; i++) {
            if (gameBoard[i].length == 0) {
                // Check the game for 13
                possibleMoves += checkForCard(13, 'red', false);
                possibleMoves += checkForCard(13, 'red', true);
                possibleMoves += checkForCard(13, 'black', false);
                possibleMoves += checkForCard(13, 'black', true);
            }
            else {
                for (var j = 0; j < gameBoard[i].length; j++) {
                    if (isValidPosition(i, j) && gameBoard[i][j].visible) {
                        var bottom = gameBoard[i][j];
                        // Check for number-1 of opposite color
                        var color = (bottom.color == 'red') ? 'black' : 'red';
                        possibleMoves += checkForCard(bottom.number+1, color, true);
                        if (j == gameBoard[i].length-1) {
                            possibleMoves += checkForCard(bottom.number-1, color, false);
                            if (canAddToSolution(bottom)) {
                                console.log(bottom.number+' '+bottom.color+' can be stacked (board)');
                                possibleMoves++;
                            }
                        }
                    }
                }
            }
        }
        for (i = 0; i < deck.length; i++) {
            if (canAddToSolution(deck[i])) {
                console.log(deck[i].number+' '+deck[i].color+' can be stacked (deck)');
                possibleMoves++;
            }
        }
        for (i = 0; i < usedDeck.length; i++) {
            if (canAddToSolution(usedDeck[i])) {
                console.log(usedDeck[i].number+' '+usedDeck[i].color+' can be stacked (used)');
                possibleMoves++;
            }
        }
        for (i = 0; i < drawPile.length; i++) {
            if (canAddToSolution(drawPile[i])) {
                console.log(drawPile[i].number+' '+drawPile[i].color+' can be stacked (draw)');
                possibleMoves++;
            }
        }
        console.log('Possible moves: '+possibleMoves);
        if (possibleMoves == 0) {
            console.log('You lose!');
        }
    }
}

function isValidPosition(i, j) {
    if (j == gameBoard[i].length-1) {
        return true;
    }
    for (var k = j; k < gameBoard[i].length-1; k++) {
        if (gameBoard[i][k].number != gameBoard[i][k+1].number + 1) {
            return false;
        }
    }
    return true;
}

function checkForCard(number, color, board) {
    var count = 0;
    if (!board) {
        for (var i = 0; i < deck.length; i++) {
            if (deck[i].number == number && deck[i].color == color) {
                count++;
            }
        }
        for (i = 0; i < usedDeck.length; i++) {
            if (usedDeck[i].number == number && usedDeck[i].color == color) {
                count++;
            }
        }
        for (i = 0; i < drawPile.length; i++) {
            if (drawPile[i].number == number && drawPile[i].color == color) {
                count++;
            }
        }
    }
    else if (board) {
        for (i = 0; i < gameBoard.length; i++) {
            if (gameBoard[i].length > 0) {
                if (gameBoard[i][gameBoard[i].length-1].number == number && gameBoard[i][gameBoard[i].length-1].color == color) {
                    count++;
                }
            }
        }
    }
    if (count > 0) {
       console.log('Found '+number+' '+color+' x '+count+' ('+board+')');
    }
    return count;
}

// Numbers 1-13
// A = 1
// J = 11
// Q = 12
// K = 13
// Suits C, D, H, S
function Card(number, suit, visible) {
    this.number = number;
    this.suit = suit;
    this.visible = visible;
    this.color = (this.suit == 'C' || this.suit == 'S') ? 'black' : 'red';
    this.name = ''+number;
    if (this.name == '1') {
        this.name = 'A';
    }
    else if (this.name == '11') {
        this.name = 'J';
    }
    else if (this.name == '12') {
        this.name = 'Q';
    }
    else if (this.name == '13') {
        this.name = 'K';
    }
    this.flip = function() {
        this.visible = !this.visible;
    }
}


