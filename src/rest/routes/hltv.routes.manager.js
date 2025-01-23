import express from 'express';
import data from '../../data/hltv.json' assert { type: "json" };

class HLTVRoutesManager {
    constructor() {
        this.router = express.Router();
        this.resources = ['teams', 'matches', 'news', 'statistics', 'rankings'];
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.use((req, res, next) => {
            res.setHeader('X-API-Version', '1.0.0');
            res.setHeader('X-Response-Time', Date.now());
            res.setHeader('Cache-Control', 'no-cache');
            next();
        });

        this.resources.forEach(resource => {
            this.setupResourceRoutes(resource);
        });

        this.router.use(this.errorHandler);
    }

    setupResourceRoutes(resource) {
        this.router.get(`/${resource}`, this.handleRequest('GET', resource));
        this.router.get(`/${resource}/:id`, this.handleRequest('GET_ONE', resource));
        this.router.post(`/${resource}`, this.handleRequest('POST', resource));
        this.router.put(`/${resource}/:id`, this.handleRequest('PUT', resource));
        this.router.delete(`/${resource}/:id`, this.handleRequest('DELETE', resource));
    }

    handleRequest(method, resource) {
        return (req, res) => {
            try {
                switch (method) {
                    case 'GET':
                        const items = data[resource];
                        res.setHeader('X-Total-Count', items.length);
                        res.setHeader('ETag', `W/"${Date.now()}"`);
                        return res.json({
                            data: items,
                            _links: {
                                self: { href: `/api/${resource}` }
                            }
                        });

                    case 'GET_ONE':
                        const item = data[resource].find(i => i.id === parseInt(req.params.id));
                        if (!item) {
                            return this.sendError(res, 404, `${resource} not found`, resource);
                        }
                        return res.json({
                            ...item,
                            _links: {
                                self: { href: `/api/${resource}/${item.id}` },
                                collection: { href: `/api/${resource}` }
                            }
                        });

                    case 'POST':
                        if (!req.body || Object.keys(req.body).length === 0) {
                            return this.sendError(res, 400, 'Request body is required', resource);
                        }
                        const newItem = {
                            id: data[resource].length + 1,
                            ...req.body,
                            createdAt: new Date().toISOString()
                        };
                        return res.status(201)
                            .setHeader('Location', `/api/${resource}/${newItem.id}`)
                            .json({
                                ...newItem,
                                _links: {
                                    self: { href: `/api/${resource}/${newItem.id}` }
                                }
                            });

                    case 'PUT':
                        const existingItem = data[resource].find(i => i.id === parseInt(req.params.id));
                        if (!existingItem) {
                            return this.sendError(res, 404, `${resource} not found`, resource);
                        }
                        const updatedItem = {
                            ...existingItem,
                            ...req.body,
                            updatedAt: new Date().toISOString()
                        };
                        return res.json({
                            ...updatedItem,
                            _links: {
                                self: { href: `/api/${resource}/${existingItem.id}` }
                            }
                        });

                    case 'DELETE':
                        const itemToDelete = data[resource].find(i => i.id === parseInt(req.params.id));
                        if (!itemToDelete) {
                            return this.sendError(res, 404, `${resource} not found`, resource);
                        }

                        const index = data[resource].indexOf(itemToDelete);
                        if (index > -1) {
                            data[resource].splice(index, 1);
                        }

                        res.setHeader('X-Resource-Deleted', `${resource}/${req.params.id}`);
                        return res.status(204).send();

                    default:
                        return this.sendError(res, 405, 'Method not allowed', resource);
                }
            } catch (error) {
                return this.errorHandler(error, req, res);
            }
        };
    }

    sendError(res, status, message, resource) {
        return res.status(status).json({
            error: message,
            _links: {
                collection: { href: `/api/${resource}` }
            }
        });
    }

    errorHandler(err, req, res, next) {
        console.error(err.stack);
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
            _links: {
                self: { href: req.originalUrl },
                home: { href: '/api' }
            }
        });
    }

    getRouter() {
        return this.router;
    }
}

export default new HLTVRoutesManager().getRouter(); 