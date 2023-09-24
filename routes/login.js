const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt'); // Importe a biblioteca 'bcrypt' para lidar com senhas criptografadas
const homeRouter = require('./index');
const adminRouter = require('./admin');

// Configurar EJS como mecanismo de visualização
app.set('view engine', 'ejs');
app.set('views', './views');

// Carregue o arquivo JSON de usuários
const usersFilePath = path.join(__dirname, '..', 'data', 'users.json');
const usersJSON = fs.readFileSync(usersFilePath, 'utf-8');
const users = JSON.parse(usersJSON);
console.log("aki0");

app.use(bodyParser.urlencoded({ extended: true }));

// Rota para renderizar a página de login
router.get('/login', (req, res) => {
    res.render('login');
});

// Rota para lidar com o envio do formulário de login
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    console.log("aki1");

    // Verifique as credenciais em relação aos dados em users.json
    const user = users.find(u => u.author_user === username);
    console.log("aki2");
    if (user && bcrypt.compareSync(password, user.author_pwd)) {
        user.author_status = "on";
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
        res.redirect('/admin');
    } else {
        res.render('login', { error: 'Credenciais inválidas' });
    }
});

app.use(homeRouter);
app.use(adminRouter);

module.exports = router;