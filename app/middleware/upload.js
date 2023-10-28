const util = require("util");
const multer = require("multer");
const fs = require("fs");

// maximum file is 2mg
const maxSize = 2 * 1024 * 1024;

const {
    dirname
} = require('path');
const appDir = dirname(require.main.filename);

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const directory = `${appDir}/opt/${req.username}`

        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, {
                recursive: true
            })
        }

        cb(null, directory)
    },
    filename: (req, file, cb) => {

        //search and deletes all previous versions of the file
        fs.readdirSync(`${appDir}/opt/${req.username}`).forEach(dirFile => {
            const actualName = dirFile.split('-').slice(1).join('-');
            if (actualName === file.originalname)
                fs.unlinkSync(`${appDir}/opt/${req.username}/${dirFile}`);

        });

        //save the new version ( I put the version <date now> because it shows when the file created and it's unique)
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})

let uploadFile = multer({
    storage: storage,
    limits: {
        fileSize: maxSize
    },
}).single("file");

const storageWebP = multer.memoryStorage(); // Store the uploaded file in memory
const uploadWebP = multer({
    storage: storageWebP
}).single("file");

let uploadFileMiddleware = util.promisify(uploadFile);
let uploadWebPMiddleware = util.promisify(uploadWebP);
module.exports = {
    uploadFileMiddleware,
    uploadWebPMiddleware
};