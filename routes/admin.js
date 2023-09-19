const express = require('express');
const router = express.Router();
const fs = require('fs');
const homeRouter = require('./index');

// Rota para renderizar a página de admin
router.get('/admin', (req, res) => {
    res.render('admin');
});

module.exports = router;