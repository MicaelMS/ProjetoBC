const express = require('express');
const router = express.Router();
const app = express();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

// Configurar EJS como mecanismo de visualização
app.set('view engine', 'ejs');
app.set('views', './views');

router.use(express.json())

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const usersFilePath = path.join(__dirname, '..', 'data', 'users.json');
const usersJSON = fs.readFileSync(usersFilePath, 'utf-8');
const users = JSON.parse(usersJSON);

router.get('/cadastro_usuario', (req, res) => {
  res.render("users_create");
});

router.post('/edita_usuario', (req, res) => {
  const id = req.body.id;

  const findUser = users.find(user => user.author_id === id);

  if (findUser) {
      res.render('users_edit', findUser);
  } else {
      res.send('Usuário não encontrado');
  }
});

// Rota para processar o cadastro de usuário
router.post('/cadastro-usuario', (req, res) => {
    const { nome, email } = req.body;
  
    users.push({ nome, email });
    res.redirect('/admin');
  });

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

// Função para editar um usuário
async function editUser(updatedUser) {
  const usersData = loadUsers();
  const index = usersData.findIndex(user => user.author_id === updatedUser.author_id);
  if (index !== -1) {
    const saltRounds = 10; // Número de rounds de salt (sal) para gerar o hash
    const hashedPassword = await bcrypt.hash(updatedUser.author_pwd, saltRounds);
    updatedUser.author_pwd = hashedPassword;
    usersData[index] = updatedUser;
    
    fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2), 'utf8', (err) => {
      if (err) {
        console.error('Erro :', err);
        res.redirect('admin');
        res.status(500).send('Erro:');
      } else {
        res.redirect('admin');
        res.sendStatus(200);
      }
    });
  }
}

// Altere a função deleteUser para atualizar o status do usuário em vez de excluí-lo
function deleteUser(userId) {
  const usersData = loadUsers();
  const index = usersData.findIndex(user => user.author_id === userId);
  if (index !== -1) {
      usersData[index].author_status = 'off'; // Atualize o status do usuário para "off"
      fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2), 'utf8');
  }
}

function loadUsers() {
  try {
      const data = fs.readFileSync(usersFilePath, 'utf8');
      return JSON.parse(data);
  } catch (error) {
      // Lida com erros de leitura do arquivo (por exemplo, arquivo inexistente)
      console.error('Erro ao carregar dados dos usuários:', error);
      return [];
  }
}
router.post('/editar-usuario', (req, res) => {
  const { author_id, author_name, author_email, author_user, author_pwd, author_level, author_status } = req.body;

  const usuarioEditado = {
    author_id, 
    author_name, 
    author_email, 
    author_user, 
    author_pwd,
    author_level,
    author_status
  };

  editUser(usuarioEditado);

  res.send('<script>alert("Usuário editado com sucesso!"); window.location.href = "/admin";</script>');
});

// Rota para processar a exclusão de usuário
router.post('/excluir-usuario', (req, res) => {
  const userId = req.body.author_id;

  deleteUser(userId);

  res.redirect('/admin');
});

const generateUniqueId = () => {
    return uuidv4(); // Gere um ID único usando a biblioteca uuid
}

module.exports = {editUser, deleteUser, loadUsers, router};