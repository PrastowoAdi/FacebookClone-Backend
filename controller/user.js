const { validateEmail, validateLength, validateUsername } = require('../helpers/validation');
const User = require('../model/User');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const { generateToken } = require('../helpers/token');
const { sendVerificationEmail } = require('../helpers/mailer');

exports.register = async (req, res) => {
   try {
    const {
        first_name,
        last_name,
        email,
        password,
        username,
        bYear,
        bMonth,
        bDay,
        gender,
    } = req.body;

    if(!validateEmail(email)){
        return res.status(400).json({
            message: 'Invalid email address'
        })
    }

    //Check email exsists
    const check = await User.findOne({email});
    if(check){
        return res.status(400).json({
            message: 
                "This email address is already exists. Please try different email addresses"
        })
    }

    if(!validateLength(first_name,3,30)){
        return res.status(400).json({
            message: 
                "first name must be between 3 and 30 characters"
        })
    }
    if(!validateLength(last_name,3,30)){
        return res.status(400).json({
            message: 
                "last name must be between 3 and 30 characters"
        })
    }
    if(!validateLength(password,6,40)){
        return res.status(400).json({
            message: 
                "password must be at least 6 characters"
        })
    }

    const cryptPassword = await bcrypt.hash(password,12);

    //Generate unique username
    let tempUsername = first_name + last_name;
    let newUsername = await validateUsername(tempUsername);

    
    const user = await new User ({
        first_name,
        last_name,
        email,
        password: cryptPassword,
        username: newUsername,
        bYear,
        bMonth,
        bDay,
        gender,
    }).save();

    const emailVerification = generateToken({
        id:user._id.toString(),
    },'30m')
    
    const url = `${process.env.BASE_URL}/activate/${emailVerification}`;
    sendVerificationEmail(user.email, user.first_name,url);

    const token = generateToken({
        id:user._id.toString(),
    }, "7d");

    res.send({
        id:user._id,
        username:user.username,
        picture:user.picture,
        first_name:user.first_name,
        last_name:user.last_name,
        token:token,
        verified:user.iverifiedd,
        message:"Register Success ! Please activate your email to start",
    })
    
    res.json(user);
   } catch (err) {
        res.status(500).json({
            message: err.message
        })
   }
};

exports.activateAccount = async (req, res) => {
  const { token } = req.body;
  const user = jwt.verify(token, process.env.SECRET);
  const check = await User.findById(user.id);
  if (check.verified == true) {
    return res.status(400).json({
      message: "This email is already activated",
    });
  } else {
    await User.findByIdAndUpdate(user.id, {
      verified: true,
    });
    return res.status(200).json({
      message: "Account has been activated successfully",
    });
  }
};