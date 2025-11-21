const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'vendoideias-secret-key-2025';

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        return res.status(401).json({ error: 'Token error' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({ error: 'Token malformatted' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token invalid' });
        }

        req.userId = decoded.userId;
        req.userRole = decoded.role;
        return next();
    });
}

module.exports = authMiddleware;
