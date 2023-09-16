const express = require('express');
const router = express.Router();
const app = express();
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const { sendArticles, sendArticlesKey } = require('./articles'); // Importe as funções diretamente

// Configurar EJS como mecanismo de visualização
app.set('view engine', 'ejs');
app.set('views', './views');

router.use(express.json())

// Rota para renderizar o arquivo index.ejs com os artigos mais curtidos
app.get('/', function (req, res) {
    sendArticles(req, res);
});

app.get('/filter', function (req, res) {
    sendArticlesKey(req, res);
});

app.get('/login', (req, res) => {
    res.render("login");
  });

app.get('/adm', (req, res) => {
    res.render("adm");
});

app.get('/cadastra_usuario', (req, res) => {
    res.render("users_create");
  });
  
app.get('/cadastra_artigo', (req, res) => {
    res.render("articles_create");
});

app.use(express.static('public'));

app.listen(3000, function () {
    console.log('Executado');
    console.log("http://localhost:3000");
});