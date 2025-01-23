interface Player {
    id: number;
    nickname: string;
    fullName: string;
    country: string;
    age: number;
    rating: number;
    joinDate: string;
    maps: number;
    kdRatio: number;
}

interface Team {
    id: number;
    name: string;
    rank?: number;
    country: string;
    players: Player[];
    region: string;
    worldRanking: number;
    winRate: number;
    totalWins: number;
    totalLosses: number;
    founded: string;
}

interface Match {
    id: number;
    team1Id: number;
    team2Id: number;
    date: string;
    event: string;
    map?: string;
    format: string;
    status: 'upcoming' | 'live' | 'completed';
    score?: {
        team1: number;
        team2: number;
    };
}

export const data = {
    teams: [
        {
            id: 1,
            name: "Natus Vincere",
            rank: 1,
            country: "Ukraine",
            region: "CIS",
            worldRanking: 1,
            winRate: 68.5,
            totalWins: 245,
            totalLosses: 112,
            founded: "2009-12-17",
            players: [
                {
                    id: 101,
                    nickname: "s1mple",
                    fullName: "Oleksandr Kostyliev",
                    country: "Ukraine",
                    age: 26,
                    rating: 1.23,
                    joinDate: "2016-08-04",
                    maps: 1250,
                    kdRatio: 1.45
                },
                {
                    id: 102,
                    nickname: "b1t",
                    fullName: "Valeriy Vakhovskiy",
                    country: "Ukraine",
                    age: 21,
                    rating: 1.15,
                    joinDate: "2020-11-20",
                    maps: 580,
                    kdRatio: 1.18
                }
            ]
        },
        {
            id: 2,
            name: "FaZe Clan",
            rank: 2,
            country: "International",
            region: "Europe",
            worldRanking: 2,
            winRate: 65.8,
            totalWins: 228,
            totalLosses: 118,
            founded: "2016-01-20",
            players: [
                {
                    id: 201,
                    nickname: "karrigan",
                    fullName: "Finn Andersen",
                    country: "Denmark",
                    age: 33,
                    rating: 0.98,
                    joinDate: "2021-02-15",
                    maps: 1480,
                    kdRatio: 0.95
                },
                {
                    id: 202,
                    nickname: "broky",
                    fullName: "Helvijs Saukants",
                    country: "Latvia",
                    age: 22,
                    rating: 1.17,
                    joinDate: "2019-09-26",
                    maps: 890,
                    kdRatio: 1.22
                }
            ]
        },
        {
            id: 3,
            name: "Vitality",
            rank: 3,
            country: "France",
            region: "Europe",
            worldRanking: 3,
            winRate: 63.2,
            totalWins: 215,
            totalLosses: 125,
            founded: "2018-10-08",
            players: [
                {
                    id: 301,
                    nickname: "ZywOo",
                    fullName: "Mathieu Herbaut",
                    country: "France",
                    age: 23,
                    rating: 1.32,
                    joinDate: "2018-10-08",
                    maps: 950,
                    kdRatio: 1.48
                }
            ]
        }
    ],
    matches: [
        {
            id: 1,
            team1Id: 1,
            team2Id: 2,
            date: "2024-03-24T18:00:00Z",
            event: "BLAST Premier: Spring Finals 2024",
            map: "Inferno",
            format: "BO3",
            status: "upcoming"
        },
        {
            id: 2,
            team1Id: 2,
            team2Id: 3,
            date: "2024-03-23T15:30:00Z",
            event: "ESL Pro League Season 19",
            map: "Mirage",
            format: "BO3",
            status: "completed",
            score: {
                team1: 16,
                team2: 14
            }
        }
    ] as const
};

export const getTeamById = (id: number): Team | undefined => 
    data.teams.find(t => t.id === id);

export const getPlayerById = (id: number): Player | undefined => 
    data.teams.flatMap(t => t.players).find(p => p.id === id);

export const getMatchById = (id: number): Match | undefined => 
    data.matches.find(m => m.id === id);

export const getTeamPlayers = (teamId: number): Player[] => 
    data.teams.find(t => t.id === teamId)?.players || [];

export const getPlayerTeam = (playerId: number): Team | undefined => 
    data.teams.find(t => t.players.some(p => p.id === playerId));
