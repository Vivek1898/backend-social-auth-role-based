/*
* ConstantService js to store all constant values for this app
 */
module.exports = {
    responseCode: {
        SUCCESS: 200,
        BAD_REQUEST: 400,
        NOT_FOUND: 404,
        UNAUTHORIZED: 401,
        INTERNAL_SERVER_ERROR: 500,
        FORBIDDEN: 403,
    },
    roles:{
        0: "user",
        1: "admin",
    },
    visibility:{
        0: "public",
        1: "private",
    },
    responseMessage: {
        //Common
        VALIDATION_ERROR: "Validation Error , Please check the request",
        //User Constants
        USER_NOT_FOUND: "User does not exist",
        USER_DETAILS_SUCCESS: "User details fetched successfully",
        USER_DETAILS_ERROR: "Oops! Something went wrong in fetching user details",

        USER_LIST_SUCCESS: "User list fetched successfully",
        USER_LIST_ERROR: "Oops! Something went wrong in fetching user list",

        USER_PUBLIC_LIST_SUCCESS: "Public User list fetched successfully",
        USER_PUBLIC_LIST_ERROR: "Oops! Something went wrong in fetching public user list",

        USER_UPDATE_SUCCESS: "User details updated successfully",
        USER_UPDATE_ERROR: "Oops! Something went wrong in updating user details",

        ASSET_UPLOAD_SUCCESS: "Asset uploaded successfully",
        ASSET_UPLOAD_ERROR: "Oops! Something went wrong in uploading asset",

        ACCESS_TOKEN_LOGIN_SUCCESS: "Access token login success",
        ACCESS_TOKEN_LOGIN_ERROR: "Oops! Something went wrong in access token login",

        USER_ALREADY_EXIST: "User already exist",
        USER_REGISTER_SUCCESS: "User registered successfully",
        USER_REGISTER_ERROR: "Oops! Something went wrong in user registration",
        INVALIAD_CREDENTIALS: "Email or password is incorrect",
        USER_LOGIN_SUCCESS: "User logged in successfully",
        USER_LOGIN_ERROR: "Oops! Something went wrong in user login",

        ERR_FORBIDDEN: "You are not authorized to access this resource",
        ERR_UNAUTHORIZED: "Please login to access this resource",

    },
};
