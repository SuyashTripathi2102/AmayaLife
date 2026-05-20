const mysql = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyMail } = require('../helper/emailHelper');

    function getAppUrl (){
        return process.env.APP_URL || `http://localhost:${process.env.PORT}`
    }
    exports.register = async (userdata)=>{
        const {name,email,password,phoneNo,role} = userdata;
        if(!name || !email || !password || !phoneNo){
            throw new Error ("User Info Missing pls Enter Info properly");
        }
        const [ifExist] = await mysql.query("SELECT * FROM users WHERE email = ? ",[email]);
        if(ifExist.length>0){
            throw new  Error ("User already exist with this email");
        }
        const userRole = role || 'customer';
        const hashedpassword = await bcrypt.hash(password,10);
        const [result] = await mysql.query("INSERT INTO users (name,email,password,phoneNo,role,is_email_verified,two_factor_enabled) VALUES (?,?,?,?,?,?,?)",[name,email,hashedpassword,phoneNo,userRole,false,false]);
        
      
        const verifyToken = jwt.sign({
            id : result.insertId,
            name : name,
        },process.env.JWT_SECRET,{expiresIn:'1d'});

        const verifyURL = `${getAppUrl()}/api/users/auth/verify-email?token=${verifyToken}`
        
        await verifyMail(
            email,
            "EMAIL Verification Mail",
            `<p>please verify your email by clicking the link:</p>
            <p><a href = "${verifyURL}">${verifyURL}</a></p> `
        );
         return {
            id : result.insertId,
            name : name,
            email : email,
            phoneNo : phoneNo,
            role : role,
            isEmailVerified : false
        }   
}

exports.verifyMailHandler = async (userData)=>{
    const {token} = userData;
    if(!token){
        throw new Error ("Token is missing");
    }
    
    const playload = jwt.verify(token,process.env.JWT_SECRET);
    const [user] = await mysql.query('SELECT * FROM users WHERE id=?',[playload.id]);
        if(user.length === 0){
                throw new Error("User not found");
        }
     if(user[0].is_email_verified){
        return true
     } 
     let userEmailverified = true;
     const[updateEmailVerification] = await mysql.query("UPDATE users SET is_email_verified = ? WHERE id=?",[userEmailverified,playload.id]);
        if(updateEmailVerification.affectedRows==0){
            throw new Error ('Something Went Wrong to store Verifying Email in DB');
        }
    return userEmailverified;    
}


exports.login = async (userdata)=>{
    const {email,password} = userdata;
    if(!email || !password){
        throw new Error("Email and password are required");
    }
    const [ifExist]  = await mysql.query("SELECT * FROM users WHERE email = ? ",[email]);
    if(ifExist.length === 0){
        throw new Error("User not found with this email");
    }
    const user = ifExist[0];
    const ispasswordMatch = await bcrypt.compare(password,user.password);
    if(!ispasswordMatch){
        throw new Error ("Password is not match");
    }
    if(!user.is_email_verified){
        throw new Error ("Email is not verified Pls verify first")
    }
    
    const Accesstoken = jwt.sign({id:user.id,email:user.email,role:user.role},process.env.JWT_SECRET,{expiresIn:"1h"});
    const Refershtoken = jwt.sign({id:user.id},process.env.JWT_SECRET,{expiresIn:"7d"});

    
    return{
        Accesstoken,
        Refershtoken,
        user:{
            id : user.id,
            email : user.email,
            role : user.role,
            isEmailVerified : user.is_email_verified,
            twoFactorEnabled : user.two_factor_enabled
        }

    }
}

exports.getAllUsers = async ()=>{
    const [getAll] = await mysql.query("SELECT id, name, email, phoneNo, role FROM users");
    return {
        data: getAll
    } 
}

exports.getUserbyId = async (userId)=>{
    const {id} = userId;
    //console.log(id);
    const [isExist] = await mysql.query("SELECT name,email,phoneNo,role FROM users WHERE id=?",[id]);
    if(isExist.length==0){
        throw new Error ("USER Dont exist");
    }
    return isExist;
}

exports.updateUserbyId = async (userId,userData)=>{
    const {id} = userId;
    const {name,email,phoneNo,role} = userData;
    const [updateUser] = await mysql.query("UPDATE users SET name=?,email=?,phoneNo=?,role=? WHERE id=?",[name,email,phoneNo,role,id]);
    if(updateUser.affectedRows === 0){
        throw new Error ("USER Dont exist");
    }
    return {
        id,
        name : name,
        email : email,
        phoneNo : phoneNo,
        role : role
    }
}

exports.patchUserbyId = async (userId,userData)=>{
    const {id} = userId;
    const {name,email,phoneNo,role} = userData;
    const [isExist] = await mysql.query("SELECT * FROM users WHERE id=?",[id]);
    if(isExist.length==0){
        throw new Error ("USER Dont exist");
    }
    const existingUser = isExist[0];
    const updatedName = name || existingUser.name;
    const updatedEmail = email || existingUser.email;
    const updatedPhoneNo = phoneNo || existingUser.phoneNo;
    const updatedRole = role || existingUser.role;
    const [updateUser] = await mysql.query("UPDATE users SET name=?,email=?,phoneNo=?,role=? WHERE id=?",
        [
            updatedName,
            updatedEmail,
            updatedPhoneNo,
            updatedRole,
            id
        ]);

    return updateUser;
}

exports.deleteUserbyId = async (userId)=>{
    const {id} = userId;
    const [isExist] = await mysql.query("SELECT * FROM users WHERE id=?",[id]);
    if(isExist.length==0){
        throw new Error ("USER Dont exist");
    }
    const [deleteUser] = await mysql.query("DELETE FROM users WHERE id=?",[id]);
    return deleteUser;
}