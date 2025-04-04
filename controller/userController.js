const User = require('../models/User');
const joi = require('joi');
const ResponseService = require('../services/ResponseService');
const ConstantService = require('../services/ConstantService');
const CloudinaryService = require('../services/CloudinaryService');
const sha256 = require("js-sha256");
const JwtService = require('../services/JwtService');
const QuickSave = require('../models/QuickSaves');

module.exports = {

    /**
     * Get user details by id
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    getUserDetails: async (req, res) => {
        try {
            const userId = req.sessionData.id;
            const user = await User.findById(userId);
            if (!user) {
                return ResponseService.json(res, ConstantService.responseCode.NOT_FOUND, ConstantService.responseMessage.USER_NOT_FOUND);
            }
            user.password = undefined;
            return ResponseService.json(res, ConstantService.responseCode.SUCCESS, ConstantService.responseMessage.USER_DETAILS_SUCCESS, user);
        } catch (error) {
            console.log(error);
            ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, ConstantService.responseMessage.USER_DETAILS_ERROR);
        }
    },

    /**
     * Get list of users
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    getUsersList: async (req, res) => {
        try {
            const request = {
                page: req.query.page || 0,
                limit: req.query.limit || 10,
            };

            const schema = joi.object({
                page: joi.number().required(),
                limit: joi.number().required(),
            });
            const {error, value} = schema.validate(request);
            if (error) {
                return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
                    message: error.message
                });
            }

            const users = await User.find({}, {password: 0})
                .skip(request.skip)
                .limit(request.limit);

            const total = await User.countDocuments();

            return ResponseService.json(res, ConstantService.responseCode.SUCCESS, ConstantService.responseMessage.USER_LIST_SUCCESS, {
                users,
                total
            });

        } catch (e) {
            console.log(e);
            ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, ConstantService.responseMessage.USER_LIST_ERROR);
        }

    },

    /**
     * Get list of public users
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    getPublicUserList: async (req, res) => {
        try {
            const request = {
                page: req.query.page || 1,
                limit: req.query.limit || 10,
            };

            const schema = joi.object({
                page: joi.number().required(),
                limit: joi.number().required(),
            });
            const {error, value} = schema.validate(request);

            if (error) {
                return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
                    message: error.message
                });
            }

            const users = await User.find({
                    visiblity: ConstantService.visibility[0],
                    role: ConstantService.roles[0]
                },
                {password: 0})
                .skip(request.skip)
                .limit(request.limit);

            const total = await User.countDocuments({
                visiblity: ConstantService.visibility[0],
                role: ConstantService.roles[0]
            });

            return ResponseService.json(res, ConstantService.responseCode.SUCCESS, ConstantService.responseMessage.USER_PUBLIC_LIST_SUCCESS, {
                users,
                total
            });

        } catch (e) {
            console.log(e);
            ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, ConstantService.responseMessage.USER_PUBLIC_LIST_ERROR);
        }
    },

    /**
     * Update user profile
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    updateUserProfile: async (req, res) => {
        try {
            console.log(req.sessionData);

            const request = {
                name: req.body.name,
                email: req.body.email,
                visiblity: req.body.visiblity,
                image: req.body.image,
                password: req.body.password,
                bio: req.body.bio,
                userId: req.sessionData.id,
                role: req.body.role,
            };
            const schema = joi.object({
                name: joi.string().allow(''),
                email: joi.string().email().allow(''),
                visiblity: joi.string().allow(''),
                image: joi.string().allow(''),
                password: joi.string().allow(''),
                bio: joi.string().allow(''),
                userId: joi.string().required(),
                role: joi.string().valid(ConstantService.roles[0], ConstantService.roles[1]).allow('')
            });

            const {error, value} = schema.validate(request);
            if (error) {
                return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
                    message: error.message
                });
            }

            const user = await User.findById(request.userId);
            if (!user) {
                return ResponseService.json(res, ConstantService.responseCode.BAD_REQUEST, ConstantService.responseMessage.USER_NOT_FOUND);
            }

            const update = {
                firstName: request.name || user.firstName,
                displayName: request.name || user.displayName,
                emailId: request.email || user.emailId,
                visiblity: request.visiblity || user.visiblity,
                image: request.image || user.image,
                password: request.password ? sha256(request.password + process.env.SALT) : user.password,
                bio: request.bio || user.bio,
                role: request.role || user.role,
            };
            const updatedUser = await User.findByIdAndUpdate(request.userId, update, {new: true});
            updatedUser.password = undefined;
            // Send new token
            const token = await JwtService.issueToken(updatedUser);


            return ResponseService.json(res, ConstantService.responseCode.SUCCESS, ConstantService.responseMessage.USER_UPDATE_SUCCESS, {
                user: updatedUser,
                token,
            });
        } catch (error) {
            return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, ConstantService.responseMessage.USER_UPDATE_ERROR);

        }
    },

    /**
     * Upload asset
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    uploadAsset: async (req, res) => {
        try {
            if (!req.files || !req.files.file) {
                return ResponseService.json(res, ConstantService.responseCode.BAD_REQUEST, "File not found.");
            }
            const result = await CloudinaryService.upload(req.files.file)
            return ResponseService.json(res, ConstantService.responseCode.SUCCESS, ConstantService.responseMessage.ASSET_UPLOAD_SUCCESS, {
                url: result.url,
                format: result.format,
            });

        } catch (e) {
            console.log(e);
            return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, ConstantService.responseMessage.ASSET_UPLOAD_ERROR);
        }

    },

    /**
     * Access token login user
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    accessTokenLogin: async (req, res) => {
        try {
            const userId = req.sessionData.id;
            const user = await User.findById(userId);
            if (!user) {
                return ResponseService.json(res, ConstantService.responseCode.NOT_FOUND, ConstantService.responseMessage.USER_NOT_FOUND);
            }
            user.password = undefined;
            return ResponseService.json(res, ConstantService.responseCode.SUCCESS, ConstantService.responseMessage.ACCESS_TOKEN_LOGIN_SUCCESS, user);
        } catch (error) {
            console.log(error);
            ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, ConstantService.responseMessage.ACCESS_TOKEN_LOGIN_ERROR);
        }
    },

    /**
     * Register user by email
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    registerUser: async (req, res) => {
        try {
            const request = {
                name: req.body.name,
                emailId: req.body.email,
                password: req.body.password,
            };
            const schema = joi.object({
                name: joi.string().required(),
                emailId: joi.string().email().required(),
                password: joi.string().required(),
            });

            const {error, value} = schema.validate(request);

            if (error) {
                return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
                    message: error.message
                });
            }

            const user = await User.findOne({emailId: request.emailId});

            if (user) {
                ResponseService.json(res, ConstantService.responseCode.BAD_REQUEST, ConstantService.responseMessage.USER_ALREADY_EXIST);
            }

            request.password = sha256(request.password + process.env.SALT);
            const newUser = new User({
                displayName: request.name,
                emailId: request.emailId,
                password: request.password,
                firstName: request.name,

            });
            await newUser.save();

            const token = await JwtService.issueToken(newUser);
            return ResponseService.json(res, ConstantService.responseCode.SUCCESS, ConstantService.responseMessage.USER_REGISTER_SUCCESS, {
                user: newUser,
                token,
            });

        } catch (error) {
            console.log(error);
            ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, ConstantService.responseMessage.USER_REGISTER_ERROR);
        }

    },

    /**
     * Login user by email
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    loginUser: async (req, res) => {
        try {
            const request = {
                emailId: req.body.email,
                password: req.body.password,
            };
            const schema = joi.object({
                emailId: joi.string().email().required(),
                password: joi.string().required(),
            });
            const {error, value} = schema.validate(request);

            if (error) {
                return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
                    message: error.message
                });
            }
            const user = await User.findOne({
                emailId: request.emailId,
                password: sha256(request.password + process.env.SALT),

            });

            if (!user) {
                return ResponseService.json(res, ConstantService.responseCode.BAD_REQUEST, ConstantService.responseMessage.INVALIAD_CREDENTIALS);
            }
            user.password = undefined;
            const token = await JwtService.issueToken(user);

            return ResponseService.json(res, ConstantService.responseCode.SUCCESS, ConstantService.responseMessage.USER_LOGIN_SUCCESS, {
                user,
                token,
            });
        } catch (error) {
            console.log(error);
            ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, ConstantService.responseMessage.USER_LOGIN_ERROR);
        }
    },

    /**
     *  Add To Quick Save
     * @param req
     * @param res
     * @returns {Promise<*>}
     */

    addToQuickSave: async (req, res) => {
        try {
            const request = {
                userId: req.sessionData.id,
                content: req.body.content,
            };
            const schema = joi.object({
                userId: joi.string().required(),
                content: joi.object().required(),
            });

            const {error, value} = schema.validate(request);

            if (error) {
                return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
                    message: error.message
                });
            }

            const quickSave = new QuickSave({
                userId: request.userId,
                content: request.content,
            });
            await quickSave.save();

            return ResponseService.json(res, ConstantService.responseCode.SUCCESS, ConstantService.responseMessage.QUICK_SAVE_SUCCESS, quickSave);

        } catch (error) {
            console.log(error);
            ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, ConstantService.responseMessage.QUICK_SAVE_ERROR);
        }
    },


    /**
     * Get Quick Saves with search, sort, and pagination
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    getQuickSaves: async (req, res) => {
        try {
            const userId = req.sessionData.id;

            // Pagination parameters
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            // Search parameter
            const search = req.query.search || '';

            // Sorting parameters
            const sortBy = req.query.sortBy || 'createdAt';
            const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

            // Validate parameters
            const schema = joi.object({
                userId: joi.string().required(),
                page: joi.number().min(1),
                limit: joi.number().min(1).max(100),
                search: joi.string().allow(''),
                sortBy: joi.string().valid('createdAt', 'updatedAt'),
                sortOrder: joi.number().valid(1, -1)
            });

            const { error } = schema.validate({
                userId,
                page,
                limit,
                search,
                sortBy,
                sortOrder
            });

            if (error) {
                return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
                    message: error.message
                });
            }

            // Build query
            let query = { userId };

            // Add search functionality if search parameter is provided
            if (search) {
                // Using $regex to search in content fields that are strings
                // Note: This is a simplified approach as content is a JSON object
                // For more complex searching within JSON objects, you might need to use $where or other techniques
                query.$or = [
                    { 'content.title': { $regex: search, $options: 'i' } },
                    { 'content.description': { $regex: search, $options: 'i' } }
                ];
            }

            // Create sort object
            const sort = {};
            sort[sortBy] = sortOrder;

            // Query with pagination
            const options = {
                page,
                limit,
                sort,
                lean: true
            };

            const quickSaves = await QuickSave.paginate(query, options);

            return ResponseService.json(res,
                ConstantService.responseCode.SUCCESS,
                ConstantService.responseMessage.QUICK_SAVE_RETRIEVED,
                quickSaves
            );

        } catch (error) {
            console.log(error);
            return ResponseService.json(res,
                ConstantService.responseCode.INTERNAL_SERVER_ERROR,
                ConstantService.responseMessage.QUICK_SAVE_ERROR
            );
        }
    },


    /**
     * Remove Quick Save
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    removeQuickSave: async (req, res) => {
        try {
            const request = {
                userId: req.sessionData.id,
                saveId: req.params.id
            };
            const schema = joi.object({
                userId: joi.string().required(),
                saveId: joi.string().required()
            });

            const {error, value} = schema.validate(request);

            if (error) {
                return ResponseService.jsonResponse(res, ConstantService.responseCode.BAD_REQUEST, {
                    message: error.message
                });
            }

            // Find and remove the quick save
            const result = await QuickSave.findOneAndDelete({
                _id: request.saveId,
                userId: request.userId
            });

            if (!result) {
                return ResponseService.json(res, ConstantService.responseCode.NOT_FOUND, ConstantService.responseMessage.QUICK_SAVE_NOT_FOUND);
            }

            return ResponseService.json(res, ConstantService.responseCode.SUCCESS, ConstantService.responseMessage.QUICK_SAVE_REMOVED);

        } catch (error) {
            console.log(error);
            return ResponseService.json(res, ConstantService.responseCode.INTERNAL_SERVER_ERROR, ConstantService.responseMessage.QUICK_SAVE_ERROR);
        }
    },
}