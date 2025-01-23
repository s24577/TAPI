export const newsResolver = {
    Query: {
        news: (_, { filter, sort, pagination }, { dataSources }) => {
            return dataSources.newsAPI.getAllNews();
        },
        newsItem: (_, { id }, { dataSources }) => {
            return dataSources.newsAPI.getNewsById(id);
        }
    },
    Mutation: {
        createNews: (_, { input }, { dataSources }) => {
            const newNews = {
                id: dataSources.newsAPI.news.length + 1,
                ...input
            };
            dataSources.newsAPI.news.push(newNews);
            return newNews;
        },
        updateNews: (_, { id, input }, { dataSources }) => {
            const index = dataSources.newsAPI.news.findIndex(n => n.id === id);
            if (index === -1) throw new Error('News item not found');
            const updatedNews = {
                ...dataSources.newsAPI.news[index],
                ...input
            };
            dataSources.newsAPI.news[index] = updatedNews;
            return updatedNews;
        },
        deleteNews: (_, { id }, { dataSources }) => {
            const index = dataSources.newsAPI.news.findIndex(n => n.id === id);
            if (index === -1) throw new Error('News item not found');
            dataSources.newsAPI.news.splice(index, 1);
            return true;
        }
    }
}; 