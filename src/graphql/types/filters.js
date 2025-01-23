export const StringFilterInput = `
  input StringFilterInput {
    eq: String
    contains: String
    notEq: String
    notContains: String
  }
`;

export const NumberFilterInput = `
  input NumberFilterInput {
    eq: Float
    gt: Float
    lt: Float
    gte: Float
    lte: Float
  }
`;

export const DateFilterInput = `
  input DateFilterInput {
    eq: DateTime
    gt: DateTime
    lt: DateTime
    gte: DateTime
    lte: DateTime
  }
`; 