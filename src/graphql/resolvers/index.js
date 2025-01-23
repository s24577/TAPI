import { teamsResolver } from './teams.resolver.js';
import { matchesResolver } from './matches.resolver.js';
import { newsResolver } from './news.resolver.js';
import { statisticsResolver } from './statistics.resolver.js';
import { DateTimeScalar } from '../types/scalars.js';

export const resolvers = {
    DateTime: DateTimeScalar,
    Query: {
        ...teamsResolver.Query,
        ...matchesResolver.Query,
        ...newsResolver.Query,
        ...statisticsResolver.Query
    },
    Mutation: {
        ...teamsResolver.Mutation,
        ...matchesResolver.Mutation,
        ...newsResolver.Mutation,
        ...statisticsResolver.Mutation
    }
}; 