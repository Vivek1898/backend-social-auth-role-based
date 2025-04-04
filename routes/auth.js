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
    (req, res, next) => {
        // The state parameter will be automatically passed to the callback
        passport.authenticate("google", {
            scope: ["profile", "email"],
            state: req.query.state || btoa(process.env.CLIENT_URL),
        })(req, res, next);
    }
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
    (req, res, next) => {
        passport.authenticate('google', { session: false }, async (err, user) => {
            if (err) {
                return res.redirect(`${process.env.CLIENT_URL}/auth/error`);
            }

            if (!user) {
                return res.redirect(`${process.env.CLIENT_URL}/auth/error`);
            }

            const token = await JwtService.issueToken(user);

            // Retrieve and decode the state parameter (contains the redirect host)
            let redirectHost;
            try {
                redirectHost = atob(req.query.state) || process.env.CLIENT_URL;
            } catch (e) {
                redirectHost = process.env.CLIENT_URL;
            }

            res.cookie('token', token, { httpOnly: true });
            res.status(200).redirect(`${redirectHost}/auth/callback?token=${token}`);
        })(req, res, next);
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

/**
 * @swagger
 * /auth/telegram/callback:
 *   get:
 *     summary: Telegram authentication callback
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect after telegram authentication
 */
router.get("/telegram/callback",
passport.authenticate("telegram"),
async (req, res) => {
   const token = await JwtService.issueToken(req.user)
       res.cookie('token', token, {httpOnly: true})
       res.status(200).redirect(`${process.env.CLIENT_URL}/home?token=${token}`);
 }
);


module.exports = router;
