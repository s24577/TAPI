import { readFileSync } from 'fs';
import path from 'path';

export interface Player {
    id: number;
    nickname: string;
    fullName: string;
    country: string;
    age: number;
    rating: number;
}

export interface Team {
    id: number;
    name: string;
    rank?: number;
    country: string;
    players: Player[];
    region: string;
    worldRanking: number;
    winRate: number;
    logoUrl: string;
    totalMatches: number;
    matchesWon: number;
    matchesLost: number;
    averagePlayerRating: number;
}

export interface Match {
    id: number;
    team1: Team;
    team2: Team;
    date: string;
    event: string;
    map?: string;
    format: string;
    status: string;
    team1Score?: number;
    team2Score?: number;
    streamUrl?: string;
}

export interface RawMatch {
    id: number;
    team1: string;
    team2: string;
    date: string;
    event: string;
    map?: string;
    format: string;
    status: string;
    team1Score?: number;
    team2Score?: number;
    streamUrl?: string;
}

export interface TeamFilter {
    name?: {
        eq?: string;
        contains?: string;
        notEq?: string;
        notContains?: string;
    };
    sort?: {
        field: keyof Team;
        direction: 'ASC' | 'DESC';
    };
    pagination?: {
        page: number;
        pageSize: number;
    };
}

export interface CreateTeamRequest extends Omit<Team, 'id'> {}

export interface UpdateTeamRequest {
    id: number;
    name?: string;
    country?: string;
    region?: string;
    rank?: number;
    players?: Player[];
}

export interface TeamId {
    id: number;
}

export interface DeleteResponse {
    success: boolean;
}

export class GRPCDataSource {
    private teams: Team[] = [];
    private matches: RawMatch[] = [];

    constructor() {
try {
    const filePath = path.join(process.cwd(), 'src/data/hltv.json');
    const fileContent = readFileSync(filePath, 'utf-8');
            const data = JSON.parse(fileContent);
            this.teams = data.teams;
            this.matches = data.matches;
            console.log('GRPC Data initialized:', {
                teamsCount: this.teams.length,
                matchesCount: this.matches.length
            });
} catch (error) {
            console.error('Error initializing GRPC data:', error);
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

    async getAllPlayers(): Promise<Player[]> {
        return this.teams.flatMap(t => t.players);
    }

    async getAllMatches(): Promise<Match[]> {
        return Promise.all(this.matches.map(async match => {
            const team1 = this.teams.find(t => t.name === match.team1) || this.createDefaultTeam(match.team1);
            const team2 = this.teams.find(t => t.name === match.team2) || this.createDefaultTeam(match.team2);
            return { ...match, team1, team2 };
        }));
    }

    async getMatchById(id: number): Promise<Match | undefined> {
        const match = this.matches.find(m => m.id === id);
        if (!match) return undefined;

        const team1 = this.teams.find(t => t.name === match.team1) || this.createDefaultTeam(match.team1);
        const team2 = this.teams.find(t => t.name === match.team2) || this.createDefaultTeam(match.team2);
        return { ...match, team1, team2 };
    }

    async getMatchesByTeam(teamId: number): Promise<Match[]> {
        const team = await this.getTeamById(teamId);
        if (!team) return [];
        
        return Promise.all(this.matches
            .filter(m => m.team1 === team.name || m.team2 === team.name)
            .map(async match => {
                const team1 = this.teams.find(t => t.name === match.team1) || this.createDefaultTeam(match.team1);
                const team2 = this.teams.find(t => t.name === match.team2) || this.createDefaultTeam(match.team2);
                return { ...match, team1, team2 };
            }));
    }

    async getMatchesByEvent(event: string): Promise<Match[]> {
        return Promise.all(this.matches
            .filter(m => m.event === event)
            .map(async match => {
                const team1 = this.teams.find(t => t.name === match.team1) || this.createDefaultTeam(match.team1);
                const team2 = this.teams.find(t => t.name === match.team2) || this.createDefaultTeam(match.team2);
                return { ...match, team1, team2 };
            }));
    }

    async createTeam(input: Omit<Team, 'id'>): Promise<Team> {
        const newTeam: Team = {
            id: this.teams.length + 1,
            ...input
        };
        this.teams.push(newTeam);
        return newTeam;
    }

    async updateTeam(id: number, input: Partial<Team>): Promise<Team | null> {
        const index = this.teams.findIndex(t => t.id === id);
        if (index === -1) return null;

        const currentTeam = this.teams[index];
        const updatedTeam = {
            ...currentTeam,
            ...input,
            country: input.country || currentTeam.country,
            region: input.region || currentTeam.region,
            worldRanking: input.worldRanking ?? currentTeam.worldRanking,
            winRate: input.winRate ?? currentTeam.winRate,
            players: input.players || currentTeam.players
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

    async createMatch(matchData: {
        team1: string;
        team2: string;
        date: string;
        event: string;
        map?: string;
        format: string;
        status: string;
        team1Score?: number;
        team2Score?: number;
        streamUrl?: string;
    }): Promise<Match> {
        const team1Data = this.teams.find(t => t.name === matchData.team1);
        const team2Data = this.teams.find(t => t.name === matchData.team2);

        if (!team1Data || !team2Data) {
            throw new Error('One or both teams not found');
        }

        const newMatch: RawMatch = {
            id: this.matches.length + 1,
            ...matchData
        };
        this.matches.push(newMatch);

        return {
            ...newMatch,
            team1: team1Data,
            team2: team2Data
        };
    }

    async updateMatch(id: number, updateData: Partial<RawMatch>): Promise<Match | null> {
        const index = this.matches.findIndex(m => m.id === id);
        if (index === -1) return null;

        const updatedMatch = {
            ...this.matches[index],
            ...updateData
        };
        this.matches[index] = updatedMatch;

        const team1 = this.teams.find(t => t.name === updatedMatch.team1) || this.createDefaultTeam(updatedMatch.team1);
        const team2 = this.teams.find(t => t.name === updatedMatch.team2) || this.createDefaultTeam(updatedMatch.team2);

        return { ...updatedMatch, team1, team2 };
    }

    async deleteMatch(id: number): Promise<boolean> {
        const index = this.matches.findIndex(m => m.id === id);
        if (index === -1) return false;

        this.matches.splice(index, 1);
        return true;
    }

    private createDefaultTeam(name: string): Team {
        return {
            id: 0,
            name: name,
            country: '',
            players: [],
            region: '',
            worldRanking: 0,
            winRate: 0,
            logoUrl: '',
            totalMatches: 0,
            matchesWon: 0,
            matchesLost: 0,
            averagePlayerRating: 0
        };
    }
} 