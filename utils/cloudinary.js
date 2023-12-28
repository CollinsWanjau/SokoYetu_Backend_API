const cloudinary = require('cloudinary').v2
// Configure Cloudinary with your cloud name and API credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.SECRET_KEY
})

/**
 * Uploads a file to Cloudinary.
 *
 * @param {string} fileToUploads - The path of the file to be uploaded.
 * @returns {Promise} A promise that resolves with the URL of the uploaded file.
 */
// const cloudinaryUploadImg = async (fileToUploads) => {
//     return new Promise((resolve, reject) => {
//         cloudinary.uploader.upload(fileToUploads, (result) => {
//                 resolve({
//                     url: result.secure_url,
//                 },
//                 {
//                     resource_type: "auto"
//                 })
            
//         })
//     })
// }
const cloudinaryUploadImg = (fileToUpload) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(fileToUpload, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve({
                    url: result.secure_url
                });
            }
        });
    });
};

module.exports = cloudinaryUploadImg