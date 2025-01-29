import { GRPCDataSource } from '../utils/data';
import type { Match, RawMatch } from '../utils/data';

interface MatchFilter {
    event?: {
        eq?: string;
        contains?: string;
    };
    sort?: {
        field: keyof (Match | RawMatch);
        direction: 'ASC' | 'DESC';
    };
    pagination?: {
        page: number;
        pageSize: number;
    };
}

interface UpdateMatchRequest {
    id: number;
    team1?: string;
    team2?: string;
    date?: string;
    event?: string;
    map?: string;
    format?: string;
    status?: string;
    team1Score?: number;
    team2Score?: number;
    streamUrl?: string;
}

export class MatchesService {
    private dataSource: GRPCDataSource;

    constructor() {
        this.dataSource = new GRPCDataSource();
    }

    async getMatches(call: { request: MatchFilter }) {
        try {
            const filter = call.request;
            let matches = await this.dataSource.getAllMatches();

            if (filter.event) {
                const { eq, contains } = filter.event || {};
                matches = matches.filter(match => {
                    if (eq && match.event !== eq) return false;
                    if (contains && !match.event.includes(contains)) return false;
                    return true;
                });
            }

            if (filter.sort) {
                const { field, direction } = filter.sort;
                matches.sort((a, b) => {
                    const multiplier = direction === 'DESC' ? -1 : 1;
                    const aValue = String(a[field] || '');
                    const bValue = String(b[field] || '');
                    if (field === 'date') {
                        return multiplier * (new Date(aValue).getTime() - new Date(bValue).getTime());
                    }
                    return multiplier * aValue.localeCompare(bValue);
                });
            }

            if (filter.pagination) {
                const { page = 1, pageSize = 10 } = filter.pagination;
                const start = (page - 1) * pageSize;
                matches = matches.slice(start, start + pageSize);
            }

            return { matches };
        } catch (error) {
            console.error('Error in getMatches:', error);
            throw error;
        }
    }

    async getMatch(call: { request: { id: number } }) {
        try {
            const { id } = call.request;
            const match = await this.dataSource.getMatchById(id);
            if (!match) {
                throw new Error('Match not found');
            }
            return match;
        } catch (error) {
            console.error('Error in getMatch:', error);
            throw error;
        }
    }

    async createMatch(call: { request: {
        team1Id: number;
        team2Id: number;
        date: string;
        event: string;
        map?: string;
        format: string;
        status?: string;
        streamUrl?: string;
    }}) {
        try {
            const matchData = call.request;
            const team1 = await this.dataSource.getTeamById(matchData.team1Id);
            const team2 = await this.dataSource.getTeamById(matchData.team2Id);
            
            if (!team1 || !team2) {
                throw new Error('One or both teams not found');
            }

            const newMatch = await this.dataSource.createMatch({
                team1: team1.name,
                team2: team2.name,
                date: matchData.date,
                event: matchData.event,
                map: matchData.map || '',
                format: matchData.format,
                status: matchData.status || 'UPCOMING',
                team1Score: 0,
                team2Score: 0,
                streamUrl: matchData.streamUrl || ''
            });

            return newMatch;
        } catch (error) {
            console.error('Error in createMatch:', error);
            throw error;
        }
    }

    async updateMatch(call: { request: UpdateMatchRequest }) {
        try {
            const { id, ...updateData } = call.request;
            const updatedMatch = await this.dataSource.updateMatch(id, updateData);
            if (!updatedMatch) {
                throw new Error('Match not found');
            }
            return updatedMatch;
        } catch (error) {
            console.error('Error in updateMatch:', error);
            throw error;
        }
    }

    async deleteMatch(call: { request: { id: number } }) {
        try {
            const { id } = call.request;
            const success = await this.dataSource.deleteMatch(id);
            if (!success) {
                throw new Error('Match not found');
            }
            return { success };
        } catch (error) {
            console.error('Error in deleteMatch:', error);
            throw error;
        }
    }
} 