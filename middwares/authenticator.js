const express = require('express');
const fs = require('fs');
const app = express();
const bcrypt = require('bcrypt'); // Importe a biblioteca 'bcrypt' para lidar com senhas criptografadas
const {loadUsers} = require('../routes/users')
const session = require('express-session');
app.use(session({
    secret: 'chave',
    resave: false,
    saveUninitialized: false,
}));

// const authenticator = (req, res, next, username, password, users, usersFilePath) => {
//     // Verifique as credenciais em relação aos dados em users.json
//     const user = users.find(u => u.author_user === username && u.author_status === 'on');
//     if (user && bcrypt.compareSync(password, user.author_pwd)) {
//         req.session.user = {
//             username: user.author_user,
//           };
//           usuario = user.author_user;
//         fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
//         res.redirect('/admin');
//     } else {
//         res.render('login', { error: 'Credenciais inválidas' });
//     }
// }

const authenticator = (req, res, next) => {

    const username = req.body.username;
    const password = req.body.password;
    const users = loadUsers();

    const user = users.find(u => u.author_user === username && u.author_status === 'on');
    if (user && bcrypt.compareSync(password, user.author_pwd)) {
        req.session.user = {
            username: user.author_user,
            access_level: user.author_level,
        };
        next();
        // res.redirect('/admin');
    } else {
        console.log("AQUI MISAEL para  login");
        res.render('login', { error: 'Credenciais inválidas' });
    }
}
const verificacao = (req, res, next) => {
    console.log(req.session);
    if (req.session.user) {
        // O usuário está autenticado, prossiga para a próxima rota
        next();
    } else {
        // O usuário não está autenticado, redirecione para a página de login
        res.redirect('/login');
    }
};

const logout = (req, res, next) => {
    console.log('deslogou');
    // Destrua a sessão do usuário (logout)
    req.session.destroy(err => {
        if (err) {
            console.error('Erro ao encerrar a sessão:', err);
        }
        next();
    });
};

function checkAdminLevel(req, res, next) {
    if (req.session.user && req.session.user.author_level === 'admin') {
      // O usuário é um administrador, continue para a próxima rota
    next();
    return res.redirect('/admin');  
    }
    // O usuário não é um administrador, redirecione ou retorne um erro
    res.status(403).send('Acesso negado');
  }

module.exports = { authenticator, verificacao, logout, checkAdminLevel };