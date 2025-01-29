import { GRPCDataSource } from '../utils/data';
import { applyFilters, applySorting, applyPagination } from '../utils/filters';
import { ServerUnaryCall, sendUnaryData, status } from '@grpc/grpc-js';

interface PlayerServiceCall<T> extends ServerUnaryCall<T, any> {}

export class PlayerResolver {
    private dataSource: GRPCDataSource;

    constructor() {
        this.dataSource = new GRPCDataSource();
    }

    async getPlayers(call: PlayerServiceCall<any>, callback: sendUnaryData<any>) {
        try {
            const filter = call.request;
            let players = await this.dataSource.getAllPlayers();

            players = applyFilters(players, filter);
            players = applySorting(players, filter.sort);
            players = applyPagination(players, filter.pagination);

            callback(null, { players });
        } catch (error) {
            callback({
                code: status.INTERNAL,
                message: 'Internal error during getPlayers'
            }, null);
        }
    }

    async getPlayer(call: PlayerServiceCall<any>, callback: sendUnaryData<any>) {
        try {
            const { id } = call.request;
            const player = await this.dataSource.getPlayerById(id);
            if (!player) {
                callback({
                    code: status.NOT_FOUND,
                    message: 'Player not found'
                }, null);
                return;
            }
            callback(null, player);
        } catch (error) {
            callback({
                code: status.INTERNAL,
                message: 'Internal error during getPlayer'
            }, null);
        }
    }
} 