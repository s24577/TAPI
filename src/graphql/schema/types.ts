import { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLFloat, GraphQLList, GraphQLNonNull, GraphQLID, GraphQLInputObjectType, GraphQLEnumType } from 'graphql';
import { DateTimeScalar } from '../types/scalars.js';
import { getPlayerTeam, getTeamPlayers, getTeamById } from '../data/data.js';
import { gql } from 'apollo-server';

export const PlayerType: GraphQLObjectType = new GraphQLObjectType({
    name: 'Player',
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLID) },
        nickname: { type: new GraphQLNonNull(GraphQLString) },
        fullName: { type: new GraphQLNonNull(GraphQLString) },
        country: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        rating: { type: new GraphQLNonNull(GraphQLFloat) },
        joinDate: { type: new GraphQLNonNull(GraphQLString) },
        maps: { type: new GraphQLNonNull(GraphQLInt) },
        kdRatio: { type: new GraphQLNonNull(GraphQLFloat) },
        team: { 
            type: TeamType,
            resolve: (player) => getPlayerTeam(player.id)
        }
    })
});

export const TeamType = new GraphQLObjectType({
    name: 'Team',
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        rank: { type: GraphQLInt },
        country: { type: new GraphQLNonNull(GraphQLString) },
        region: { type: new GraphQLNonNull(GraphQLString) },
        worldRanking: { type: new GraphQLNonNull(GraphQLInt) },
        winRate: { type: new GraphQLNonNull(GraphQLFloat) },
        totalWins: { type: new GraphQLNonNull(GraphQLInt) },
        totalLosses: { type: new GraphQLNonNull(GraphQLInt) },
        founded: { type: new GraphQLNonNull(GraphQLString) },
        players: { 
            type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PlayerType))),
            resolve: (team) => team.players
        }
    })
});

export const TeamFilterInput = new GraphQLInputObjectType({
    name: 'TeamFilter',
    fields: () => ({
        name: { type: new GraphQLNonNull(StringFilterInput) },
        rank: { type: new GraphQLNonNull(NumberFilterInput) },
        region: { type: new GraphQLNonNull(StringFilterInput) },
        winRate: { type: new GraphQLNonNull(NumberFilterInput) },
        worldRanking: { type: new GraphQLNonNull(NumberFilterInput) }
    })
});

export const StringFilterInput = new GraphQLInputObjectType({
    name: 'StringFilter',
    fields: () => ({
        eq: { type: GraphQLString },
        contains: { type: GraphQLString },
        notEq: { type: GraphQLString },
        notContains: { type: GraphQLString }
    })
});

export const NumberFilterInput = new GraphQLInputObjectType({
    name: 'NumberFilter',
    fields: {
        eq: { type: GraphQLFloat },
        gt: { type: GraphQLFloat },
        lt: { type: GraphQLFloat },
        gte: { type: GraphQLFloat },
        lte: { type: GraphQLFloat }
    }
});

export const MatchType = new GraphQLObjectType({
    name: 'Match',
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLID) },
        team1: { type: new GraphQLNonNull(TeamType) },
        team2: { type: new GraphQLNonNull(TeamType) },
        date: { type: new GraphQLNonNull(DateTimeScalar) },
        event: { type: new GraphQLNonNull(GraphQLString) },
        map: { type: GraphQLString },
        format: { type: new GraphQLNonNull(GraphQLString) }
    })
});

export const TeamSortInput = new GraphQLInputObjectType({
    name: 'TeamSort',
    fields: () => ({
        field: { type: new GraphQLNonNull(GraphQLString) },
        direction: { type: new GraphQLNonNull(SortDirectionEnum) }
    })
});

export const SortDirectionEnum = new GraphQLEnumType({
    name: 'SortDirection',
    values: {
        ASC: { value: 'ASC' },
        DESC: { value: 'DESC' }
    }
});

export const typeDefs = gql`
  scalar DateTime

  type Player {
    id: ID!
    nickname: String!
    fullName: String!
    country: String!
    age: Int!
    rating: Float!
    team: Team
  }

  type Team {
    id: ID!
    name: String!
    rank: Int
    country: String!
    region: String!
    worldRanking: Int!
    winRate: Float!
    totalWins: Int!
    totalLosses: Int!
    founded: String!
    players: [Player!]!
  }

  type Match {
    id: ID!
    team1: Team!
    team2: Team!
    date: DateTime!
    event: String!
    map: String
    format: String!
  }

  input TeamFilter {
    name: StringFilter
    rank: IntFilter
    region: StringFilter
    winRate: FloatFilter
    worldRanking: IntFilter
  }

  input StringFilter {
    eq: String
    contains: String
    notEq: String
    notContains: String
  }

  input IntFilter {
    eq: Int
    gt: Int
    lt: Int
    gte: Int
    lte: Int
  }

  input FloatFilter {
    eq: Float
    gt: Float
    lt: Float
    gte: Float
    lte: Float
  }

  input SortInput {
    field: String!
    direction: SortDirection!
  }

  enum SortDirection {
    ASC
    DESC
  }

  input PaginationInput {
    page: Int
    pageSize: Int
  }

  type News {
    id: ID!
    title: String!
    content: String!
    date: DateTime!
    author: String
  }

  input NewsFilter {
    title: StringFilter
    date: DateTimeFilter
    author: StringFilter
  }

  input DateTimeFilter {
    eq: DateTime
    gt: DateTime
    lt: DateTime
    gte: DateTime
    lte: DateTime
  }

  type Statistic {
    id: ID!
    type: String!
    value: Float!
    date: DateTime!
    teamId: ID
    playerId: ID
  }

  input StatisticFilter {
    type: StringFilter
    date: DateTimeFilter
    teamId: ID
    playerId: ID
  }

  type Query {
    teams(filter: TeamFilter, sort: SortInput, pagination: PaginationInput): [Team]!
    team(id: ID!): Team
    matches: [Match]!
    match(id: ID!): Match
    news(filter: NewsFilter, sort: SortInput, pagination: PaginationInput): [News]!
    newsItem(id: ID!): News
    statistics(filter: StatisticFilter, sort: SortInput, pagination: PaginationInput): [Statistic]!
    statistic(id: ID!): Statistic
  }

  type Mutation {
    createTeam(input: CreateTeamInput!): Team!
    updateTeam(id: ID!, input: UpdateTeamInput!): Team!
    deleteTeam(id: ID!): Boolean!
    createNews(input: CreateNewsInput!): News!
    updateNews(id: ID!, input: UpdateNewsInput!): News!
    deleteNews(id: ID!): Boolean!
    createStatistic(input: CreateStatisticInput!): Statistic!
    updateStatistic(id: ID!, input: UpdateStatisticInput!): Statistic!
    deleteStatistic(id: ID!): Boolean!
    createMatch(input: CreateMatchInput!): Match!
    updateMatch(id: ID!, input: UpdateMatchInput!): Match!
    deleteMatch(id: ID!): Boolean!
  }

  input CreateTeamInput {
    name: String!
    country: String!
    region: String!
    worldRanking: Int!
    winRate: Float!
  }

  input UpdateTeamInput {
    name: String
    country: String
    region: String
    worldRanking: Int
    winRate: Float
  }

  input CreateNewsInput {
    title: String!
    content: String!
    author: String
  }

  input UpdateNewsInput {
    title: String
    content: String
    author: String
  }

  input CreateStatisticInput {
    type: String!
    value: Float!
    teamId: ID
    playerId: ID
  }

  input UpdateStatisticInput {
    type: String
    value: Float
    teamId: ID
    playerId: ID
  }

  input CreateMatchInput {
    team1Id: ID!
    team2Id: ID!
    date: DateTime!
    event: String!
    map: String
    format: String!
  }

  input UpdateMatchInput {
    team1Id: ID
    team2Id: ID
    date: DateTime
    event: String
    map: String
    format: String
  }
`; 