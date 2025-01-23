import { data } from '../data/data';
import { DataSource } from 'apollo-datasource';

interface Player {
    id: number;
    nickname: string;
    fullName: string;
    country: string;
    age: number;
    rating: number;
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
}

export class HLTVDataSource extends DataSource {
    private teams: Team[] = [];
    private matches: Match[] = [];

    constructor() {
        super();
        try {
            this.teams = JSON.parse(JSON.stringify(data.teams));
            this.matches = JSON.parse(JSON.stringify(data.matches));
            console.log('Data initialized:', {
                teamsCount: this.teams.length,
                matchesCount: this.matches.length
            });
        } catch (error) {
            console.error('Error initializing data:', error);
            this.teams = [];
            this.matches = [];
        }
    }

    async getAllTeams(): Promise<Team[]> {
        return this.teams;
    }

    async getTeamById(id: number): Promise<Team | undefined> {
        return this.teams.find(t => t.id === id);
    }

    async getTeamsByRank(rank: number): Promise<Team[]> {
        return this.teams.filter(t => t.rank === rank);
    }

    async getTeamsByCountry(country: string): Promise<Team[]> {
        return this.teams.filter(t => t.country === country);
    }

    async getPlayerById(id: number): Promise<Player | undefined> {
        return this.teams
            .flatMap(t => t.players)
            .find(p => p.id === id);
    }

    async getPlayersByTeam(teamId: number): Promise<Player[]> {
        const team = await this.getTeamById(teamId);
        return team?.players || [];
    }

    async getPlayersByCountry(country: string): Promise<Player[]> {
        return this.teams
            .flatMap(t => t.players)
            .filter(p => p.country === country);
    }

    async getAllMatches(): Promise<Match[]> {
        return this.matches;
    }

    async getMatchById(id: number): Promise<Match | undefined> {
        return this.matches.find(m => m.id === id);
    }

    async getMatchesByTeam(teamId: number): Promise<Match[]> {
        return this.matches.filter(m => 
            m.team1Id === teamId || m.team2Id === teamId
        );
    }

    async getMatchesByEvent(event: string): Promise<Match[]> {
        return this.matches.filter(m => m.event === event);
    }

    async createTeam(input: Omit<Team, 'id'>): Promise<Team> {
        const newTeam: Team = {
            id: this.teams.length + 1,
            ...input,
            players: []
        };
        this.teams.push(newTeam);
        return newTeam;
    }

    async updateTeam(id: number, input: Partial<Team>): Promise<Team | null> {
        const index = this.teams.findIndex(t => t.id === id);
        if (index === -1) return null;

        const updatedTeam = {
            ...this.teams[index],
            ...input
        };
        this.teams[index] = updatedTeam;
        return updatedTeam;
    }

    async deleteTeam(id: number): Promise<boolean> {
        const index = this.teams.findIndex(t => t.id === id);
        if (index === -1) return false;

        this.teams.splice(index, 1);
        return true;
    }
} 