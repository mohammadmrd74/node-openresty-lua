const db = require("../models");
const User = db.user;
const config = require("../config/auth.config");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signUp = (req, res) => {
  // Save User to Database
  User.create({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8)
    })
    .then(user => {
      res.send({
        message: "User registered successfully!"
      });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message
      });
    });
};

exports.signIn = (req, res) => {
  User.findOne({
      where: {
        username: req.body.username
      }
    })
    .then(user => {
      if (!user) {
        return res.status(404).send({
          message: "User Not found."
        });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      const token = jwt.sign({
          username: user.username,
          id: user.id
        },
        config.secret, {
          algorithm: 'HS256',
          allowInsecureKeySizes: true,
          expiresIn: 86400, // 24 hours
        });

      res.status(200).send({
        id: user.id,
        username: user.username,
        email: user.email,
        accessToken: token
      });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message
      });
    });
};