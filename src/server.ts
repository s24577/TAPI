import express from "express";
import cors from "cors";
import { HLTVDataSource } from './graphql/datasources/HLTVDataSource.js';
import hltvRoutesManager from "./rest/routes/hltv.routes.manager.js";
import { ApolloServer } from 'apollo-server';
import { typeDefs } from './graphql/schema/types';
import { resolvers } from './graphql/resolvers';

const app = express();
const REST_PORT = 4000;
const GRAPHQL_PORT = 4001;  

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api', hltvRoutesManager);

app.get('/graphiql', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>GraphiQL</title>
            <style>
                body { height: 100vh; margin: 0; }
                #graphiql { height: 100vh; }
            </style>
            <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
            <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
            <link rel="stylesheet" href="https://unpkg.com/graphiql/graphiql.min.css" />
            <script src="https://unpkg.com/graphiql/graphiql.min.js"></script>
        </head>
        <body>
            <div id="graphiql"></div>
            <script>
                const fetcher = GraphiQL.createFetcher({
                    url: 'http://localhost:${GRAPHQL_PORT}/graphql',
                });
                ReactDOM.render(
                    React.createElement(GraphiQL, { fetcher }),
                    document.getElementById('graphiql')
                );
            </script>
        </body>
        </html>
    `);
});

const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({
        hltvAPI: new HLTVDataSource()
    }),
    formatError: (error) => {
        console.error('GraphQL Error:', error);
        return error;
    }
});

server.listen({ port: GRAPHQL_PORT }).then(({ url }) => {
    console.log(`🚀 GraphQL Server ready at ${url}`);
});

app.listen(REST_PORT, () => {
    console.log('=================================');
    console.log(`🚀 REST Server running on port ${REST_PORT}`);
    console.log(`📚 REST API: http://localhost:${REST_PORT}/api`);
    console.log(`🔍 GraphiQL: http://localhost:${REST_PORT}/graphiql`);
    console.log('=================================');
}); 