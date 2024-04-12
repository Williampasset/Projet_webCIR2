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
let start = false;
let nextBlock = generateRandomBlock();
let scoreUser = 0;
const blockColors = {
    line: '#1fa5af',
    square: '#afbd0e',
    L: '#6b3bed',
    T: '#b76e0f',
    Z: '#b81111',
    S: '#07c747',
    J: '#2e05e8'
};
//0: fond, 1: bloc laser, 2: bloc Tetris en mouvement, 3: bloc Tetris fixé, 4: bloc laser

//Fonction affichage du menu
function showMenu(scene) {

    const menuContainer = document.getElementById('menuContainer');
    menuContainer.style.display = 'block';

    const startButton = document.getElementById('startButton');
    startButton.onclick = function() {
        start = true;
        backgroundMusic.play();
        menuContainer.style.display = 'none';
        lineSound = scene.sound.add('lineSound');
        gameOverSound = scene.sound.add('gameOverSound');
        createNewBlock(scene);
        drawNextPiece(scene);
    };
}

function drawNextPiece(scene) {
    const nextPieceCanvas = document.getElementById('nextPieceCanvas');
    const nextPieceCtx = nextPieceCanvas.getContext('2d');
    nextPieceCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height); // Efface le contenu précédent

    nextBlock = generateRandomBlock();

    const blockSize = nextPieceCanvas.width / 4; // Taille d'un bloc dans le canvas du prochain bloc

    nextPieceCtx.fillStyle = blockColors[nextBlock.type]; // Couleur du bloc
    for (let y = 0; y < nextBlock.pattern.length; y++) {
        for (let x = 0; x < nextBlock.pattern[y].length; x++) {
            if (nextBlock.pattern[y][x] === 1) {
                nextPieceCtx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
            }
        }
    }
}


// Fonctions du jeu
function preload() {
    // Chargement des ressources du jeu (images, etc.)
    this.load.image('line', 'img/line.png');
    this.load.image('square', 'img/square.png');
    this.load.image('L', 'img/L.png');
    this.load.image('T', 'img/T.png');
    this.load.image('Z', 'img/Z.png');
    this.load.image('S', 'img/S.png');
    this.load.image('J', 'img/J.png');
    this.load.image('laserblock', 'img/laserblock.jpg');
    this.load.image('background', 'img/background.png');
    this.load.image('secondlaser', 'img/laser2block.jpg')
    this.load.audio('lineSound', 'sound/line.mp3');
    this.load.audio('backgroundMusic', 'sound/background.mp3');
    this.load.audio('gameOverSound', 'sound/gameOver.mp3');
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
        [1, 4, 4, 4, 4, 4, 4, 4, 4, 1]
    ]


    // Charger le leaderboard
    fetchLeaderboard();

    // Dessiner la carte de fond
    drawMap(this, blockSize, 10, 18, mapData, activeBlock);

    // Gérer les entrées clavier
    cursors = this.input.keyboard.createCursorKeys();
    cursors.left.on('down', moveBlockLeft, this);
    cursors.right.on('down', moveBlockRight, this);
    this.input.keyboard.on('keydown-R', rotateBlock, this);

    // Charger les sons
    backgroundMusic = this.sound.add('backgroundMusic', { loop: true });

    // Afficher le menu
    showMenu(this);
    const restartButton = document.getElementById('restartButton');
    restartButton.onclick = function() {
        window.location.reload();
    };
}

function update() {
    // Mettre à jour le jeu
    if(cursors.down.isDown){
        fallBlocks(this);
    }
    // Vérifier si une ligne est pleine
    removeFullLines(mapData);

    // Vérifier si le jeu est terminé
    if (isGameOver(mapData) && start) {
        this.add.text(150, 210, 'Game Over', { fontSize: '40px', fill: '#fff' }).setOrigin(0.5);
        timer.remove(false);
        start = false;
        gameOverSound.play();

        // Lorsque le joueur perd la partie, affichez une boîte de dialogue pour saisir le pseudo
        const playerName = prompt("Enter your name:") || "Anonyme";

        fetch('/leaderboard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pseudo: playerName, score: scoreUser }),
        })
        .then(response => {
            if (!response.ok) {
            throw new Error('Failed to update leaderboard');
            }
        })
        .catch(error => {
            console.error('Erreur lors de la mise à jour du leaderboard :', error.message);
        });


    }
}

///////////////////////////////////////////
//Génération des blocs Tetris

//Fonction pour créer un nouveau bloc Tetris
function createNewBlock(scene) {
    activeBlock = nextBlock;
    placeBlockOnMap(activeBlock, mapData);

    // Redessiner la carte avec le bloc Tetris actif
    drawMap(scene, blockSize, 10, 18, mapData, activeBlock);

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
function drawMap(scene, tileSize, mapWidth, mapHeight, mapData, activeBlock) {
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
                    scene.add.image(tileX, tileY, 'laserblock').setOrigin(0.5);
                    break;
                case 2:
                    scene.add.image(tileX, tileY, `${activeBlock.type}`).setOrigin(0.5);
                    break;
                case 3:
                    scene.add.image(tileX, tileY, `${activeBlock.type}`).setOrigin(0.5);
                    break;
                case 4:
                    scene.add.image(tileX, tileY, 'secondlaser').setOrigin(0.5);
                    break;
            }
        }
    }
}

///////////////////////////////////////////
//Déplacement des blocs Tetris

// Fonction pour faire tomber un bloc manuellement
function fallBlocks(scene) {
    if (start && canBlockMove(activeBlock, mapData, 'down')) {
        clearBlockFromMap(activeBlock, mapData);
        activeBlock.y++;
        placeBlockOnMap(activeBlock, mapData,2);
        drawMap(scene, blockSize, 10, 18, mapData, activeBlock);
        calculateScore(10);
    }
}

// Fonction pour faire tomber un bloc automatiquement
function fallBlocksAutomatically(scene) {
    if (start && canBlockMove(activeBlock, mapData, 'down')) {
        clearBlockFromMap(activeBlock, mapData);
        activeBlock.y++;
        placeBlockOnMap(activeBlock, mapData, 2);
        drawMap(scene, blockSize, 10, 18, mapData, activeBlock);
        calculateScore(10);
    } 
    else {
        placeBlockOnMap(activeBlock, mapData, 3);
        timer.remove(false);
        drawMap(scene, blockSize, 10, 18, mapData, activeBlock);
        createNewBlock(scene);
        drawNextPiece(scene);
    }
}

// Fonction pour vérifier si un bloc peut se déplacer dans une direction donnée
function canBlockMove(block, mapData, direction) {
    if (!block) {
        return false;
    }
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

    return true;
}

// Fonction de déplacement du bloc vers la gauche
function moveBlockLeft() {
    if (start && canBlockMove(activeBlock, mapData, 'left')) {
        clearBlockFromMap(activeBlock, mapData);
        activeBlock.x--;
        placeBlockOnMap(activeBlock, mapData, 2);
        drawMap(this, blockSize, 10, 18, mapData, activeBlock);
    }
}

// Fonction de déplacement du bloc vers la droite
function moveBlockRight() {
    if (start && canBlockMove(activeBlock, mapData, 'right')) {
        clearBlockFromMap(activeBlock, mapData);
        activeBlock.x++;
        placeBlockOnMap(activeBlock, mapData, 2);
        drawMap(this, blockSize, 10, 18, mapData, activeBlock);
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
    if (start && canRotateBlock(activeBlock, mapData, rotatedPattern)) {
        clearBlockFromMap(activeBlock, mapData);
        activeBlock.pattern = rotatedPattern;
        placeBlockOnMap(activeBlock, mapData, 2);
        drawMap(this, blockSize, 10, 18, mapData, activeBlock);
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
                    console.log('Collision avec un bloc Tetris');
                    calculateScore(20);
                    return false;
                }
            }
        }
    }
    return true; // Rotation autorisée
}

// Fonction pour vérifier si une ligne est pleine
function isLineFull(line) {
    for (let i = 1; i < 9; i++) {
        if (line[i] !== 3) {
            return false;
        }
    }
    return true;
}

// Fonction pour supprimer une ligne pleine
function removeFullLines(mapData) {
    for (let y = 0; y < mapData.length; y++) {
        if (isLineFull(mapData[y])) {
            lineSound.play();
            calculateScore(100);
            // Supprimer la ligne pleine
            mapData.splice(y, 1);
            // Ajouter une nouvelle ligne vide au début de la carte
            tab = new Array(10).fill(0);
            tab[0] = 1;
            tab[9] = 1;
            mapData.unshift(tab);
        }
    }
}

// Fonction pour vérifier si le jeu est terminé
function isGameOver(mapData) {
    for (let x = 1; x < 9; x++) {
        if (mapData[0][x] === 3) {
            backgroundMusic.stop();
            const restartContainer = document.getElementById('restartButton');
            const startButton = document.getElementById('startButton');
            const menuContainer = document.getElementById('menuContainer');
            restartContainer.style.display = 'block';
            startButton.style.display = 'none';
            menuContainer.style.display = 'block';
            return true;
        }
    }
    return false;
}

// Fonction calcul du score
function calculateScore(addToScore){
    scoreUser += addToScore;
    const userScoreElement = document.getElementById('userScore');
    if (userScoreElement) {
        userScoreElement.innerHTML = scoreUser;
    } else {
        console.error("L'élément userScore n'existe pas dans le DOM.");
    }

}

// Fonction pour récupérer les scores des joueurs depuis le serveur
function fetchLeaderboard() {
    fetch('/leaderboard')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch leaderboard');
            }
            return response.json();
        })
        .then(data => {
            // Traitez les données du leaderboard ici
            updateLeaderboard(data); // Supposons que vous avez une fonction pour mettre à jour l'affichage du leaderboard
        })
        .catch(error => {
            console.error('Erreur lors de la récupération du leaderboard :', error.message);
        });
}


// Fonction pour mettre à jour l'affichage du leaderboard
function updateLeaderboard(leaderboardData) {
    const leaderboardContainer = document.getElementById('leaderboardList');
    leaderboardContainer.innerHTML = ''; // Efface le contenu précédent du conteneur de leaderboard

    // Triez les données du leaderboard par score (du plus élevé au plus bas)
    leaderboardData.sort((a, b) => b.score - a.score);

    // Limitez le nombre de joueurs à afficher à 10
    const playersToShow = leaderboardData.slice(0, 10);

    // Parcourez les données des joueurs à afficher et ajoutez-les au conteneur de leaderboard
    playersToShow.forEach(player => {
        const playerEntry = document.createElement('div');
        playerEntry.textContent = `${player.pseudo}: ${player.score}`;
        leaderboardContainer.appendChild(playerEntry);
    });
}
