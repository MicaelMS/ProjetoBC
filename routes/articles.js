const express = require('express');
const router = express.Router();
const app = express();
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

// Configurar EJS como mecanismo de visualização
app.set('view engine', 'ejs');
app.set('views', './views');

// Leitura do arquivo JSON de dados
const articlesFilePath = path.join(__dirname, '..', 'data', 'articles.json');
const articlesJSON = fs.readFileSync(articlesFilePath, 'utf8');
const articles = JSON.parse(articlesJSON);

function sendArticles(req, res) {
    // Classificar os artigos por kb_liked_count em ordem decrescente
    articles.sort((a, b) => parseInt(b.kb_liked_count) - parseInt(a.kb_liked_count));

    // Pegar os dois primeiros artigos após a classificação
    const topArticles = articles.slice(0, 10);

    res.render('index', { articles: topArticles });
}

function sendArticlesKey(req, res) {
    const keywordToFilter = req.query.keyword; // Obter a palavra-chave da consulta

    // Filtrar os artigos com base na palavra-chave
    const filteredArticles = articles.filter(article => article.kb_keywords.includes(keywordToFilter));

    // Classificar os artigos filtrados por kb_liked_count em ordem decrescente
    filteredArticles.sort((a, b) => parseInt(b.kb_liked_count) - parseInt(a.kb_liked_count));

    // Pegar os dois primeiros artigos após a classificação
    const topArticles = filteredArticles.slice(0, 10);

    // Renderizar a página de resultados com os artigos filtrados
    res.render('index', { articles: topArticles, keyword: keywordToFilter });
}

module.exports = { router: sendArticles, sendArticlesKey };