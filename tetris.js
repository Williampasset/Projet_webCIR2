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

console.log(canvas.width);
console.log(canvas.height);
console.log(numColumns);
console.log(numRows);

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

// Exemple d'instanciation d'un bloc
var myBlock = new Block(3, 5, "red");

// Fonction pour dessiner un bloc sur le canevas
function drawBlock(block) {
    ctx.fillStyle = block.color; // Définir la couleur de remplissage
    ctx.fillRect(block.x * blockSize, block.y * blockSize, blockSize, blockSize); // Dessiner le bloc
}

var myBlock = new Block(3, 5, "red");
drawBlock(myBlock);

// Définition des modèles de blocs Tetris
var blockPatterns = {
    // Ligne
    line: [
        [1, 1, 1, 1]
    ],

    // Carré
    square: [
        [1, 1],
        [1, 1]
    ],

    // L
    L: [
        [1, 0],
        [1, 0],
        [1, 1]
    ],

    // T
    T: [
        [1, 1, 1],
        [0, 1, 0]
    ],

    // Z
    Z: [
        [1, 1, 0],
        [0, 1, 1]
    ],

    // S
    S: [
        [0, 1, 1],
        [1, 1, 0]
    ],

    // J
    J: [
        [0, 1],
        [0, 1],
        [1, 1]
    ]
};

// Exemple d'utilisation d'un modèle de bloc (ligne)
var linePattern = blockPatterns.line;


