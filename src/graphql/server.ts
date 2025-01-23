import { createHandler } from 'graphql-http/lib/use/express';
import { schema } from './schema/index.js';
import { createContext } from './context.js';

export const graphqlHandler = createHandler({
    schema,
    context: async () => {
        const ctx = await createContext();
        return {
            ...ctx,
            [Symbol.iterator]: undefined 
        };
    }
}); 