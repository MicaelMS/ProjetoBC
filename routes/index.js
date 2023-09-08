var express = require('express');
var app = express();

// Configurar EJS como mecanismo de visualização
app.set('view engine', 'ejs');
app.set('views', './views');

// Rota para renderizar o arquivo index.ejs
app.get('/', function (req, res) {
    res.render('index');
});

app.use(express.static('public'));

app.listen(3000, function () {
    console.log('Executado');
    console.log("http://localhost:3000");
});