import express from 'express';
import data from '../../../data/hltv.json' assert { type: "json" };

const router = express.Router();

router.get('/', (req, res) => {
    const stats = data.statistics;
    
    res.setHeader('X-Total-Count', stats.players.topRated.length);
    res.setHeader('ETag', `W/"${Date.now()}"`);
    res.setHeader('Cache-Control', 'max-age=3600');
    
    res.json({
        data: stats,
        _links: {
            self: { href: '/api/statistics' },
            players: { href: '/api/statistics/players' },
            teams: { href: '/api/statistics/teams' }
        }
    });
});

router.get('/players', (req, res) => {
    const players = data.statistics.players.topRated;

    res.setHeader('X-Total-Count', players.length);
    res.json({
        data: players,
        _links: {
            self: { href: '/api/statistics/players' },
            teams: { href: '/api/statistics/teams' }
        }
    });
});

router.get('/players/:id/details', (req, res) => {
    const player = data.statistics.players.topRated.find(
        p => p.player.id === parseInt(req.params.id)
    );

    if (!player) {
        return res.status(404).json({
            error: 'Player statistics not found',
            _links: {
                players: { href: '/api/statistics/players' }
            }
        });
    }

    res.json({
        ...player,
        _links: {
            self: { href: `/api/statistics/players/${player.player.id}` },
            team: { href: `/api/teams/${player.player.team.name}` },
            matches: { href: `/api/statistics/players/${player.player.id}/matches` }
        }
    });
});

router.post('/players', (req, res) => {
    const { playerId, stats } = req.body;

    if (!playerId || !stats) {
        return res.status(400).json({
            error: 'Missing required fields',
            _links: {
                self: { href: '/api/statistics/players' }
            }
        });
    }

    res.status(201)
        .setHeader('Location', `/api/statistics/players/${playerId}`)
        .json({
            playerId,
            stats,
            _links: {
                self: { href: `/api/statistics/players/${playerId}` }
            }
        });
});

router.put('/players/:id', (req, res) => {
    const playerId = parseInt(req.params.id);
    const player = data.statistics.players.topRated.find(
        p => p.player.id === playerId
    );

    if (!player) {
        return res.status(404).json({
            error: 'Player statistics not found',
            _links: {
                players: { href: '/api/statistics/players' }
            }
        });
    }

    res.json({
        ...player,
        ...req.body,
        _links: {
            self: { href: `/api/statistics/players/${playerId}` }
        }
    });
});

router.delete('/players/:id', (req, res) => {
    const playerId = parseInt(req.params.id);
    const player = data.statistics.players.topRated.find(
        p => p.player.id === playerId
    );

    if (!player) {
        return res.status(404).json({
            error: 'Player statistics not found',
            _links: {
                players: { href: '/api/statistics/players' }
            }
        });
    }

    res.status(204).send();
});

router.get('/players/:id/matches', (req, res) => {
    const playerId = parseInt(req.params.id);
    const player = data.statistics.players.topRated.find(
        p => p.player.id === playerId
    );

    if (!player) {
        return res.status(404).json({
            error: 'Player not found',
            _links: {
                players: { href: '/api/statistics/players' }
            }
        });
    }

    res.json({
        data: {
            matches: player.stats.maps,
            kdRatio: player.stats.kdRatio,
            impact: player.stats.impact
        },
        _links: {
            player: { href: `/api/statistics/players/${playerId}` },
            self: { href: `/api/statistics/players/${playerId}/matches` }
        }
    });
});

export default router; 