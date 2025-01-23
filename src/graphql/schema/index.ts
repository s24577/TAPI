import { GraphQLSchema, GraphQLObjectType, GraphQLNonNull, GraphQLList, GraphQLID, GraphQLString, GraphQLInputObjectType, GraphQLEnumType } from 'graphql';
import { TeamType, MatchType, TeamFilterInput, TeamSortInput } from './types.js';
import { data, getTeamById, getMatchById } from '../data/data.js';
import { typeDefs } from './types';
import { resolvers } from '../resolvers';
import { makeExecutableSchema } from '@graphql-tools/schema';

const StringFilterInput = new GraphQLInputObjectType({
    name: 'StringFilter',
    fields: {
        eq: { type: GraphQLString },
        contains: { type: GraphQLString },
        notEq: { type: GraphQLString },
        notContains: { type: GraphQLString }
    }
});

const NumberFilterInput = new GraphQLInputObjectType({
    name: 'NumberFilter',
    fields: {
        eq: { type: GraphQLString },
        gt: { type: GraphQLString },
        lt: { type: GraphQLString },
        gte: { type: GraphQLString },
        lte: { type: GraphQLString }
    }
});


const SortDirectionEnum = new GraphQLEnumType({
    name: 'SortDirection',
    values: {
        ASC: { value: 'ASC' },
        DESC: { value: 'DESC' }
    }
});


const QueryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        teams: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TeamType))),
            args: {
                filter: { type: TeamFilterInput },
                sort: { type: TeamSortInput }
            },
            resolve: async (_, { filter, sort }, { dataSources }) => {
                let teams = await dataSources.hltv.getAllTeams();
                
                if (filter) {
                    teams = await dataSources.hltv.filterTeams(filter);
                }
                
                if (sort) {
                    teams = await dataSources.hltv.sortTeams(sort.field, sort.direction);
                }
                
                return teams;
            }
        },
        team: {
            type: TeamType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve: (_, { id }) => getTeamById(parseInt(id))
        },
        matches: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MatchType))),
            resolve: () => data.matches
        },
        match: {
            type: MatchType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve: (_, { id }) => getMatchById(parseInt(id))
        }
    }
});

const MutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        createTeam: {
            type: new GraphQLNonNull(TeamType),
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                country: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve: async (_, { name, country }, { dataSources }) => {
                return dataSources.hltv.createTeam({ 
                    name, 
                    country, 
                    players: [] 
                });
            }
        }
    }
});

export const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
}); 