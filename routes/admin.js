const express = require('express');
const router = express.Router();
const app = express();
const fs = require('fs');
const path = require('path');
const usersRouter = require('./users')

const session = require('express-session');
app.use(session({
    secret: 'chave',
    resave: false,
    saveUninitialized: false,
}));

const usersFilePath = path.join(__dirname, '..', 'data', 'users.json');
const usersJSON = fs.readFileSync(usersFilePath, 'utf8');
const users = JSON.parse(usersJSON);
const articlesFilePath = path.join(__dirname, '..', 'data', 'articles.json');
const articlesJSON = fs.readFileSync(articlesFilePath, 'utf8');
const articles = JSON.parse(articlesJSON);
const { loadArticles } = require('./articles'); // Importe a função loadArticles do arquivo articles.js
const { loadUsers } = require('./users');
const { verificacao, checkAdminLevel } = require('../middwares/authenticator');

let usuarios = [];
let artigos = [];
let successMessage = '';
let errorMessage = '';

router.get('/admin', verificacao, (req, res) => {
  const articlesFilter = articles.filter(article => article.kb_published == 'on');
  const usersFilter = users.filter(user => user.author_status == 'on');

  console.log('rtsada');
  // Passe essas variáveis para a página admin e depois limpe-as
  res.render('admin', { users: usersFilter, articles: articlesFilter, successMessage, errorMessage });
  // Limpe as variáveis após renderizar a página
  successMessage = '';
  errorMessage = '';
});

function updateUserStatus(userId, newStatus) {
  const usersData = loadUsers();
  const user = usersData.find(user => user.author_id === userId);
  if (user) {
    user.author_status = newStatus; // Atualiza o status do usuário
    fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2), 'utf8');
    return true; // Indica que o usuário foi atualizado com sucesso
  }
  return false; // Indica que o usuário não foi encontrado
}


router.post('/excluir-usuario', (req, res) => {
  const userId = req.body.author_id;
  const newStatus = req.body.new_status; // Novo status a ser definido (por exemplo, 'off')

  // Use a função updateUserStatus do arquivo users.js para atualizar o status
  const userUpdated = updateUserStatus(userId, newStatus);

  if (userUpdated) {
    successMessage = 'Status do usuário alterado com sucesso!';
  } else {
    errorMessage = 'Usuário não encontrado.';
  }

  res.redirect('/admin');
});

// Rota para a página admin
router.get('/admin', verificacao, (req, res) => {
  // Passe a mensagem de sucesso para a página admin e depois limpe a variável
  const message = successMessage;
  successMessage = ''; // Limpe a mensagem

  const articlesFilter = articles.filter(article => article.kb_published == 'on');
  const usersFilter = users.filter(user => user.author_status == 'on');

  res.render('admin', { users: usersFilter, articles: articlesFilter, successMessage: message });
});

app.get('/cadastro_usuario', (req, res) => {
  res.render("users_create");
});

router.post('/cadastro-artigo', (req, res) => {
  const { titulo, conteudo } = req.body;

  artigos.push({ titulo, conteudo });
  res.redirect('/admin');
});

// Rota para processar a edição de artigo
router.post('/editar-artigo', (req, res) => {
  const { titulo, conteudo } = req.body;

  const artigoIndex = artigos.findIndex((a) => a.titulo === titulo);
  if (artigoIndex !== -1) {
    artigos[artigoIndex].conteudo = conteudo;
  }
  res.redirect('/admin');
});
// Rota para processar a exclusão de artigo
router.post('/excluir-artigo', (req, res) => {
  const articleId = req.body.articleId; // Obtém o ID do artigo

  // Use a função updateArticleStatus para atualizar o status do artigo
  const articleUpdated = updateArticleStatus(articleId, 'off');

  if (articleUpdated) {
    successMessage = 'Artigo alterado para "off" com sucesso!';
  } else {
    errorMessage = 'Artigo não encontrado.';
  }

  res.redirect('/admin');
});

// Função para atualizar o status do artigo
function updateArticleStatus(articleId, newStatus) {
  const articlesData = loadArticles();
  const article = articlesData.find(article => article.kb_id === articleId);
  const index = articlesData.findIndex(article => article.kb_id === articleId);

  if (article) {
    article.kb_published = newStatus; // Atualiza o status do artigo
    articlesData[index].kb_published = newStatus;
    fs.writeFileSync(articlesFilePath, JSON.stringify(articlesData, null, 2), 'utf8');
    return true; // Indica que o artigo foi atualizado com sucesso
  }
  return false; // Indica que o artigo não foi encontrado
}



app.use(usersRouter.router)

module.exports = router;