import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { PlayerResolver } from './resolvers/player.resolver';
import { TeamResolver } from './resolvers/team.resolver';
import { MatchResolver } from './resolvers/match.resolver';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.resolve(__dirname, './proto/hltv.proto');
const PROTO_DIR = path.resolve(__dirname, './proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    includeDirs: [PROTO_DIR]
});

const proto = grpc.loadPackageDefinition(packageDefinition) as any;
const playerResolver = new PlayerResolver();
const teamResolver = new TeamResolver();
const matchResolver = new MatchResolver();

function startServer() {
    const server = new grpc.Server();

    server.addService(proto.hltv.PlayerService.service, {
        getPlayers: playerResolver.getPlayers.bind(playerResolver),
        getPlayer: playerResolver.getPlayer.bind(playerResolver)
    });

    server.addService(proto.hltv.TeamService.service, {
        getTeams: teamResolver.getTeams.bind(teamResolver),
        getTeam: teamResolver.getTeam.bind(teamResolver),
        createTeam: teamResolver.createTeam.bind(teamResolver),
        updateTeam: teamResolver.updateTeam.bind(teamResolver),
        deleteTeam: teamResolver.deleteTeam.bind(teamResolver)
    });

    server.addService(proto.hltv.MatchService.service, {
        getMatches: matchResolver.getMatches.bind(matchResolver),
        getMatch: matchResolver.getMatch.bind(matchResolver),
        createMatch: matchResolver.createMatch.bind(matchResolver),
        updateMatch: matchResolver.updateMatch.bind(matchResolver),
        deleteMatch: matchResolver.deleteMatch.bind(matchResolver)
    });

    server.bindAsync(
        '0.0.0.0:50051',
        grpc.ServerCredentials.createInsecure(),
        (error, port) => {
            if (error) {
                console.error('Failed to start gRPC server:', error);
                return;
            }
            server.start();
            console.log(`gRPC server running on port ${port}`);
        }
    );
}

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});

console.log('Starting gRPC server...');
startServer(); 