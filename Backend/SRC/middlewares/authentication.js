const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try{
        
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization Token missing' });
    }

    const token = authHeader.split(' ')[1];
    const secretKey = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
    }catch(error){
        //console.error('Error in authenticateToken middleware:', error);
        return res.status(500).json({ message: error.message });
    }
}