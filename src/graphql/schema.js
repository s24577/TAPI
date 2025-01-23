import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar DateTime

  ${StringFilterInput}
  ${NumberFilterInput}
  ${DateFilterInput}

  type Team {
    id: ID!
    name: String!
    rank: Int
    country: String!
    players: [Player!]!
  }

  type Player {
    id: ID!
    nickname: String!
    fullName: String!
    country: String!
    age: Int!
    rating: Float!
    team: Team
    statistics: PlayerStatistics
  }

  type Match {
    id: ID!
    team1: Team!
    team2: Team!
    date: DateTime!
    event: String!
    map: String
    status: MatchStatus!
    format: String!
    score: Score
    maps: [MapScore!]
  }

  type News {
    id: ID!
    title: String!
    date: DateTime!
    author: Author!
    content: String!
    categories: [String!]!
    tags: [String!]!
    comments: [Comment!]!
  }

  type Statistics {
    players: PlayerStatistics!
  }

  type PlayerStatistics {
    rating2: Float!
    maps: Int!
    kdRatio: Float!
    impact: Impact!
  }

  input TeamInput {
    name: String!
    country: String!
    players: [PlayerInput!]!
  }

  input PlayerInput {
    nickname: String!
    fullName: String!
    country: String!
    age: Int!
    rating: Float!
  }

  input MatchInput {
    team1Id: ID!
    team2Id: ID!
    event: String!
    date: DateTime!
    map: String
    format: String!
  }

  input NewsInput {
    title: String!
    content: String!
    authorId: ID!
    categories: [String!]!
    tags: [String!]!
  }

  type Query {
    teams(
      filter: TeamFilterInput
      sort: TeamSortInput
      pagination: PaginationInput
    ): [Team!]!
    
    team(id: ID!): Team

    matches(
      filter: MatchFilterInput
      sort: MatchSortInput
      pagination: PaginationInput
    ): [Match!]!
    
    match(id: ID!): Match

    news(
      filter: NewsFilterInput
      sort: NewsSortInput
      pagination: PaginationInput
    ): [News!]!
    
    newsItem(id: ID!): News

    statistics: Statistics!
  }

  type Mutation {
    createTeam(input: TeamInput!): Team!
    updateTeam(id: ID!, input: TeamInput!): Team!
    deleteTeam(id: ID!): Boolean!

    createMatch(input: MatchInput!): Match!
    updateMatch(id: ID!, input: MatchInput!): Match!
    deleteMatch(id: ID!): Boolean!

    createNews(input: NewsInput!): News!
    updateNews(id: ID!, input: NewsInput!): News!
    deleteNews(id: ID!): Boolean!
  }
`; 