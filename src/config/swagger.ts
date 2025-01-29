import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Express, Request, Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerPath = path.join(__dirname, '../docs/swagger/openapi.yaml');

export const setupSwagger = (app: Express) => {
    try {
        const swaggerDocument = YAML.load(swaggerPath);
        
        const options = {
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: "HLTV API Documentation"
        };

        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
        console.log('Swagger documentation initialized successfully');
    } catch (error) {
        console.error('Error initializing Swagger documentation:', error);
        app.get('/api-docs', (_: Request, res: Response) => {
            res.status(500).send('Error loading API documentation');
        });
    }
}; 