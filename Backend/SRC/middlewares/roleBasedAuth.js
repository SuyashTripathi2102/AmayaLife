
module.exports = (...allowedRoles)=>{
    return (req,res,next)=>{
        const userrole = req.user.role;
        if(!allowedRoles.includes(userrole)){
            return res.status(403).json({
                message:"Access Denied"
            });
        }
        next();
    }
}