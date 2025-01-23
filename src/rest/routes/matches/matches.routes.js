import express from 'express';
import data from '../../../data/hltv.json' assert { type: "json" };

const router = express.Router();

router.get('/', (req, res) => {
    const matches = data.matches.map(match => ({
        ...match,
        _links: {
            self: { href: `/api/matches/${match.id}` },
            team1: { href: `/api/teams/${match.team1}` },
            team2: { href: `/api/teams/${match.team2}` },
            event: { href: `/api/events/${match.event}` }
        }
    }));

    res.setHeader('X-Total-Count', matches.length);
    res.setHeader('ETag', `W/"${Date.now()}"`);
    res.setHeader('Cache-Control', 'max-age=300');
    res.json({
        data: matches,
        _links: {
            self: { href: '/api/matches' },
            events: { href: '/api/events' }
        }
    });
});

router.get('/:id', (req, res) => {
    const match = data.matches.find(m => m.id === parseInt(req.params.id));
    
    if (!match) {
        return res.status(404).json({
            error: 'Match not found',
            _links: {
                matches: { href: '/api/matches' }
            }
        });
    }

    res.json({
        ...match,
        _links: {
            self: { href: `/api/matches/${match.id}` },
            team1: { href: `/api/teams/${match.team1}` },
            team2: { href: `/api/teams/${match.team2}` }
        }
    });
});

router.get('/:id/maps', (req, res) => {
    const match = data.matches.find(m => m.id === parseInt(req.params.id));
    
    if (!match) {
        return res.status(404).json({
            error: 'Match not found',
            _links: {
                matches: { href: '/api/matches' }
            }
        });
    }

    res.json({
        maps: match.maps || [],
        _links: {
            match: { href: `/api/matches/${match.id}` }
        }
    });
});

router.post('/', (req, res) => {
    const { team1, team2, event, date } = req.body;

    if (!team1 || !team2 || !event || !date) {
        return res.status(400).json({
            error: 'Missing required fields',
            _links: {
                self: { href: '/api/matches' }
            }
        });
    }

    const newMatch = {
        id: data.matches.length + 1,
        team1,
        team2,
        event,
        date,
        status: 'upcoming'
    };

    res.status(201)
        .setHeader('Location', `/api/matches/${newMatch.id}`)
        .json({
            ...newMatch,
            _links: {
                self: { href: `/api/matches/${newMatch.id}` }
            }
        });
});

router.put('/:id', (req, res) => {
    const matchId = parseInt(req.params.id);
    const match = data.matches.find(m => m.id === matchId);

    if (!match) {
        return res.status(404).json({
            error: 'Match not found',
            _links: {
                matches: { href: '/api/matches' }
            }
        });
    }

    res.json({
        ...match,
        ...req.body,
        _links: {
            self: { href: `/api/matches/${matchId}` }
        }
    });
});

router.delete('/:id', (req, res) => {
    const matchId = parseInt(req.params.id);
    const match = data.matches.find(m => m.id === matchId);

    if (!match) {
        return res.status(404).json({
            error: 'Match not found',
            _links: {
                matches: { href: '/api/matches' }
            }
        });
    }

    res.status(204).send();
});

export default router; 