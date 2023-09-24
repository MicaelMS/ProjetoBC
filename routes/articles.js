const express = require('express');
const router = express.Router();
const app = express();
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const liked_counter = require('../middwares/liked_counter')
const usersRouter = require('./users');
const users = usersRouter.loadUsers();

// Configurar EJS como mecanismo de visualização
app.set('view engine', 'ejs');
app.set('views', './views');
let successMessage = '';
let errorMessage = '';


// Leitura do arquivo JSON de dados
const articlesFilePath = path.join(__dirname, '..', 'data', 'articles.json');
const articlesJSON = fs.readFileSync(articlesFilePath, 'utf8');
const articles = JSON.parse(articlesJSON);

const sendArticles = (req, res) => {
    // Classificar os artigos por kb_liked_count em ordem decrescente
    articles.sort((a, b) => parseInt(b.kb_liked_count) - parseInt(a.kb_liked_count));

    // Pegar os dois primeiros artigos após a classificação
    const topArticles = articles.slice(0, 10);

    res.render('index', { articles: topArticles });
}

const sendArticlesKey = (req, res) => {
    const keywordToFilter = req.query.keyword; // Obter a palavra-chave da consulta

    // Filtrar os artigos com base na palavra-chave
    const filteredArticles = articles.filter(article => article.kb_keywords.includes(keywordToFilter));

    // Classificar os artigos filtrados por kb_liked_count em ordem decrescente
    filteredArticles.sort((a, b) => parseInt(b.kb_liked_count) - parseInt(a.kb_liked_count));

    // Pegar os dez primeiros artigos após a classificação
    const topArticles = filteredArticles.slice(0, 10);

    // Renderizar a página de resultados com os artigos filtrados
    res.render('index', { articles: topArticles, keyword: keywordToFilter });
}

router.get('/visualizacao', (req, res) => {
    const permalink = req.query.permalink;

    const findArticle = articles.find(article => article.kb_permalink === permalink);

    if (findArticle) {
        res.render('article_view', findArticle);
    } else {
        res.send('Artigo não encontrado');
    }
});

router.post('/curtido', (req, res) => {
    console.log('entoru');
    req.body.articles = articles;
    req.body.articlesFilePath = articlesFilePath;
    liked_counter.curtir(req, res);
});

function updateArticleStatus(articleTitle, newStatus) {
    const articlesData = loadArticles();
    const index = articlesData.findIndex(article => article.kb_title === articleTitle);
    if (index !== -1) {
        articlesData[index].kb_featured = newStatus; // Atualize o status do artigo
        fs.writeFileSync(articlesFilePath, JSON.stringify(articlesData, null, 2), 'utf8');
        successMessage = 'Artigo atualizado com sucesso!'; // Defina a mensagem de sucesso
    } else {
        errorMessage = 'Artigo não encontrado.'; // Defina a mensagem de erro
    }
  }
  router.get('/admin', (req, res) => {
    // Passe as mensagens de sucesso e erro para a página admin e depois limpe-as
    res.render('admin', { users: users, articles: articles, successMessage, errorMessage });
    // Limpe as variáveis após renderizar a página
    successMessage = '';
    errorMessage = '';
  });
  function loadArticles() {
    try {
      const data = fs.readFileSync(articlesFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // Lida com erros de leitura do arquivo (por exemplo, arquivo inexistente)
      console.error('Erro ao carregar dados dos artigos:', error);
      return [];
    }
  }
module.exports = { loadArticles, sendArticles, sendArticlesKey, router};