const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

// Middleware pour permettre de parser le corps des requêtes HTTP
app.use(express.json());

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

// Route pour servir le fichier CSS du jeu Tetris
app.get('/tetris.css', (req, res) =>
    res.sendFile(path.join(__dirname, 'public', 'tetris.css'))
);

// Servir les fichiers d'images depuis le dossier 'img'
app.use('/img', express.static(path.join(__dirname, 'public', 'img')));

// Servir les fichiers de son depuis le dossier 'sound'
app.use('/sound', express.static(path.join(__dirname, 'public', 'sound')));

// Route pour récupérer les scores des joueurs depuis le fichier JSON
app.get('/leaderboard', (req, res) => {
    fs.readFile('leaderboard.json', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Erreur lors de la lecture du fichier JSON');
            return;
        }
        const scores = JSON.parse(data);
        res.json(scores);
    });
});

// Route pour ajouter un nouveau score de joueur au fichier JSON
app.post('/leaderboard', (req, res) => {
    const newScore = req.body;
    fs.readFile('leaderboard.json', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Erreur lors de la lecture du fichier JSON');
            return;
        }
        const scores = JSON.parse(data);
        scores.push(newScore);
        fs.writeFile('leaderboard.json', JSON.stringify(scores), (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Erreur lors de l\'écriture du fichier JSON');
                return;
            }
            res.status(201).send('Score ajouté avec succès');
        });
    });
});

// Route pour gérer les requêtes non trouvées
app.use((req, res) => {
    res.status(404).send('Not Found');
});

// Démarrer le serveur sur le port 3000
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
