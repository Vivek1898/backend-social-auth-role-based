const User = require('../models/User');
const joi = require('joi');
const ResponseService = require('../services/ResponseService');
const ConstantService = require('../services/ConstantService');
const CloudinaryService = require('../services/CloudinaryService');
const sha256 = require("js-sha256");
const JwtService = require('../services/JwtService');

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
    }
}