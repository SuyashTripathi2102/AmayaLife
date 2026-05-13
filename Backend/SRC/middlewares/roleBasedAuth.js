
module.exports = (...allowedRoles)=>{
    return (req,res,next)=>{
        const userrole = req.user.role;
        if(!allowedRoles.includes(userrole)){
            return res.status(401).json({
                message:"Acess Denied"
            });
        }
        next();
    }
}