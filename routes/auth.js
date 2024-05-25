const express = require("express");
const router = express.Router();
const passport = require("passport");
const JwtService = require("../services/JwtService");
const {loginUser, registerUser} = require("../controller/userController");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user management
 */


/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Authenticate with Google
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to Google authentication
 */
router.get(
    "/google",
    passport.authenticate("google", {scope: ["profile", "email"]})
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google authentication callback
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect after Google authentication
 */

router.get(
    "/google/callback",
    passport.authenticate('google', {session: false}), async (req, res) => {
        const token = await JwtService.issueToken(req.user)
        res.cookie('token', token, {httpOnly: true})
        res.status(200).redirect(`${process.env.CLIENT_URL}/home?token=${token}`);
    }
);


/**
 * @swagger
 * /auth/github:
 *   get:
 *     summary: Authenticate with GitHub
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to GitHub authentication
 */

router.get(
    "/github",
    passport.authenticate("github", {scope: ["profile", "user:email"]})
);


/**
 * @swagger
 * /auth/github/callback:
 *   get:
 *     summary: GitHub authentication callback
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect after GitHub authentication
 */

router.get(
    "/github/callback",
    passport.authenticate("github", {session: false}), async (req, res) => {
        const token = await JwtService.issueToken(req.user)
        res.cookie('token', token, {httpOnly: true})
        res.status(200).redirect(`${process.env.CLIENT_URL}/home?token=${token}`);
    }
);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */


router.post("/register", registerUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/login", loginUser);
module.exports = router;
