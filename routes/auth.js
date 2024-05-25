const express = require("express");
const router = express.Router();
const passport = require("passport");
const JwtService = require("../services/JwtService");
const {loginUser, registerUser} = require("../controller/userController");

router.get(
    "/google",
    passport.authenticate("google", {scope: ["profile", "email"]})
);

router.get(
    "/google/callback",
    passport.authenticate('google', {session: false}), async (req, res) => {
        const token = await JwtService.issueToken(req.user)
        res.cookie('token', token, {httpOnly: true})
        res.status(200).redirect(`${process.env.CLIENT_URL}/home?token=${token}`);
    }
);

router.get(
    "/github",
    passport.authenticate("github", {scope: ["profile", "user:email"]})
);

router.get(
    "/github/callback",
    passport.authenticate("github", {session: false}), async (req, res) => {
        const token = await JwtService.issueToken(req.user)
        res.cookie('token', token, {httpOnly: true})
        res.status(200).redirect(`${process.env.CLIENT_URL}/home?token=${token}`);
    }
);


router.post("/register", registerUser);
router.post("/login", loginUser);
module.exports = router;
