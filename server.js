const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// EJS engine
app.set('view engine', 'ejs');

// Public folder
app.use(express.static('public'));

// Index ruta
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Galerija slika
app.get('/slike', (req, res) => {
    const folderPath = path.join(__dirname, 'public', 'images');
    const files = fs.readdirSync(folderPath);

    const images = files
        .filter(file => file.endsWith('.jpg') || file.endsWith('.png'))
        .map((file, index) => ({
            url: `/images/${file}`,
            id: `slika${index + 1}`,
            title: `Slika ${index + 1}`
        }));

    res.render('slike', { images });
});

// Pokretanje servera
app.listen(PORT, () => {
    console.log(`Server pokrenut na portu ${PORT}`);
});
