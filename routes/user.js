const express = require("express");
const router = express.Router();
const { isAdmin, isAuth} = require("../middleware/auth");

const {
    getUserDetails,
    getUsersList,
    getPublicUserList,
    updateUserProfile,
    uploadAsset,
    accessTokenLogin
} = require("../controller/userController");



router.get("/details",isAuth, isAdmin , getUserDetails);
router.post("/admin-list",isAuth, isAdmin , getUsersList);
router.post("/public-list",isAuth, getPublicUserList);
router.put("/update",isAuth , updateUserProfile);
router.post("/upload",isAuth, uploadAsset);
router.post("/accessTokenLogin",isAuth, accessTokenLogin)


module.exports = router;