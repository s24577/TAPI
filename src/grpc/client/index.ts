import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.resolve(__dirname, '../proto/hltv.proto');
const PROTO_DIR = path.resolve(__dirname, '../proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    includeDirs: [PROTO_DIR]
});

const proto = grpc.loadPackageDefinition(packageDefinition) as any;

const teamsClient = new proto.hltv.TeamService(
    'localhost:50051',
    grpc.credentials.createInsecure()
);

const matchesClient = new proto.hltv.MatchService(
    'localhost:50051',
    grpc.credentials.createInsecure()
);

const playersClient = new proto.hltv.PlayerService(
    'localhost:50051',
    grpc.credentials.createInsecure()
);

async function runAllTests() {
    console.log('Starting gRPC tests...\n');

    await testTeamsService();

    await testMatchesService();

    await testPlayersService();
}

async function testTeamsService() {
    
    teamsClient.getTeams({
        name: { contains: 'Natus' },
        sort: { field: 'rank', direction: 'ASC' },
        pagination: { page: 1, pageSize: 10 }
    }, (error: any, response: any) => {
        if (error) {
            console.error('Error:', error);
            return;
        }
    });

    teamsClient.getTeam({ id: 1 }, (error: any, response: any) => {
        if (error) {
            console.error('Error:', error);
            return;
        }
    });

    teamsClient.createTeam({
        name: "Test Team",
        country: "PL",
        region: "EU",
        worldRanking: 1,
        winRate: 0.75
    }, logResponse('Create Team'));

    teamsClient.updateTeam({
        id: 1,
        name: "Updated Team"
    }, logResponse('Update Team'));

    teamsClient.deleteTeam({ id: 1 }, logResponse('Delete Team'));
}

async function testMatchesService() {
    
    matchesClient.getMatches({
        event: { contains: 'ESL' },
        sort: { field: 'date', direction: 'DESC' },
        pagination: { page: 1, pageSize: 5 }
    }, logResponse('Matches'));

    matchesClient.getMatch({ id: 1 }, logResponse('Single Match'));

    matchesClient.createMatch({
        team1Id: 1, 
        team2Id: 2, 
        date: new Date().toISOString(),
        event: "Test Match",
        map: "de_inferno",
        format: "BO3",
        status: "UPCOMING",
        streamUrl: "https://www.twitch.tv/esl_csgo"
    }, logResponse('Create Match'));
}

async function testPlayersService() {
    
    playersClient.getPlayers({
        country: { contains: 'PL' },
        sort: { field: 'rating', direction: 'DESC' },
        pagination: { page: 1, pageSize: 5 }
    }, logResponse('Players'));

    playersClient.getPlayer({ id: 1 }, logResponse('Single Player'));
}

function logResponse(label: string) {
    return (error: any, response: any) => {
        if (error) {
            console.error(`Error in ${label}:`, error);
            return;
        }
    };
}

runAllTests().catch(console.error);