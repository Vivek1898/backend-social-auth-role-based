const express = require("express");
const router = express.Router();
const { isAdmin, isAuth } = require("../middleware/auth");
const {
    getUserDetails,
    getUsersList,
    getPublicUserList,
    updateUserProfile,
    uploadAsset,
    accessTokenLogin
} = require("../controller/userController");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and operations
 */

/**
 * @swagger
 * /user/details:
 *   get:
 *     summary: Get user details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/details", isAuth, getUserDetails);

/**
 * @swagger
 * /user/admin-list:
 *   post:
 *     summary: Get list of users for admin
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users list retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/admin-list", isAuth, isAdmin, getUsersList);

/**
 * @swagger
 * /user/public-list:
 *   post:
 *     summary: Get public list of users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Public users list retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/public-list", isAuth, getPublicUserList);

/**
 * @swagger
 * /user/update:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               visibility:
 *                 type: string
 *                 description: User profile visibility
 *               image:
 *                 type: string
 *                 description: URL to the user's profile image
 *               password:
 *                 type: string
 *                 description: User's password
 *               bio:
 *                 type: string
 *                 description: User's biography
 *               role:
 *                  type: string
 *                  description: User's role
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.put("/update", isAuth, updateUserProfile);

/**
 * @swagger
 * /user/upload:
 *   post:
 *     summary: Upload user asset
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload
 *     responses:
 *       200:
 *         description: Asset uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: URL of the uploaded asset
 *                 format:
 *                   type: string
 *                   description: Format of the uploaded asset
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request, file not found
 *       500:
 *         description: Internal server error
 */
router.post("/upload", isAuth, uploadAsset);

/**
 * @swagger
 * /user/accessTokenLogin:
 *   post:
 *     summary: Login with access token
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 */
router.post("/accessTokenLogin", isAuth, accessTokenLogin);

module.exports = router;
