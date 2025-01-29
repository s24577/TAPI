import { GRPCDataSource } from '../utils/data';
import { TeamFilter, Team, CreateTeamRequest, UpdateTeamRequest, TeamId, DeleteResponse } from '../utils/data';
import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';

interface TeamServiceCall<T> extends ServerUnaryCall<T, any> {}

interface TeamList {
    teams: Team[];
}

export class TeamsService {
    private dataSource: GRPCDataSource;

    constructor() {
        this.dataSource = new GRPCDataSource();
    }

    async getTeams(call: TeamServiceCall<TeamFilter>, callback: sendUnaryData<TeamList>) {
        try {
            const filter = call.request;
            let result = await this.dataSource.getAllTeams();

            if (filter.name) {
                const { eq, contains, notEq, notContains } = filter.name || {};
                result = result.filter(team => {
                    if (eq && team.name !== eq) return false;
                    if (contains && !team.name.includes(contains)) return false;
                    if (notEq && team.name === notEq) return false;
                    if (notContains && team.name.includes(notContains)) return false;
                    return true;
                });
            }

            if (filter.sort) {
                const { field, direction } = filter.sort;
                result.sort((a, b) => {
                    const multiplier = direction === 'DESC' ? -1 : 1;
                    const aValue = String(a[field] || '');
                    const bValue = String(b[field] || '');
                    return multiplier * aValue.localeCompare(bValue);
                });
            }

            if (filter.pagination) {
                const { page = 1, pageSize = 10 } = filter.pagination;
                const start = (page - 1) * pageSize;
                result = result.slice(start, start + pageSize);
            }

            return { teams: result };
        } catch (error) {
            console.error('Error in getTeams:', error);
            throw error;
        }
    }

    async getTeam(call: TeamServiceCall<TeamId>, callback: sendUnaryData<Team>) {
        try {
            const { id } = call.request;
            const team = await this.dataSource.getTeamById(id);
            if (!team) {
                throw new Error('Team not found');
            }
            return team;
        } catch (error) {
            console.error('Error in getTeam:', error);
            throw error;
        }
    }

    async createTeam(call: TeamServiceCall<CreateTeamRequest>, callback: sendUnaryData<Team>) {
        try {
            const teamData = call.request;
            const newTeam = await this.dataSource.createTeam(teamData);
            return newTeam;
        } catch (error) {
            console.error('Error in createTeam:', error);
            throw error;
        }
    }

    async updateTeam(call: TeamServiceCall<UpdateTeamRequest>, callback: sendUnaryData<Team>) {
        try {
            const { id, ...updateData } = call.request;
            const updatedTeam = await this.dataSource.updateTeam(id, updateData);
            if (!updatedTeam) {
                throw new Error('Team not found');
            }
            return updatedTeam;
        } catch (error) {
            console.error('Error in updateTeam:', error);
            throw error;
        }
    }

    async deleteTeam(call: TeamServiceCall<TeamId>, callback: sendUnaryData<DeleteResponse>) {
        try {
            const { id } = call.request;
            const success = await this.dataSource.deleteTeam(id);
            return { success };
        } catch (error) {
            console.error('Error in deleteTeam:', error);
            throw error;
        }
    }
} 