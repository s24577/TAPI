import { HLTVDataSource } from './datasources/HLTVDataSource';

export interface Context {
    dataSources: {
        hltv: HLTVDataSource;
    };
}

export const createContext = (): Context => ({
    dataSources: {
        hltv: new HLTVDataSource()
    }
}); 