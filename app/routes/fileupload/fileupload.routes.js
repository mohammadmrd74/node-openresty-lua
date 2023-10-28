const { authJwt } = require("../../middleware");
const controller = require("../../controllers/file.controller");


module.exports =  function(app) {
    app.post("/api/upload", [authJwt.verifyToken], controller.upload);
    app.get("/api/files", [authJwt.verifyToken], controller.getListFiles);
    app.get("/minify/:username/:name", controller.minifyFiles);
    app.post("/api/image/webp", [authJwt.verifyToken], controller.imageWebp);
};