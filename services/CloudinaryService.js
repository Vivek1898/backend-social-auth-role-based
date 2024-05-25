const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = {
    /**
     * Upload file to cloudinary
     * @param uploadFile
     * @returns {Promise<UploadApiResponse>}
     */
    upload: async (uploadFile) => {

        return await cloudinary.uploader.upload(uploadFile.tempFilePath, {
            public_id: uploadFile.name,
            resource_type: "auto",
            folder: "uploaded",
            use_filename: true,
            unique_filename: false,
        });
    },

}