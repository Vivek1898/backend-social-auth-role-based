const JwtService = require("../services/JwtService");
module.exports = {
  isAdmin: function (req, res, next) {
    console.log(req.sessionData);
    if (req.sessionData.role === "admin") {
      return next();
    } else {
     return ResponseService.json(res,ConstantService.responseCode.FORBIDDEN, ConstantService.responseMessage.ERR_FORBIDDEN)
    }
  },
  isAuth: function (req, res, next) {
    JwtService.verifyToken(req, res, next);

  },
};
