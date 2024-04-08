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
let blockSize = 30;
let cursors;
let mapData;
let activeBlock;
let timer;
let FALL_DELAY = 1000; // Délai entre les chutes automatiques des blocs (en millisecondes)
//0: vide, 1: bloc de pierre, 2: bloc Tetris

// Fonctions du jeu
function preload() {
    // Chargement des ressources du jeu (images, etc.)
    this.load.image('stoneblock', 'img/stone_block.jpg');
    this.load.image('background', 'img/background.png');
    this.load.image('violetblock', 'img/block_violet.png');
}

function create() {
    // Initialisation du jeu
    mapData = [
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
    ]
    // Dessiner la carte de fond
    drawMap(this, blockSize, 10, 18, mapData);

    // Gérer les entrées clavier
    cursors = this.input.keyboard.createCursorKeys();
    //cursors.down.on('down', fallBlocks, this);
    cursors.left.on('down', moveBlockLeft, this);
    cursors.right.on('down', moveBlockRight, this);
    this.input.keyboard.on('keydown-R', rotateBlock, this);

    // Démarrer le jeu en créant un premier bloc Tetris
    createNewBlock(this);
}

function update() {
    // Mettre à jour le jeu
    if(cursors.down.isDown){
        fallBlocks(this);
    }
}

///////////////////////////////////////////
//Génération des blocs Tetris

//Fonction pour créer un nouveau bloc Tetris
function createNewBlock(scene) {
    activeBlock = generateRandomBlock();
    placeBlockOnMap(activeBlock, mapData);

    // Redessiner la carte avec le bloc Tetris actif
    drawMap(scene, blockSize, 10, 18, mapData);

    // Démarrer le timer pour la chute automatique des blocs
    timer = scene.time.addEvent({
        delay: FALL_DELAY,
        callback: () => fallBlocksAutomatically(scene),
        loop: true
    });
}

// Fonction pour générer un bloc Tetris aléatoire
function generateRandomBlock() {
    const blockTypes = ['line', 'square', 'L', 'T', 'Z', 'S', 'J'];
    const randomBlockType = blockTypes[Math.floor(Math.random() * blockTypes.length)];
    const blockPatterns = {
        line: [[1, 1, 1, 1]],
        square: [[1, 1], [1, 1]],
        L: [[1, 0], [1, 0], [1, 1]],
        T: [[1, 1, 1], [0, 1, 0]],
        Z: [[1, 1, 0], [0, 1, 1]],
        S: [[0, 1, 1], [1, 1, 0]],
        J: [[0, 1], [0, 1], [1, 1]]
    };
    const blockRotationPoints = {
        line: { x: 1, y: 0},
        L: { x: 1, y: 1 },
        T: { x: 1, y: 0 },
        Z: { x: 1, y: 0 },
        S: { x: 1, y: 1 },
        J: { x: 1, y: 1 },
    };
    return {
        type: randomBlockType,
        pattern: blockPatterns[randomBlockType],
        x: Math.floor(10 / 2) - Math.floor(blockPatterns[randomBlockType][0].length / 2), // Centrer le bloc
        y: 0
    };
}

//Fonction pour placer un bloc sur la carte
function placeBlockOnMap(block, mapData, type) {
    for (let y = 0; y < block.pattern.length; y++) {
        for (let x = 0; x < block.pattern[y].length; x++) {
            if (block.pattern[y][x] === 1) {
                mapData[block.y + y][block.x + x] = type;
            }
        }
    }
}

//Fonction pour effacer un bloc de la carte
function clearBlockFromMap(block, mapData) {
    for (let y = 0; y < block.pattern.length; y++) {
        for (let x = 0; x < block.pattern[y].length; x++) {
            if (block.pattern[y][x] === 1) {
                mapData[block.y + y][block.x + x] = 0;
            }
        }
    }
}

// Fonction pour dessiner la carte de jeu
function drawMap(scene, tileSize, mapWidth, mapHeight, mapData) {
    // Dessiner chaque tuile de la carte
    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            const tileType = mapData[y][x];
            const tileX = x * tileSize + tileSize / 2;
            const tileY = y * tileSize + tileSize / 2;

            // Dessiner la tuile en fonction de son type
            switch (tileType) {
                case 0:
                    scene.add.image(tileX, tileY, 'background').setOrigin(0.5);
                    break;
                case 1:
                    scene.add.image(tileX, tileY, 'stoneblock').setOrigin(0.5);
                    break;
                case 2:
                    scene.add.image(tileX, tileY, 'violetblock').setOrigin(0.5);
                    break;
                case 3:
                    scene.add.image(tileX, tileY, 'violetblock').setOrigin(0.5);
                    break;
            }
        }
    }
}

///////////////////////////////////////////
//Déplacement des blocs Tetris

// Fonction pour faire tomber un bloc manuellement
function fallBlocks(scene) {
    if (canBlockMove(activeBlock, mapData, 'down')) {
        clearBlockFromMap(activeBlock, mapData);
        activeBlock.y++;
        placeBlockOnMap(activeBlock, mapData,2);
        drawMap(scene, blockSize, 10, 18, mapData);
    }
}

// Fonction pour faire tomber un bloc automatiquement
function fallBlocksAutomatically(scene) {
    if (canBlockMove(activeBlock, mapData, 'down')) {
        console.log(activeBlock);
        console.log('Block can move down');
        clearBlockFromMap(activeBlock, mapData);
        activeBlock.y++;
        placeBlockOnMap(activeBlock, mapData, 2);
        drawMap(scene, blockSize, 10, 18, mapData);
    } else {
        placeBlockOnMap(activeBlock, mapData, 3);
        timer.remove(false);
        drawMap(scene, blockSize, 10, 18, mapData);
        createNewBlock(scene);
    }
}

// Fonction pour vérifier si un bloc peut se déplacer dans une direction donnée
function canBlockMove(block, mapData, direction) {
    let newX = block.x;
    let newY = block.y;

    switch (direction) {
        case 'left':
            newX--;
            break;
        case 'right':
            newX++;
            break;
        case 'down':
            newY++;
            break;
    }

    // Vérifier si le nouveau placement est valide
    for (let y = 0; y < block.pattern.length; y++) {
        for (let x = 0; x < block.pattern[y].length; x++) {
            if (block.pattern[y][x] === 1) {
                // Vérifier les collisions avec les blocs existants (sauf le bloc lui-même)
                if (newX + x < 1 || newX + x >= (mapData[0].length-1) || newY + y >= (mapData.length-1)) {
                    console.log('Sortie de la carte');
                    return false;
                }
                if (mapData[newY + y][newX + x] === 3) {
                    console.log('Collision avec un bloc Tetris');
                    return false;
                }
                        
            }
        }
    }

    return true; // Déplacement autorisé
}

// Fonction de déplacement du bloc vers la gauche
function moveBlockLeft() {
    if (canBlockMove(activeBlock, mapData, 'left')) {
        clearBlockFromMap(activeBlock, mapData);
        activeBlock.x--;
        placeBlockOnMap(activeBlock, mapData, 2);
        drawMap(this, blockSize, 10, 18, mapData);
    }
}

// Fonction de déplacement du bloc vers la droite
function moveBlockRight() {
    if (canBlockMove(activeBlock, mapData, 'right')) {
        clearBlockFromMap(activeBlock, mapData);
        activeBlock.x++;
        placeBlockOnMap(activeBlock, mapData, 2);
        drawMap(this, blockSize, 10, 18, mapData);
    }
}

// Fonction de rotation du bloc
function rotateBlock() {
    const rotatedPattern = [];
    // Transposer la matrice du bloc
    for (let x = 0; x < activeBlock.pattern[0].length; x++) {
        const newRow = activeBlock.pattern.map((row) => row[x]).reverse();
        rotatedPattern.push(newRow);
    }

    // Vérifier si la rotation est autorisée
    if (canRotateBlock(activeBlock, mapData, rotatedPattern)) {
        clearBlockFromMap(activeBlock, mapData);
        activeBlock.pattern = rotatedPattern;
        placeBlockOnMap(activeBlock, mapData, 2);
        drawMap(this, blockSize, 10, 18, mapData);
    }
}

// Fonction pour vérifier si un bloc peut être tourné
function canRotateBlock(block, mapData, rotatedPattern) {
    // Vérifier les collisions après la rotation
    for (let y = 0; y < rotatedPattern.length; y++) {
        for (let x = 0; x < rotatedPattern[y].length; x++) {
            if (rotatedPattern[y][x] === 1) {
                const newX = block.x + x;
                const newY = block.y + y;
                
                // Vérifier si le nouveau placement est valide
                if (newX < 1 || newX >= mapData[0].length - 1 || newY >= mapData.length - 1) {
                    console.log('Sortie de la carte');
                    return false;
                }
                if (mapData[newY][newX] === 3 || mapData[newY][newX] === 1) {
                    console.log('Collision avec un bloc Tetris ou une pierre');
                    return false;
                }
            }
        }
    }
    return true; // Rotation autorisée
}
