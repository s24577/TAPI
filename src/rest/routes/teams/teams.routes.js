import express from 'express';
import data from '../../../data/hltv.json' assert { type: "json" };

const router = express.Router();

router.get('/', (req, res) => {
    const teams = data.teams.map(team => ({
        ...team,
        _links: {
            self: { href: `/api/teams/${team.id}` },
            players: { href: `/api/teams/${team.id}/players` },
            matches: { href: `/api/teams/${team.id}/matches` }
        }
    }));

    res.setHeader('X-Total-Count', teams.length);
    res.setHeader('ETag', `W/"${Date.now()}"`);
    res.json({
        data: teams,
        _links: {
            self: { href: '/api/teams' },
            matches: { href: '/api/matches' }
        }
    });
});

router.get('/:id', (req, res) => {
    const team = data.teams.find(t => t.id === parseInt(req.params.id));
    
    if (!team) {
        return res.status(404).json({
            error: 'Team not found',
            _links: {
                teams: { href: '/api/teams' }
            }
        });
    }

    res.json({
        ...team,
        _links: {
            self: { href: `/api/teams/${team.id}` },
            players: { href: `/api/teams/${team.id}/players` },
            matches: { href: `/api/teams/${team.id}/matches` }
        }
    });
});

router.post('/', (req, res) => {
    const { name, country, players } = req.body;

    if (!name || !country || !players) {
        return res.status(400).json({
            error: 'Missing required fields',
            _links: {
                self: { href: '/api/teams' }
            }
        });
    }

    const newTeam = {
        id: data.teams.length + 1,
        name,
        country,
        players
    };

    res.status(201)
        .setHeader('Location', `/api/teams/${newTeam.id}`)
        .json({
            ...newTeam,
            _links: {
                self: { href: `/api/teams/${newTeam.id}` }
            }
        });
});

router.put('/:id', (req, res) => {
    const teamId = parseInt(req.params.id);
    const team = data.teams.find(t => t.id === teamId);

    if (!team) {
        return res.status(404).json({
            error: 'Team not found',
            _links: {
                teams: { href: '/api/teams' }
            }
        });
    }

    res.json({
        ...team,
        ...req.body,
        _links: {
            self: { href: `/api/teams/${teamId}` }
        }
    });
});

router.delete('/:id', (req, res) => {
    const teamId = parseInt(req.params.id);
    const team = data.teams.find(t => t.id === teamId);

    if (!team) {
        return res.status(404).json({
            error: 'Team not found',
            _links: {
                teams: { href: '/api/teams' }
            }
        });
    }
    
    res.status(204).send();
});

export default router; 