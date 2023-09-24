const express = require('express');
const router = express.Router();
const app = express();
const fs = require('fs');
const path = require('path');
const usersRouter = require('./users')

const usersFilePath = path.join(__dirname, '..', 'data', 'users.json');
const usersJSON = fs.readFileSync(usersFilePath, 'utf8');
const users = JSON.parse(usersJSON);
const articlesFilePath = path.join(__dirname, '..', 'data', 'articles.json');
const articlesJSON = fs.readFileSync(articlesFilePath, 'utf8');
const articles = JSON.parse(articlesJSON);

let usuarios = [];
let artigos = [];

router.post('/excluir-usuario', (req, res) => {
  const { email } = req.body;

  usuarios = usuarios.filter((u) => u.email !== email);
  res.redirect('/admin');
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
  const { titulo } = req.body;

  artigos = artigos.filter((a) => a.titulo !== titulo);
  res.redirect('/admin');
});

router.get('/admin', (req, res) => {
    res.render('admin', {users: users, articles: articles });
});

app.use(usersRouter.router)

module.exports = router;