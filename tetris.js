// Récupération du canevas et du contexte 2D
var canvas = document.getElementById("tetrisCanvas");
var ctx = canvas.getContext("2d");

// Taille d'un bloc du Tetris (30 pixels par 30 pixels)
var blockSize = 30;
canvas.width = 300; // Largeur du canevas
canvas.height = 540; // Hauteur du canevas

// Nombre de colonnes et de lignes pour la grille
var numColumns = canvas.width / blockSize;
var numRows = canvas.height / blockSize;

// Dessiner la grille
function drawGrid() {
    ctx.beginPath();
    ctx.strokeStyle = "#ccc"; // Couleur de la grille
    ctx.lineWidth = 1;

    // Dessiner les lignes verticales
    for (var x = 0; x <= canvas.width; x += blockSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }

    // Dessiner les lignes horizontales
    for (var y = 0; y <= canvas.height; y += blockSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }

    ctx.stroke();
}

// Appel de la fonction pour dessiner la grille
drawGrid();

// Objet Bloc
function Block(x, y, color) {
    this.x = x; // Position x du bloc
    this.y = y; // Position y du bloc
    this.color = color; // Couleur du bloc
}

// Fonction pour dessiner un bloc sur le canevas
function drawBlock(block) {
    ctx.fillStyle = block.color; // Définir la couleur de remplissage
    ctx.fillRect(block.x * blockSize, block.y * blockSize, blockSize, blockSize); // Dessiner le bloc
}

function drawPattern(pattern){
    for (var y = 0; y < pattern.length; y++) {
        for (var x = 0; x < pattern[y].length; x++) {
            if (pattern[y][x] === 1) {
                drawBlock(new Block(x, y, "blue"));
            }
        }
    }
}

var patternSelection = ["line", "square", "L", "T", "Z", "S", "J"];
var currentPattern = patternSelection[Math.floor(Math.random() * patternSelection.length)];

function drawCurrentPattern(){
    drawPattern(blockPatterns[currentPattern]);
}

drawCurrentPattern();

function clearCanvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
}

function clearPattern(){
    for (var y = 0; y < blockPatterns[currentPattern].length; y++) {
        for (var x = 0; x < blockPatterns[currentPattern][y].length; x++) {
            if (blockPatterns[currentPattern][y][x] === 1) {
                drawBlock(new Block(x, y, "white"));
            }
        }
    }
}
function fallBlock(block){
    block.y++;
    drawBlock(block);
}

function fallPattern(pattern){
    for (var y = 0; y < pattern.length; y++) {
        for (var x = 0; x < pattern[y].length; x++) {
            if (pattern[y][x] === 1) {
                fallBlock(new Block(x, y, "blue"));
            }
        }
    }
}

fallPattern(blockPatterns[currentPattern]);