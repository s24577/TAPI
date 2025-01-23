import express from 'express';
import data from '../../../data/hltv.json' assert { type: "json" };

const router = express.Router();

router.get('/', (req, res) => {
    const rankings = data.rankings.current;

    res.setHeader('X-Total-Count', rankings.length);
    res.setHeader('Last-Modified', data.rankings.lastUpdate);
    res.setHeader('ETag', `W/"${Date.now()}"`);

    res.json({
        data: rankings,
        lastUpdate: data.rankings.lastUpdate,
        _links: {
            self: { href: '/api/rankings' },
            teams: { href: '/api/teams' }
        }
    });
});

router.get('/:id', (req, res) => {
    const ranking = data.rankings.current.find(
        r => r.position === parseInt(req.params.id)
    );

    if (!ranking) {
        return res.status(404).json({
            error: 'Ranking not found',
            _links: {
                rankings: { href: '/api/rankings' }
            }
        });
    }

    res.json({
        ...ranking,
        _links: {
            self: { href: `/api/rankings/${ranking.position}` },
            team: { href: `/api/teams/${ranking.team}` }
        }
    });
});

router.post('/', (req, res) => {
    const { team, points } = req.body;

    if (!team || !points) {
        return res.status(400).json({
            error: 'Missing required fields',
            _links: {
                self: { href: '/api/rankings' }
            }
        });
    }

    const newRanking = {
        position: data.rankings.current.length + 1,
        team,
        points,
        change: 0
    };

    res.status(201)
        .setHeader('Location', `/api/rankings/${newRanking.position}`)
        .json({
            ...newRanking,
            _links: {
                self: { href: `/api/rankings/${newRanking.position}` }
            }
        });
});

router.put('/:id', (req, res) => {
    const rankingId = parseInt(req.params.id);
    const ranking = data.rankings.current.find(r => r.position === rankingId);

    if (!ranking) {
        return res.status(404).json({
            error: 'Ranking not found',
            _links: {
                rankings: { href: '/api/rankings' }
            }
        });
    }

    const { team, points } = req.body;
    if (!team || !points) {
        return res.status(400).json({
            error: 'Missing required fields',
            _links: {
                self: { href: `/api/rankings/${rankingId}` }
            }
        });
    }

    const updatedRanking = {
        ...ranking,
        team,
        points,
        lastUpdate: new Date().toISOString()
    };

    res.json({
        ...updatedRanking,
        _links: {
            self: { href: `/api/rankings/${rankingId}` }
        }
    });
});

router.delete('/:id', (req, res) => {
    const rankingId = parseInt(req.params.id);
    const ranking = data.rankings.current.find(r => r.position === rankingId);

    if (!ranking) {
        return res.status(404).json({
            error: 'Ranking not found',
            _links: {
                rankings: { href: '/api/rankings' }
            }
        });
    }

    res.status(204).send();
});

export default router; 