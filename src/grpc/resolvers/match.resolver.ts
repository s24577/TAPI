import { GRPCDataSource } from '../utils/data';
import { applyFilters, applySorting, applyPagination } from '../utils/filters';
import { ServerUnaryCall, sendUnaryData, status } from '@grpc/grpc-js';

interface MatchServiceCall<T> extends ServerUnaryCall<T, any> {}

export class MatchResolver {
    private dataSource: GRPCDataSource;

    constructor() {
        this.dataSource = new GRPCDataSource();
    }

    async getMatches(call: MatchServiceCall<any>, callback: sendUnaryData<any>) {
        try {
            const filter = call.request;
            let matches = await this.dataSource.getAllMatches();

            matches = applyFilters(matches, filter);
            matches = applySorting(matches, filter.sort);
            matches = applyPagination(matches, filter.pagination);

            callback(null, { matches });
        } catch (error) {
            callback({
                code: status.INTERNAL,
                message: 'Internal error during getMatches'
            }, null);
        }
    }

    async getMatch(call: MatchServiceCall<any>, callback: sendUnaryData<any>) {
        try {
            const { id } = call.request;
            const match = await this.dataSource.getMatchById(id);
            if (!match) {
                callback({
                    code: status.NOT_FOUND,
                    message: 'Match not found'
                }, null);
                return;
            }
            callback(null, match);
        } catch (error) {
            callback({
                code: status.INTERNAL,
                message: 'Internal error during getMatch'
            }, null);
        }
    }

    async createMatch(call: MatchServiceCall<any>, callback: sendUnaryData<any>) {
        try {
            const matchData = call.request;
            const newMatch = await this.dataSource.createMatch({
                team1: matchData.team1,
                team2: matchData.team2,
                date: matchData.date,
                event: matchData.event,
                map: matchData.map,
                format: matchData.format,
                status: matchData.status || 'UPCOMING',
                team1Score: 0,
                team2Score: 0,
                streamUrl: matchData.streamUrl
            });
            callback(null, newMatch);
        } catch (error) {
            callback({
                code: status.INTERNAL,
                message: 'Internal error during createMatch'
            }, null);
        }
    }

    async updateMatch(call: MatchServiceCall<any>, callback: sendUnaryData<any>) {
        try {
            const { id, ...updateData } = call.request;
            const updatedMatch = await this.dataSource.updateMatch(id, updateData);
            if (!updatedMatch) {
                callback({
                    code: status.NOT_FOUND,
                    message: 'Match not found'
                }, null);
                return;
            }
            callback(null, updatedMatch);
        } catch (error) {
            callback({
                code: status.INTERNAL,
                message: 'Internal error during updateMatch'
            }, null);
        }
    }

    async deleteMatch(call: MatchServiceCall<any>, callback: sendUnaryData<any>) {
        try {
            const { id } = call.request;
            const success = await this.dataSource.deleteMatch(id);
            if (!success) {
                callback({
                    code: status.NOT_FOUND,
                    message: 'Match not found'
                }, null);
                return;
            }
            callback(null, { success });
        } catch (error) {
            callback({
                code: status.INTERNAL,
                message: 'Internal error during deleteMatch'
            }, null);
        }
    }
} 