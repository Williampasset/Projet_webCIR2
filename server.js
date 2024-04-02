const express = require('express');
const app = express();
const path = require('path');

// Servir les fichiers statiques depuis le dossier 'public'
app.use('/static', express.static(path.join(__dirname, 'public')));

// Route pour servir le fichier HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tetris.html'));
});

// Route pour servir le fichier JavaScript du jeu Tetris
app.get('/tetris.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tetris.js'));
});

// Servir les fichiers d'images depuis le dossier 'img'
app.use('/img', express.static(path.join(__dirname, 'public', 'img')));

// Route pour gérer les requêtes non trouvées
app.use((req, res) => {
    res.status(404).send('Not Found');
});

// Démarrer le serveur sur le port 3000
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
