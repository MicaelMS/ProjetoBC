var express = require('express');
var app = express();
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

// Configurar EJS como mecanismo de visualização
app.set('view engine', 'ejs');
app.set('views', './views');

// Define o caminho completo para o arquivo dados.json
const articlesFilePath = path.join(__dirname, '..', 'data', 'articles.json');
const usersFilePath = path.join(__dirname, '..', 'data', 'users.json');

// Leitura do arquivo JSON de dados
const articlesJSON = fs.readFileSync(articlesFilePath, 'utf8');
const articles = JSON.parse(articlesJSON);
const usersJSON = fs.readFileSync(usersFilePath, 'utf8');
const users = JSON.parse(usersJSON);

// Rota para renderizar o arquivo index.ejs
app.get('/', function (req, res) {
    res.render('index', {articles});
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