const userService = require('../services/userServices');

exports.registerUser = async (req,res) =>{
    try{
        const data = await userService.register(req.body);
        res.status(201).json({
            message : "User register successfully",
            data : data
        })
    }catch(err){
        res.status(500).json({
            error : err.message
        })
    }
}
exports.verifyMailHandler = async (req,res)=>{
    try{
        const data = await userService.verifyMailHandler(req.query);
        res.status(200).json({
            message : "Email is Verified Now you can Login"
        })
      
    
    }catch(err){
        res.status(500).json({
            error : err.message
        })
    }
}
exports.loginUser = async (req,res) =>{
    try{
        const data = await userService.login(req.body);
        const {Accesstoken, Refershtoken, user} = data;
        const isProd = process.env.ENV === 'production';
        res.cookie ("refreshtoken",Refershtoken,{
        httpOnly : true,
        secure : isProd,
        sameSite : 'lax',
        maxAge :7*24*60*60*1000
        })

        res.status(200).json({
            message : "User Logined successfully",
            user : user,
            Accesstoken :Accesstoken
        })
    }catch(err){
        res.status(500).json({
            error : err.message
        })
    }
}

exports.refershToken = async (req,res)=>{
    try{
        const refersh = await userService.refershToken(req.cookies.refreshtoken);
        res.status(200).json({
            message : "New Token Genterated Successfully",
            token : refersh
        });
    }catch(error){
        res.status(401).json({
            message : error.message
        })
    }
}

exports.logout = async (req,res)=>{
    try{
            res.clearCookie('refreshtoken',{path:'/'});
            res.status(200).json({
            message : "Logout Successfully", 
        });
    }catch(error){
        res.status(401).json({
            message : error.message
        })
    }
}


exports.forgetPassword = async (req,res)=>{
    try{
        const data = await userService.forgetPassword(req.body);
         res.status(200).json({
            message : "Mail Sent for new Password Successfully",
        });
    }catch(error){
        res.status(401).json({
            message : error.message
        })
    }
}

exports.resetPassword = async (req,res)=>{
    try{
        const data = await userService.resetPassword(req.body,req.query.token);
         res.status(200).json({
            message : "New Password SET Successfully",
        });
    }catch(error){
        res.status(401).json({
            message : error.message
        })
    }
}
exports.getAllUsers = async (req,res) =>{
    try{
        const data = await userService.getAllUsers();
        res.status(200).json({
            message : "All Users Fetched successfully",
            data : data
        })
    }catch(err){
        res.status(500).json({
            error : err.message
        })
    }
}

exports.getUserbyId = async(req,res)=>{
    try{
        const data = await userService.getUserbyId (req.params);
        res.status(200).json({
            message : "Users Fetched successfully by Id",
            data : data
        })
    }catch(err){
        res.status(400).json({
            error : err.message
        })
    }   
}

exports.updateUserbyId = async(req,res)=>{
    try{
        const data = await userService.updateUserbyId (req.params,req.body);
        res.status(200).json({
            message : "Users Fetched and Updated successfully by Id",
            data : data
        })
    }catch(err){
        res.status(400).json({
            error : err.message
        })
    }   
}

exports.patchUserbyId = async(req,res)=>{
    try{
        const data = await userService.patchUserbyId (req.params,req.body);
        res.status(200).json({
            message : "Users Fetched and Partial Updated successfully by Id",
            data : data
        })
    }catch(err){
        res.status(400).json({
            error : err.message
        })
    }   
}

exports.deleteUserbyId = async(req,res)=>{
    try{
        const data = await userService.deleteUserbyId (req.params);
        res.status(200).json({
            message : "Users Deleted successfully by Id",
            data : data
        })
    }catch(err){
        res.status(400).json({
            error : err.message
        })
    }
}

exports.googleAuthStartHandler = (req, res) => {
    try {
        const url = userService.googleAuthStartHandler();
        res.redirect(url);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.googleAuthCallbackHandler = async (req, res) => {
    try {
        const code = req.query.code;
        const data = await userService.googleAuthCallbackHandler(code);
        const { Accesstoken, Refershtoken, user } = data;
        const isProd = process.env.ENV === 'production';
        res.cookie('refreshtoken', Refershtoken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({ message: 'Google Login Successful', Accesstoken, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};