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

exports.loginUser = async (req,res) =>{
    try{
        const data = await userService.login(req.body);
        res.status(201).json({
            message : "User Logined successfully",
            data : data
        })
    }catch(err){
        res.status(500).json({
            error : err.message
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
