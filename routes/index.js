const express = require('express');
const session = require('express-session');
const router = express.Router();
const app = express();
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const artcilesModule= require('./articles');
const usersRouter = require('./users');
const adminRouter = require('./admin');
const loginRouter = require('./login');
const authenticator = require('../middwares/authenticator');

// Configurar EJS como mecanismo de visualização
app.set('view engine', 'ejs');
app.set('views', './views');

router.use(express.json())

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'chave',
    resave: false,
    saveUninitialized: false,
  }));

// Rota para renderizar o arquivo index.ejs com os artigos mais curtidos
app.get('/', function (req, res) {
    artcilesModule.sendArticles(req, res);
});

app.get('/filter', function (req, res) {
    artcilesModule.sendArticlesKey(req, res);
});

// app.get('/cadastra_artigo', authenticator.verificacao, (req, res) => {
//     res.render("articles_create");
// });

// app.get('/edita_artigo', authenticator.verificacao, (req, res) => {
//     res.render("articles_edit");
// });

// app.get('/cadastro_usuario', authenticator.verificacao, (req, res) => {
//     res.render("users_create");
// });

// app.get('/edita_usuario', authenticator.verificacao, (req, res) => {
//     res.render("users_edit");
// });

app.get('/', function (req, res) {
    const user = req.session.user;
    res.render('index', { user });
});

// Rota para renderizar a página de login
app.get('/login', (req, res) => {
    res.render("login");
});

app.post('/')

app.use(express.static('public'));

app.use(usersRouter.router);
app.use(artcilesModule.router);

app.use(adminRouter);
app.use(loginRouter);

app.listen(3000, function () {
    console.log('Executado');
    console.log("http://localhost:3000");
});
module.exports = router;