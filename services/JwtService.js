const jwt = require("jsonwebtoken");
module.exports = {
    /**
     * Verify the token
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    verifyToken: async (req, res, next) => {
        try {
            if (!req.headers.authorization) {
                return ResponseService.json(res,ConstantService.responseCode.UNAUTHORIZED, ConstantService.responseMessage.ERR_UNAUTHORIZED)
            }
            console.log(req.headers.authorization);
            const token = req.headers.authorization.split(" ")[1];
            const session = await jwt.verify(token, process.env.JWT_SECRET);
            req.sessionData = session;
            next();
        } catch (err) {
            return ResponseService.json(res,ConstantService.responseCode.UNAUTHORIZED, ConstantService.responseMessage.ERR_UNAUTHORIZED)
        }
    },
    /**
     * Issue a new JWT token
     * @param data
     * @returns {Promise<string>}
     */
    issueToken: async (data) => {
        const payload = {
            id: data.id,
            email: data.emailId,
            role: data.role,
        };
        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRY
        });
    }


}