const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

// Defina a configuração do EJS aqui (set 'view engine' e 'views')

const usersFilePath = path.join(__dirname, '..', 'data', 'users.json');
const usersJSON = fs.readFileSync(usersFilePath, 'utf-8');
const users = JSON.parse(usersJSON);

router.get('/cadastro_usuario', (req, res) => {
  res.render("users_create");
});

router.get('/edita_usuario', (req, res) => {
  res.render("users_edit");
});

// Rota para processar o cadastro de usuário
router.post('/cadastro-usuario', (req, res) => {
    const { nome, email } = req.body;
  
    usuarios.push({ nome, email });
    res.redirect('/admin');
  });
  
  // Rota para processar a edição de usuário
  router.post('/editar-usuario', (req, res) => {
    const { nome, email } = req.body;
  
    const usuarioIndex = usuarios.findIndex((u) => u.email === email);
    if (usuarioIndex !== -1) {
      usuarios[usuarioIndex].nome = nome;
    }
    res.redirect('/admin');
  });
  
const sendUsersName = (req, res) => {
    const UserIdFilter = req.query.keyword;

    // Filtra os usuários com base no campo author_name
    const filterUsers = users.filter(user => user.author_name.includes(UserIdFilter));

    res.render('index', { users: filterUsers });
}

router.post('/cadastrar-usuario', async function (req, res) {
    // Coleta os dados do formulário
    const newUser = {
        author_id: generateUniqueId(), // Gere um ID único para o novo usuário
        author_name: req.body.author_name,
        author_email: req.body.author_email,
        author_user: req.body.author_user,
        author_pwd: req.body.author_pwd,
        author_level: 'standard', // Define o nível como padrão
        author_status: 'on', // Define o status como ativo
    };

    // Use o bcrypt para criar um hash da senha
    const saltRounds = 10; // Número de rounds de salt (sal) para gerar o hash
    const hashedPassword = await bcrypt.hash(req.body.author_pwd, saltRounds);
    newUser.author_pwd = hashedPassword;

    // Adicione o novo usuário ao arquivo users.json
    users.push(newUser);

    // Atualize o arquivo users.json com os novos dados
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');

    // Redirecione para a página principal ou qualquer outra página desejada
    res.redirect('/admin');
});

const generateUniqueId = () => {
    return uuidv4(); // Gere um ID único usando a biblioteca uuid
}

module.exports = router;