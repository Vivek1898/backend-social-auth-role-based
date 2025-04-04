const express = require("express");
const router = express.Router();
const { isAdmin, isAuth } = require("../middleware/auth");
const {
    getUserDetails,
    getUsersList,
    getPublicUserList,
    updateUserProfile,
    uploadAsset,
    accessTokenLogin,
    addToQuickSave,
    getQuickSaves
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



/**
 * @swagger
 * /user/add-to-quick-save:
 *   post:
 *     summary: Add content to quick save
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
 *               content:
 *                 type: object
 *                 description: Content to be saved
 *     responses:
 *       200:
 *         description: Content saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Quick save added successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 60d21b4667d0d8992e610c85
 *                     userId:
 *                       type: string
 *                       example: 60d21b4667d0d8992e610c84
 *                     content:
 *                       type: object
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/add-to-quick-save", isAuth, addToQuickSave);

/**
 * @swagger
 * /user/get-quick-saves:
 *   get:
 *     summary: Get user's quick saves with search, sort, and pagination
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term in content
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order (ascending or descending)
 *     responses:
 *       200:
 *         description: Quick saves retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Quick saves retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     docs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           userId:
 *                             type: string
 *                           content:
 *                             type: object
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     totalDocs:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pagingCounter:
 *                       type: integer
 *                     hasPrevPage:
 *                       type: boolean
 *                     hasNextPage:
 *                       type: boolean
 *                     prevPage:
 *                       type: integer
 *                       nullable: true
 *                     nextPage:
 *                       type: integer
 *                       nullable: true
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/get-quick-saves", isAuth, getQuickSaves);



module.exports = router;
