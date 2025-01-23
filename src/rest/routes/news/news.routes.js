import express from 'express';
import data from '../../../data/hltv.json' assert { type: "json" };

const router = express.Router();

router.get('/', (req, res) => {
    const news = data.news.map(article => ({
        ...article,
        _links: {
            self: { href: `/api/news/${article.id}` },
            comments: { href: `/api/news/${article.id}/comments` },
            author: { href: `/api/news/authors/${article.author.id}` }
        }
    }));

    res.setHeader('X-Total-Count', news.length);
    res.setHeader('ETag', `W/"${Date.now()}"`);
    res.setHeader('Last-Modified', new Date().toUTCString());
    res.json({
        data: news,
        _links: {
            self: { href: '/api/news' }
        }
    });
});

router.get('/:id', (req, res) => {
    const article = data.news.find(n => n.id === parseInt(req.params.id));
    
    if (!article) {
        return res.status(404).json({
            error: 'Article not found',
            _links: {
                news: { href: '/api/news' }
            }
        });
    }

    res.json({
        ...article,
        _links: {
            self: { href: `/api/news/${article.id}` },
            comments: { href: `/api/news/${article.id}/comments` }
        }
    });
});

router.get('/:id/comments', (req, res) => {
    const article = data.news.find(n => n.id === parseInt(req.params.id));
    
    if (!article) {
        return res.status(404).json({
            error: 'Article not found',
            _links: {
                news: { href: '/api/news' }
            }
        });
    }

    res.json({
        data: article.comments,
        _links: {
            article: { href: `/api/news/${article.id}` },
            self: { href: `/api/news/${article.id}/comments` }
        }
    });
});

router.post('/', (req, res) => {
    const { title, content, author } = req.body;

    if (!title || !content || !author) {
        return res.status(400).json({
            error: 'Missing required fields',
            _links: {
                self: { href: '/api/news' }
            }
        });
    }

    const newArticle = {
        id: data.news.length + 1,
        title,
        content,
        author,
        date: new Date().toISOString()
    };

    res.status(201)
        .setHeader('Location', `/api/news/${newArticle.id}`)
        .json({
            ...newArticle,
            _links: {
                self: { href: `/api/news/${newArticle.id}` }
            }
        });
});

router.put('/:id', (req, res) => {
    const articleId = parseInt(req.params.id);
    const article = data.news.find(n => n.id === articleId);

    if (!article) {
        return res.status(404).json({
            error: 'Article not found',
            _links: {
                news: { href: '/api/news' }
            }
        });
    }

    res.json({
        ...article,
        ...req.body,
        _links: {
            self: { href: `/api/news/${articleId}` }
        }
    });
});

router.delete('/:id', (req, res) => {
    const articleId = parseInt(req.params.id);
    const article = data.news.find(n => n.id === articleId);

    if (!article) {
        return res.status(404).json({
            error: 'Article not found',
            _links: {
                news: { href: '/api/news' }
            }
        });
    }

    res.status(204).send();
});

export default router; 