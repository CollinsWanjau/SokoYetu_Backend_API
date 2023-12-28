const multer = require('multer')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')
/**
 * multerStorage is a configuration object for multer's diskStorage engine.
 * It defines how to store the files that are uploaded via multer.
 *
 * @type {multer.StorageEngine}
 * 
 * @property {Function} destination - A function to control where the uploaded files should be stored.
 * This function has three parameters: req (the request object), file (the file being uploaded), and cb (a callback).
 * The callback should be called with the final destination path as the second argument. In this case, the destination is set to the 'public/images' directory.
 * 
 * @property {Function} filename - A function to control what the uploaded files should be named.
 * This function also has three parameters: req, file, and cb.
 * The callback should be called with the final filename as the second argument. In this case, the filename is set to the field name from the form that was used to upload the file, followed by a unique suffix (a combination of the current timestamp and a random number), and a '.jpeg' extension.
 * This ensures that each uploaded file has a unique name and won't overwrite any existing files.
 */
const multerStorage = multer.diskStorage({
    destination: function (req, res, cb) {
        // const folder = req.files.length > 0 && req.files[0].fieldname === 'images' ? 'products' : 'blogs';
        // const folder = req.body.fieldname === 'images' ? 'products' : 'blogs';
        // console.log('Fieldname:', req.body.fieldname);
        // console.log('Folder:', folder);
        // cb(null, path.join(__dirname, `../public/images/${folder}`));
        cb(null, path.join(__dirname, '../public/images'))
    },
    filename: function (req, file, cb) {
        // By appending this unique suffix to each file name, you can ensure that
        // each uploaded file has a unique name and won't overwrite any existing files.
        const uniquesuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, file.fieldname + '-' + uniquesuffix + ".jpeg")
    }
})

const multerFileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb({
            message:'Unsupported file format'
        }, false)
    }
}

const uploadPhoto = multer({
    storage: multerStorage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: multerFileFilter
})

/**
 * productImgResize is an asynchronous middleware function for Express.js applications.
 * It is used to resize product images uploaded by the user.
 *
 * @async
 * @function
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function in the stack.
 * 
 * @returns {Promise} - A Promise that resolves when all files have been processed.
 *
 * @throws {Error} - If there is an error in processing the files.
 *
 */
const productImgResize = async (req, res, next) => {
    // console.log('Request Body:', req.body);
    if (!req.files) return next()

    // waits for all files in the req.files to be processed
    // This is done because req.files is an array and each file needs
    // to be processed individually.
    await Promise.all(
        // 
        req.files.map(async (file) => {
            // const destinationFolder = 'public/images/products';

            // Check if the file has a specific field indicating its content type
            // if (req.body.contentType === 'blog') {
            //     destinationFolder = 'blogs';
            // }
            await sharp(file.path)
                .resize(300, 300)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/images/products/${file.filename}`)
            fs.unlinkSync(`public/images/products/${file.filename}`)
                // .toFile(path.join(__dirname, `../${destinationFolder}/${file.filename}`));
        })
    )
    next()
}

const blogImgResize = async (req, res, next) => {
    console.log('Request Body:', req.body);
    if (!req.files) return next()
    await Promise.all(
        req.files.map(async (file) => {
            // const destinationFolder = 'public/images/blogs';

            // // Check if the file has a specific field indicating its content type
            // if (req.body.contentType === 'product') {
            //     destinationFolder = 'products';
            // }
            await sharp(file.path)
                .resize(300, 300)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/images/blogs/${file.filename}`)
            fs.unlinkSync(`public/images/blogs/${file.filename}`)
                // .toFile(path.join(__dirname, `../${destinationFolder}/${file.filename}`));
        })
    )
    next()
}

module.exports = { uploadPhoto, productImgResize, blogImgResize}