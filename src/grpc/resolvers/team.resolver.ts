import { GRPCDataSource } from '../utils/data';
import { applyFilters, applySorting, applyPagination } from '../utils/filters';
import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';

interface TeamServiceCall<T> extends ServerUnaryCall<T, any> {}

export class TeamResolver {
    private dataSource: GRPCDataSource;

    constructor() {
        this.dataSource = new GRPCDataSource();
    }

    async getTeams(call: TeamServiceCall<any>, callback: sendUnaryData<any>) {
        try {
            const filter = call.request;
            let teams = await this.dataSource.getAllTeams();

            teams = applyFilters(teams, filter);
            teams = applySorting(teams, filter.sort);
            teams = applyPagination(teams, filter.pagination);

            callback(null, { teams });
        } catch (error) {
            callback(error, null);
        }
    }

    async getTeam(call: TeamServiceCall<any>, callback: sendUnaryData<any>) {
        try {
            const { id } = call.request;
            const team = await this.dataSource.getTeamById(id);
            if (!team) {
                throw new Error('Team not found');
            }
            callback(null, team);
        } catch (error) {
            callback(error, null);
        }
    }

    async createTeam(call: TeamServiceCall<any>, callback: sendUnaryData<any>) {
        try {
            const teamData = call.request;
            const newTeam = await this.dataSource.createTeam(teamData);
            callback(null, newTeam);
        } catch (error) {
            callback(error, null);
        }
    }

    async updateTeam(call: TeamServiceCall<any>, callback: sendUnaryData<any>) {
        try {
            const { id, ...updateData } = call.request;
            const updatedTeam = await this.dataSource.updateTeam(id, updateData);
            if (!updatedTeam) {
                throw new Error('Team not found');
            }
            callback(null, updatedTeam);
        } catch (error) {
            callback(error, null);
        }
    }

    async deleteTeam(call: TeamServiceCall<any>, callback: sendUnaryData<any>) {
        try {
            const { id } = call.request;
            const success = await this.dataSource.deleteTeam(id);
            callback(null, { success });
        } catch (error) {
            callback(error, null);
        }
    }
} 