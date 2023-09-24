const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const adminRouter = require('./admin');
const authenticator = require('../middwares/authenticator');

// Configurar EJS como mecanismo de visualização
app.set('view engine', 'ejs');
app.set('views', './views');

// Carregue o arquivo JSON de usuários
const usersFilePath = path.join(__dirname, '..', 'data', 'users.json');
const usersJSON = fs.readFileSync(usersFilePath, 'utf-8');
const users = JSON.parse(usersJSON);

app.use(bodyParser.urlencoded({ extended: true }));

// Rota para renderizar a página de login
router.get('/login', (req, res) => {
    res.render('login');
});

// Rota para lidar com o envio do formulário de login
router.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    authenticator.authenticator(req, res, username, password, users, usersFilePath);
});

app.use(adminRouter);

module.exports = router;