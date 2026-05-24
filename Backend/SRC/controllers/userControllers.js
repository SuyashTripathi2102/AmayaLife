const userService = require('../services/userServices');
const { setRefreshCookie, clearRefreshCookie , setCsrfCookie } = require('../helper/cookieHelper');
const crypto = require('crypto');


exports.registerUser = async (req,res,next) =>{
    try{
        const data = await userService.register(req.body);
        res.status(201).json({
            message : "User register successfully",
            data : data
        })
    }catch(err){
        next(err)
    }
}
exports.verifyMailHandler = async (req,res,next)=>{
    try{
        const data = await userService.verifyMailHandler(req.query);
        res.status(200).json({
            message : "Email is Verified Now you can Login"
        })
      
    
    }catch(err){
        next(err)
    }
}
exports.loginUser = async (req,res,next) =>{
    try{
        const data = await userService.login(req.body);
        const {Accesstoken, Refershtoken, user} = data;
        const csrfToken = crypto.randomBytes(32).toString('hex');
        setRefreshCookie(res, Refershtoken);
        setCsrfCookie(res, csrfToken);
        res.status(200).json({
            message : "User Logined successfully",
            user : user,
            Accesstoken :Accesstoken
        })
    }catch(err){
        next(err)
    }
}

exports.refershToken = async (req,res,next)=>{
    try{
        const refersh = await userService.refershToken(req.cookies.refreshtoken);
        res.status(200).json({
            message : "New Token Genterated Successfully",
            token : refersh
        });
    }catch(error){
        next(error)
    }
}

exports.logout = async (req,res,next)=>{
    try{
        clearRefreshCookie(res);
            res.status(200).json({
            message : "Logout Successfully", 
        });
    }catch(error){
        next(error)
    }
}


exports.forgetPassword = async (req,res,next)=>{
    try{
        const data = await userService.forgetPassword(req.body);
         res.status(200).json({
            message : "Mail Sent for new Password Successfully",
        });
    }catch(error){
       next(error)
    }
}

exports.resetPassword = async (req,res,next)=>{
    try{
        const data = await userService.resetPassword(req.body,req.query.token);
         res.status(200).json({
            message : "New Password SET Successfully",
        });
    }catch(error){
        next(error)
    }
}
exports.getAllUsers = async (req,res,next) =>{
    try{
        const data = await userService.getAllUsers();
        res.status(200).json({
            message : "All Users Fetched successfully",
            data : data
        })
    }catch(err){
       next(err)
    }
}

exports.getUserbyId = async(req,res,next)=>{
    try{
        const data = await userService.getUserbyId (req.params);
        res.status(200).json({
            message : "Users Fetched successfully by Id",
            data : data
        })
    }catch(err){
       next(err)
    }   
}

exports.updateUserbyId = async(req,res,next)=>{
    try{
        const data = await userService.updateUserbyId (req.params,req.body);
        res.status(200).json({
            message : "Users Fetched and Updated successfully by Id",
            data : data
        })
    }catch(err){
       next(err)
    }   
}

exports.patchUserbyId = async(req,res,next)=>{
    try{
        const data = await userService.patchUserbyId (req.params,req.body);
        res.status(200).json({
            message : "Users Fetched and Partial Updated successfully by Id",
            data : data
        })
    }catch(err){
        next(err)
    }   
}

exports.deleteUserbyId = async(req,res,next)=>{
    try{
        const data = await userService.deleteUserbyId (req.params);
        res.status(200).json({
            message : "Users Deleted successfully by Id",
            data : data
        })
    }catch(err){
        next(err)
    }
}

exports.googleAuthStartHandler = (req, res,next) => {
    try {
        const url = userService.googleAuthStartHandler();
        res.redirect(url);
    } catch (error) {
        next(error)
    }
};

exports.googleAuthCallbackHandler = async (req, res,next) => {
    try {
        const code = req.query.code;
        const data = await userService.googleAuthCallbackHandler(code);
        const { Accesstoken, Refershtoken, user } = data;
        const csrfToken = crypto.randomBytes(32).toString('hex');
        setRefreshCookie(res, Refershtoken);
        setCsrfCookie(res, csrfToken);
        res.status(200).json({ message: 'Google Login Successful', Accesstoken, user });
    } catch (error) {
       next(error)
    }
};