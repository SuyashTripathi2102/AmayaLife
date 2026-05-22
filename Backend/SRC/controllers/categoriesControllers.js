const categoriesServices = require('../services/categoriesServices');

exports.getAllCategories = async (req,res,next) =>{
    try{
        const data = await categoriesServices.getAllCategories();
        res.status(200).json({
            message : "ALL Categories are Fetched",
            data : data
        })
    }catch(error){
        next(error)
    }
}

exports.getCategorybyId = async (req,res,next) =>{
    try{
        const data = await categoriesServices.getCategorybyId(req.params.id);
        res.status(200).json({
         message : "Category Fetched by Id SuccessFully",
            data : data
        })
    }catch(error){
        next(error)
    }
}

exports.updateCategorybyId = async (req,res,next)=>{
    try{
        const data = await categoriesServices.updateCategorybyId(req.params.id,req.body);
        res.status(201).json({
         message : "Category Fetched by Id and Updated SuccessFully",
            data : data
        })
    }catch(error){
      next(error)
    }
}

exports.postCategories = async (req,res,next)=>{
    try{
        const data = await categoriesServices.postCategories(req.body);
        res.status(201).json({
            message: "Category Added Successfully",
            data : data
        })
    }catch(error){
        next(error)
    }
}

exports.deleteCategoriesbyId = async (req,res,next) => {
    try{
            const data = await categoriesServices.deleteCategoriesbyId(req.params.id);
            res.status(200).json({
                message : "Category Deleted by id Successfully",
                data : data
            })
        }catch(error){
            next(error)
        } 
}