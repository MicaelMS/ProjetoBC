const express = require('express');
const router = express.Router();
const app = express();
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const liked_counter = require('../middwares/liked_counter')
const usersRouter = require('./users');
const users = usersRouter.loadUsers();
const uuid = require('uuid'); // Importe a biblioteca uuid

// Configurar EJS como mecanismo de visualização
app.set('view engine', 'ejs');
app.set('views', './views');
let successMessage = '';
let errorMessage = '';


// Leitura do arquivo JSON de dados
const articlesFilePath = path.join(__dirname, '..', 'data', 'articles.json');
const articlesJSON = fs.readFileSync(articlesFilePath, 'utf8');
const articles = JSON.parse(articlesJSON);
const multer = require('multer');
const formidable = require('formidable');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'public/imagens'); // Especifique o diretório onde as imagens devem ser salvas
  },
  filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const sendArticles = (req, res) => {
    // Classificar os artigos por kb_liked_count em ordem decrescente
    articles.sort((a, b) => parseInt(b.kb_liked_count) - parseInt(a.kb_liked_count));

    const filteredArticles = articles.filter(article => article.kb_published == 'on');
    // Pegar os dois primeiros artigos após a classificação
    const topArticles = filteredArticles.slice(0, 10);

    res.render('index', { articles: topArticles });
}

const sendArticlesKey = (req, res) => {
    const keywordToFilter = req.query.keyword; // Obter a palavra-chave da consulta
    articles.sort((a, b) => parseInt(b.kb_liked_count) - parseInt(a.kb_liked_count));

    // Filtrar os artigos com base na palavra-chave
    const filteredArticles = articles.filter(article => article.kb_keywords.includes(keywordToFilter) && article.kb_published == 'on');

    // Classificar os artigos filtrados por kb_liked_count em ordem decrescente
    filteredArticles.sort((a, b) => parseInt(b.kb_liked_count) - parseInt(a.kb_liked_count));

    // Pegar os dez primeiros artigos após a classificação
    const topArticles = filteredArticles.slice(0, 10);

    // Renderizar a página de resultados com os artigos filtrados
    res.render('index', { articles: topArticles, keyword: keywordToFilter });
}

router.get('/cadastra_artigo', (req, res) => {
  res.render("articles_create");
});

router.post('/edita_artigo', (req, res) => {
  const id = req.body.id;
  const findArticle = articles.find(article => article.kb_id === id);
  
  if (findArticle) {
    res.render("articles_edit", findArticle);
  } else {
    res.send('Artigo não encontrado');
  }
});

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

// function updateArticleStatus(articleTitle, newStatus) {
//     const articlesData = loadArticles();
//     const index = articlesData.findIndex(article => article.kb_title === articleTitle);
//     if (index !== -1) {
//         articlesData[index].kb_featured = newStatus; // Atualize o status do artigo
//         fs.writeFileSync(articlesFilePath, JSON.stringify(articlesData, null, 2), 'utf8');
//         successMessage = 'Artigo atualizado com sucesso!'; // Defina a mensagem de sucesso
//     } else {
//         errorMessage = 'Artigo não encontrado.'; // Defina a mensagem de erro
//     }
//   }
  router.get('/admin', (req, res) => {
    // Passe as mensagens de sucesso e erro para a página admin e depois limpe-as
    const articlesFilter = articles.filter(article => article.kb_published == 'on');
    const usersFilter = users.filter(user => user.author_status == 'on');

    res.render('admin', { users: usersFilter, articles: articlesFilter, successMessage, errorMessage });
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
  router.post('/criar-artigo', upload.single('kb_image'), (req, res) => {
    // Obtenha os dados do formulário, incluindo a imagem carregada
    const { kb_title, kb_body, kb_permalink, kb_keywords, kb_author_email } = req.body;
    const kb_image = req.file; // Informações sobre a imagem carregada

    // Crie um novo objeto de artigo com os dados do formulário, incluindo o caminho da imagem
    const newArticle = {
        kb_id: uuid.v4(), // Use uuid.v4() para gerar um ID único
        kb_title,
        kb_body,
        kb_permalink,
        kb_keywords,
        kb_liked_count: 0,
        kb_published: 'on',
        kb_suggestion: 'on',
        kb_featured: 'off',
        kb_author_email,
        kb_published_date: getCurrentDate(),
        imagem: kb_image ? `/imagens/${kb_image.filename}` : null, // Salve o caminho da imagem no objeto do artigo
    };

    const form = new formidable.IncomingForm();

    // Defina a pasta de destino para salvar a imagem
    const destino = path.join(__dirname, 'public', 'imagens');
  
    // Configurações do Formidable
    form.uploadDir = destino;
    form.keepExtensions = true;
  
    // Analise a solicitação com o Formidable
    form.parse(req, (err, campos, arquivos) => {
      if (err) {
        console.error('Erro ao analisar a solicitação:', err);
        return res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
      }
  
      // Verifique se um arquivo de imagem foi enviado
      if (!arquivos.imagem) {
        return res.status(400).json({ error: 'Nenhuma imagem enviada' });
      }
  
      // O arquivo está disponível em arquivos.imagem
      const imagem = arquivos.imagem;
  
      // Renomeie o arquivo para evitar conflitos de nome
      const novoNome = Date.now() + path.extname(imagem.name);
      fs.renameSync(imagem.path, path.join(destino, novoNome));
  
      console.log('Imagem salva com sucesso em:', novoNome);
  
      // Responda com sucesso
      res.json({ success: 'Imagem salva com sucesso', nomeDoArquivo: novoNome });
    });

    // Adicione o novo artigo ao array de artigos existente
    articles.push(newArticle);

    // Escreva o array de artigos atualizado de volta no arquivo JSON
    fs.writeFileSync(articlesFilePath, JSON.stringify(articles, null, 2), 'utf8');

    // Redirecione para a página de admin ou para onde desejar
    res.redirect('/admin');
  });
  function generateUniqueId() {
    // Por exemplo, você pode usar um pacote npm como 'uuid' para gerar UUIDs únicos
    const uniqueId = 'implemente_sua_logica_aqui';
    return uniqueId;
  }
  function getCurrentDate() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Adicione zero à esquerda, se necessário
    const day = String(currentDate.getDate()).padStart(2, '0'); // Adicione zero à esquerda, se necessário
    const formattedDate = `${year}-${month}-${day}`;
  
    return formattedDate;
  }
  router.post('/edita-artigo', (req, res) => {
    const id = req.body.kb_id; // Supondo que o ID do artigo seja enviado no corpo da solicitação POST

    // Encontre o artigo com o ID especificado
    const editedArticleIndex = articles.findIndex(article => article.kb_id === id);

    if (editedArticleIndex !== -1) {
        // Atualize as propriedades do artigo com os novos valores do formulário4

        articles[editedArticleIndex] = {
            ...articles[editedArticleIndex], 
            kb_title: req.body.kb_title, 
            kb_body: req.body.kb_body, 
            kb_permalink: req.body.permalink,
            kb_keywords: req.body.kb_keywords,
            kb_author_email: req.body.kb_author_email,
            kb_published_date: req.body.kb_published_date,
          }

        // Escreva o array de artigos atualizado de volta no arquivo JSON
        fs.writeFileSync(articlesFilePath, JSON.stringify(articles, null, 2), 'utf8');

        // Redirecione para a página de administração após a atualização bem-sucedida
        res.redirect('/admin');
    } else {
        res.send('Artigo não encontrado');
    }
});



module.exports = { getCurrentDate, generateUniqueId, loadArticles, sendArticles, sendArticlesKey, router};