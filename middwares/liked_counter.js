const fs = require('fs');

const curtir = (req, res) => {
    const {permalink, articles, articlesFilePath} = req.body;

    const findArticle = articles.find(article => article.kb_permalink === permalink);

    if (findArticle) {
        findArticle.kb_liked_count++;

        // Atualize o arquivo JSON com o artigo modificado
        const updatedArticlesJSON = JSON.stringify(articles, null, 2);

        //para reescrever o artigo, adicionando assim o liked ++
        fs.writeFile(articlesFilePath, updatedArticlesJSON, 'utf8', (err) => {
            if (err) {
                console.error('Erro ao curtir o artigo:', err);
                res.render('article_view', findArticle);
                res.status(500).send('Erro ao curtir o artigo:');
            } else {
                res.render('article_view', findArticle);
                res.sendStatus(200);
            }
        });
    } else {
        res.redirect('article_view');
        res.status(404).send('Artigo não encontrado');
    }
}

module.exports = {curtir}