const User = require("../models/user");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const secretKey = process.env.TOKEN_SECRET;

/*
 View for register
*/
module.exports.register = function (req, res) {
  return res.render("register", {
    title: "Register",
  });
};

/*
 View for login
*/
module.exports.login = function (req, res) {
  return res.render("login", {
    title: "Login",
  });
};

/*
 controller for register
*/
module.exports.signOut = function (req, res) {
  res.cookie("jwt", "", { maxAge: "1" });
  res.redirect("/");
};

/*
This is the signIn function, which is an asynchronous function that handles user sign-in functionality. It takes the email and password from the request body, checks for their presence, and then attempts to find a user with the provided email. If a user is found, it generates a JWT token and sets it as a cookie in the response. Finally, it returns a JSON response with the user's ID, email, and token. If no user is found or the password is incorrect, appropriate error messages are returned.
*/
module.exports.signIn = async function (req, res) {
  let { email, password } = req.body;
  console.log(email, password);
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Bad Request" });
  }

  try {
    let existingUser;
    try {
      existingUser = await User.findOne({ email: email });
    } catch (e) {
      console.log("Error finding user - ", email);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }

    if (existingUser) {
      let token = jwt.sign(
        {
          userId: existingUser.id,
          email: existingUser.email,
        },
        secretKey,
        {
          expiresIn: "1h",
        }
      );
      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
      });
      console.log(res.cookie);
      return res.status(200).json({
        success: true,
        message: {
          userId: existingUser.id,
          email: existingUser.email,
          token: token,
        },
      });
    } else {
      if (existingUser && existingUser.password !== password) {
        return res.status(400).json({
          success: false,
          message: "Password mismatch",
        });
      }
      return res.status(404).json({
        success: false,
        message: "User not found, Plz sign up",
      });
    }
  } catch (err) {
    console.log("Error while signIn - ", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

/*
This is a function called "signUp" that handles the sign-up functionality for a user. It receives a request and response object as parameters. The function checks if the required fields (name, email, and password) are present in the request body. If any of these fields are missing, it returns a 400 Bad Request response. 

Next, the function tries to find an existing user with the given email using the User model. If an existing user is found, it returns a 200 response indicating that the user already exists.

If the user is not found, the function validates the email and password fields using a separate function called "validateFields". If any validation error occurs, it returns a 400 response with the error message.

If the fields are valid, a new User object is created with the provided name, email, and password. The user data is then saved to the database. If an error occurs during the saving process, a 403 response is returned.

After successfully saving the user data, a JSON Web Token (JWT) is generated using the user's ID and email. The token is signed using a secret key and has an expiration time of 1 hour. The token is then set as a cookie in the response.
Finally, a 201 response is sent back with the user's ID, email, and token as the success message.

*/

module.exports.signUp = async function (req, res) {
  console.log(typeof req.body, req.body);
  let { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Bad Request" });
  }

  try {
    let existingUser;
    try {
      existingUser = await User.findOne({ email: email });
    } catch (e) {
      console.log("Error finding user - ", email);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: "User already exists, Plz signIn!",
      });
    }

    let token = "";
    validateFields(email, password, async function (err, results) {
      if (err) {
        return res.status(400).send({ success: false, message: err });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });
        let userData;
        try {
          userData = await newUser.save();
        } catch (e) {
          console.log("Error creating the user -- ", err, userData);
          return res.status(403).json({
            success: false,
            message: "Error creating the user.",
          });
        }

        token = jwt.sign(
          {
            userId: newUser.id,
            email: newUser.email,
          },
          secretKey,
          { expiresIn: "1h" }
        );

        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: 60 * 60 * 1000,
        });

        return res.status(201).json({
          success: true,
          message: { userId: newUser.id, email: newUser.email, token: token },
        });
      }
    });
  } catch (err) {
    console.log("Error while signOut - ", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

/*
This takes an email, password, and a callback function as parameters. It checks if the email and password are valid based on certain conditions. If any of the validations fail, an error message is generated. Otherwise, a success message is generated. The callback function is then called with the appropriate message.
*/
const validateFields = (email, password, cb) => {
  let message = "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    message = "Email not valid, ";
  }
  if (
    !/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/.test(password)
  ) {
    message += "Password not valid";
  }

  if (message) {
    cb(null, "success");
  } else {
    cb(message, null);
  }
};
