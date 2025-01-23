export const matchesResolver = {
    Query: {
        matches: (_, { filter, sort, pagination }, { dataSources }) => {
            return dataSources.hltvAPI.getAllMatches();
        },
        match: (_, { id }, { dataSources }) => {
            return dataSources.hltvAPI.getMatchById(id);
        }
    },
    Mutation: {
        createMatch: (_, { input }, { dataSources }) => {
            const newMatch = {
                id: dataSources.hltvAPI.matches.length + 1,
                ...input
            };
            dataSources.hltvAPI.matches.push(newMatch);
            return newMatch;
        },
        updateMatch: (_, { id, input }, { dataSources }) => {
            const index = dataSources.hltvAPI.matches.findIndex(m => m.id === id);
            if (index === -1) throw new Error('Match not found');
            const updatedMatch = {
                ...dataSources.hltvAPI.matches[index],
                ...input
            };
            dataSources.hltvAPI.matches[index] = updatedMatch;
            return updatedMatch;
        },
        deleteMatch: (_, { id }, { dataSources }) => {
            const index = dataSources.hltvAPI.matches.findIndex(m => m.id === id);
            if (index === -1) throw new Error('Match not found');
            dataSources.hltvAPI.matches.splice(index, 1);
            return true;
        }
    }
}; 