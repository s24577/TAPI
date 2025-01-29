import data from '../../data/hltv.json' assert { type: "json" };

export const teamsResolver = {
    Query: {
        teams: async (_, { filter, sort, pagination }, { dataSources }) => {
            try {
                let result = await dataSources.hltvAPI.getAllTeams()

                if (filter) {
                    result = result.filter(team => {
                        let matches = true;
                        if (filter.name) {
                            const { eq, contains, notEq, notContains } = filter.name;
                            if (eq && team.name !== eq) matches = false;
                            if (contains && !team.name.includes(contains)) matches = false;
                            if (notEq && team.name === notEq) matches = false;
                            if (notContains && team.name.includes(notContains)) matches = false;
                        }
                        return matches;
                    });
                }

                if (sort) {
                    const { field, direction } = sort;
                    result.sort((a, b) => {
                        const multiplier = direction === 'DESC' ? -1 : 1;
                        return multiplier * (a[field] > b[field] ? 1 : -1);
                    });
                }

                if (pagination) {
                    const { page = 1, pageSize = 10 } = pagination;
                    const start = (page - 1) * pageSize;
                    result = result.slice(start, start + pageSize);
                }

                
                return result;
            } catch (error) {
                console.error('Error in teams resolver:', error);
                throw new Error('Failed to fetch teams');
            }
        },
        team: async (_, { id }, { dataSources }) => {
            try {
                return await dataSources.hltvAPI.getTeamById(parseInt(id));
            } catch (error) {
                console.error('Error fetching team:', error);
                throw new Error('Failed to fetch team');
            }
        }
    },
    Mutation: {
        createTeam: (_, { input }) => {
            const newTeam = {
                id: data.teams.length + 1,
                ...input
            };
            data.teams.push(newTeam);
            return newTeam;
        },
        updateTeam: (_, { id, input }) => {
            const team = data.teams.find(t => t.id === parseInt(id));
            if (!team) throw new Error('Team not found');
            Object.assign(team, input);
            return team;
        },
        deleteTeam: (_, { id }) => {
            const index = data.teams.findIndex(t => t.id === parseInt(id));
            if (index === -1) throw new Error('Team not found');
            data.teams.splice(index, 1);
            return true;
        }
    }
}; 