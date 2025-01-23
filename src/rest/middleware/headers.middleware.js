import { corsConfig } from '../../config/cors.config.js';

const env = process.env.NODE_ENV || 'development';
const config = corsConfig[env];

export const checkHeaders = (req, res, next) => {
    if ((req.method === 'POST' || req.method === 'PUT') && 
        !req.headers['content-type']?.includes('application/json')) {
        return res.status(415).json({
            error: 'Unsupported Media Type',
            message: 'Content-Type must be application/json',
            _links: {
                self: { href: req.originalUrl }
            }
        });
    }

    if (!req.headers.accept?.includes('application/json') && 
        !req.headers.accept?.includes('*/*')) {
        return res.status(406).json({
            error: 'Not Acceptable',
            message: 'Accept header must include application/json',
            _links: {
                self: { href: req.originalUrl }
            }
        });
    }

    res.setHeader('X-API-Version', '1.0.0');
    res.setHeader('X-Response-Time', Date.now());
    res.setHeader('X-Powered-By', 'HLTV API');

    next();
};

export const corsMiddleware = (req, res, next) => {
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:4000'];
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Total-Count');
    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count, X-Response-Time, ETag, Location');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

    if (req.method === 'OPTIONS') {
        return res.status(204).send();
    }

    next();
};
//hehe
export const errorHandler = (err, req, res) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        _links: {
            self: { href: req.originalUrl }
        }
    });
};

export const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource does not exist',
        _links: {
            home: { href: '/api' }
        }
    });
};

function setHeaders(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'https://your-allowed-origin.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    res.setHeader('X-Powered-By', 'YourAppName');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');

    next();
}

module.exports = setHeaders; 