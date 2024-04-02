// Configuration du jeu
const config = {
    type: Phaser.AUTO,
    parent: 'tetrisContainer', // ID de l'élément HTML où le jeu sera affiché
    width: 300,
    height: 540,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Création de l'instance du jeu Phaser
const game = new Phaser.Game(config);

// Variables globales pour le jeu
let blockPatterns;
let blockSize = 30;
let currentPattern;
let cursors;
let halfBlockSize = blockSize / 2;

function preload() {
    // Chargement des ressources du jeu (images, etc.)
    this.load.image('stoneblock', 'img/stone_block.jpg');
    this.load.image('violetblock', 'img/block_violet.png');
    this.load.image('background', 'img/background.png');
}

function create() {
    // Initialisation du jeu
    blockPatterns = {
        line: [[1, 1, 1, 1]],
        square: [[1, 1], [1, 1]],
        L: [[1, 0], [1, 0], [1, 1]],
        T: [[1, 1, 1], [0, 1, 0]],
        Z: [[1, 1, 0], [0, 1, 1]],
        S: [[0, 1, 1], [1, 1, 0]],
        J: [[0, 1], [0, 1], [1, 1]]
    };

    // Choisir un motif Tetris aléatoire
    currentPattern = Object.keys(blockPatterns)[Math.floor(Math.random() * Object.keys(blockPatterns).length)];

    // Dessiner le motif Tetris initial
    drawPattern(blockPatterns[currentPattern], this);

    // Dessiner la carte de fond
    drawMap(this, blockSize, 10, 18, [
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]);

    // Gérer les entrées clavier
    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    // Mettre à jour le jeu
    if (cursors.down.isDown) {
        // Faire descendre le motif Tetris
        fallPattern(blockPatterns[currentPattern], this);
        console.log("Flèche bas pressée");
    }
}

function drawPattern(pattern, scene) {
    // Dessiner le motif Tetris
    let offsetX = 100;
    let offsetY = 100;

    for (let y = 0; y < pattern.length; y++) {
        for (let x = 0; x < pattern[y].length; x++) {
            if (pattern[y][x] === 1) {
                scene.add.image(x * blockSize + offsetX, y * blockSize + offsetY, 'violetblock');
            }
        }
    }
}

function clearPattern(pattern, scene) {
    // Effacer le motif Tetris en supprimant chaque sprite correspondant de la scène
    for (let y = 0; y < pattern.length; y++) {
        for (let x = 0; x < pattern[y].length; x++) {
            if (pattern[y][x] === 1) {
                // Trouver le sprite correspondant dans la scène et le supprimer
                let sprite = scene.children.getByName(`block_${x}_${y}`);
                if (sprite) {
                    sprite.destroy();
                }
            }
        }
    }
}

function fallPattern(pattern, scene) {
    // Effacer le motif Tetris de sa position actuelle
    clearPattern(pattern, scene);

    // Mettre à jour la position des blocs Tetris pour les faire descendre
    for (let y = pattern.length - 1; y >= 0; y--) {
        for (let x = 0; x < pattern[y].length; x++) {
            if (pattern[y][x] === 1) {
                if (y < pattern.length - 1 && pattern[y + 1][x] !== 1) {
                    // Si la case en dessous est vide, déplacer le bloc vers le bas
                    pattern[y + 1][x] = 1;
                    pattern[y][x] = 0;
                }
            }
        }
    }

    // Redessiner le motif Tetris à sa nouvelle position
    drawPattern(pattern, scene);
}

// Dans la fonction drawMap
function drawMap(scene, tileSize, mapWidth, mapHeight, mapData) {
    // Calculer les dimensions de la carte en pixels
    const mapPixelWidth = tileSize * mapWidth;
    const mapPixelHeight = tileSize * mapHeight;

    // Calculer les coordonnées de début pour centrer la carte dans la div
    const offsetX = (config.width - mapPixelWidth) / 2;
    const offsetY = (config.height - mapPixelHeight) / 2;

    // Dessiner chaque tuile de la carte
    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            const tileType = mapData[y][x];
            const tileX = x * tileSize + offsetX + tileSize / 2;
            const tileY = y * tileSize + offsetY + tileSize / 2;

            // Dessiner la tuile en fonction de son type
            switch (tileType) {
                case 0:
                    scene.add.image(tileX, tileY, 'background'); // Ajuster l'échelle si nécessaire
                    break;
                case 1:
                    scene.add.image(tileX, tileY, 'stoneblock'); // Ajuster l'échelle si nécessaire
                    break;
            }
        }
    }
}