export const statisticsResolver = {
    Query: {
        statistics: (_, { filter, sort, pagination }, { dataSources }) => {
            return dataSources.statisticsAPI.getAllStatistics();
        },
        statistic: (_, { id }, { dataSources }) => {
            return dataSources.statisticsAPI.getStatisticById(id);
        }
    },
    Mutation: {
        createStatistic: (_, { input }, { dataSources }) => {
            const newStatistic = {
                id: dataSources.statisticsAPI.statistics.length + 1,
                ...input
            };
            dataSources.statisticsAPI.statistics.push(newStatistic);
            return newStatistic;
        },
        updateStatistic: (_, { id, input }, { dataSources }) => {
            const index = dataSources.statisticsAPI.statistics.findIndex(s => s.id === id);
            if (index === -1) throw new Error('Statistic not found');
            const updatedStatistic = {
                ...dataSources.statisticsAPI.statistics[index],
                ...input
            };
            dataSources.statisticsAPI.statistics[index] = updatedStatistic;
            return updatedStatistic;
        },
        deleteStatistic: (_, { id }, { dataSources }) => {
            const index = dataSources.statisticsAPI.statistics.findIndex(s => s.id === id);
            if (index === -1) throw new Error('Statistic not found');
            dataSources.statisticsAPI.statistics.splice(index, 1);
            return true;
        }
    }
}; 