const fs = require('fs');
const bcrypt = require('bcrypt'); // Importe a biblioteca 'bcrypt' para lidar com senhas criptografadas

const authenticator = (req, res, username, password, users, usersFilePath) => {
// Verifique as credenciais em relação aos dados em users.json
    const user = users.find(u => u.author_user === username && u.author_status === 'on');
    if (user && bcrypt.compareSync(password, user.author_pwd)) {
        
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
        res.redirect('/admin');
    } else {
        res.render('login', { error: 'Credenciais inválidas' });
    }
}

const verificacao = (req, res, next) => {
    if (req.session.user) {
        // O usuário está autenticado, prossiga para a próxima rota
        next();
    } else {
        // O usuário não está autenticado, redirecione para a página de login
        res.redirect('/login');
    }
};

module.exports = {authenticator, verificacao};