const {
  uploadFileMiddleware,
  uploadWebPMiddleware
} = require("../middleware/upload");
const fs = require("fs");
const path = require("path");
const process = require('process')
const sharp = require('sharp');
const db = require("../models");
const Memory = db.memory;

// I used uglify js to compress js and clean-css to compress css
const UglifyJS = require('uglify-js');
const CleanCSS = require('clean-css');

//clear memory db
// Memory.destroy({ truncate : true, cascade: false })


const {
  dirname
} = require('path');
const appDir = dirname(require.main.filename);

const minifyObject = {
  js: (file) => {
    const out = UglifyJS.minify(file);
    return out.code;
  },
  css: function (file) {
    const out = new CleanCSS().minify(file);
    return out.styles
  }
}

const upload = async (req, res) => {
  try {
    await uploadFileMiddleware(req, res);

    if (req.file == undefined) {
      return res.status(400).send({
        message: "Please upload a file!"
      });
    }

    res.status(200).send({
      message: "Uploaded the file successfully: " + req.file.originalname,
    });
  } catch (err) {
    console.log(err);

    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send({
        message: "File size cannot be larger than 2MB!",
      });
    }

    res.status(500).send({
      message: `Could not upload the file: ${req.file.originalname}. ${err}`,
    });
  }
};


const getListFiles = (req, res) => {
  const directoryPath = `${appDir}/opt/${req.username}`;

  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      res.status(500).send({
        message: "Unable to scan files!",
      });
    }

    let fileInfos = [];
    const baseUrl = `http://localhost:8080/files/${req.username}/`;
    const minifyUrl = `http://localhost:8080/minify/${req.username}/`;

    Memory.findAll({
        where: {
          username: req.username,
          memoryUsed: {
            [db.Op.not]: "",
          },
          timeSpent: {
            [db.Op.not]: "",
          }
        }
      })
      .then(memoryFiles => {
        const fileMeasurements = memoryFiles.map((f) => f.dataValues);
        files.forEach((file) => {
          const stats = fs.statSync(`${directoryPath}/${file}`)

          //find size, creation time and type of file
          const fileSizeInBytes = stats.size;
          const creationTime = stats.birthtime;
          const fileExtension = path.extname(`${directoryPath}/${file}`);

          //find time consumed
          const fileMeasurement = fileMeasurements.find((fm) => fm.filename === `${directoryPath}/${file}`);

          let fileMemoryMeasurement = "not measured yet!";
          let fileTimeSpent = "not measured yet!";
          if (fileMeasurement) {
            fileMemoryMeasurement = fileMeasurement.memoryUsed;
            fileTimeSpent = fileMeasurement.timeSpent;
          }


          fileInfos.push({
            name: file,
            url: baseUrl + file,
            size: `${fileSizeInBytes} bytes`,
            createdAt: creationTime,
            type: fileExtension.slice(1),
            minifyMemoryMeasurement: fileMemoryMeasurement,
            minifyTimeSpent: fileTimeSpent,
            minify: minifyUrl + file
          });
        });

        res.status(200).send(fileInfos);
      })


  });
};

const minifyFiles = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = `${appDir}/opt/${req.params.username}/`;

  var filetypes = /js|css/;
  const fileExtension = path.extname(directoryPath + fileName).slice(1);

  if (filetypes.test(fileExtension)) {
    const minified = minifyFile(directoryPath + fileName, req.params.username, fileExtension)
    res.setHeader('Content-Type', 'application/javascript');
    res.send(minified, fileName.split('.').slice(0, -1).join('.') + '.min' + fileExtension, (err) => {
      if (err) {
        res.status(500).send({
          message: "Could not download the file. " + err,
        });
      }
    });
  } else {
    res.status(406).end("extension not supported. Please send only js and css files.")
  }

};

const minifyFile = (file, username, type) => {
  const outFile = fs.readFileSync(file, 'utf8');

  //memory and time start measure
  const startTime = performance.now();
  const startMemory = process.memoryUsage().heapUsed;

  //minify base on type
  const minifiedCode = minifyObject[type](outFile)

  //memory and time end measure
  const endMemory = process.memoryUsage().heapUsed;
  const endTime = performance.now();

  saveToDataBase({
    username: username,
    filename: file,
    memoryUsed: `${Math.round(Math.abs(endMemory - startMemory) / 1024 * 100) / 100} KB`,
    timeSpent: `${endTime - startTime} ms`
  })

  return minifiedCode
}


const imageWebp = async (req, res) => {
  try {
    await uploadWebPMiddleware(req, res);
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
    // Convert the uploaded image to WebP format using Sharp
    const webpBuffer = await sharp(req.file.buffer).webp().toBuffer();
    res.setHeader('Content-Type', 'image/webp');
    res.send(webpBuffer);

  } catch (err) {
    console.log(err);

    res.status(500).send({
      message: `Could not upload the file: ${req.file.originalname}. ${err}`,
    });
  }
};

const saveToDataBase = (data) => {
  //save to database
  Memory.create(data)
    .then(() => {
      console.log("saved");
    })
    .catch(err => {
      console.log(err);
    });
}


module.exports = {
  upload,
  getListFiles,
  minifyFiles,
  imageWebp
};