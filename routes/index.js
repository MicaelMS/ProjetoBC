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

// Classificar os artigos por kb_liked_count em ordem decrescente
articles.sort((a, b) => parseInt(b.kb_liked_count) - parseInt(a.kb_liked_count));

// Pegar os dois primeiros artigos após a classificação
const topArticles = articles.slice(0, 10);

// Rota para renderizar o arquivo index.ejs com os artigos mais curtidos
app.get('/', function (req, res) {
    res.render('index', { articles: topArticles });
});

app.get('/filter', function (req, res) {
    const keywordToFilter = req.query.keyword; // Obter a palavra-chave da consulta

    // Filtrar os artigos com base na palavra-chave
    const filteredArticles = articles.filter(article => article.kb_keywords.includes(keywordToFilter));

    // Classificar os artigos filtrados por kb_liked_count em ordem decrescente
    filteredArticles.sort((a, b) => parseInt(b.kb_liked_count) - parseInt(a.kb_liked_count));

    // Pegar os dois primeiros artigos após a classificação
    const topArticles = filteredArticles.slice(0, 10);

    // Renderizar a página de resultados com os artigos filtrados
    res.render('index', { articles: topArticles, keyword: keywordToFilter });
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