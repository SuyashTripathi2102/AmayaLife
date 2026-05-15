const categoriesServices = require('../services/categoriesServices');

exports.getAllCategories = async (req,res) =>{
    try{
        const data = await categoriesServices.getAllCategories();
        res.status(200).json({
            message : "ALL Categories are Fetched",
            data : data
        })
    }catch(error){
        res.status(401).json({
            message : error.message
        })
    }
}

exports.postCategories = async (req,res)=>{
    try{
        const data = await categoriesServices.postCategories(req.body);
        res.status(201).json({
            message: "Category Added Successfully",
            data : data
        })
    }catch(error){
        res.status(500).json({
            message  : error.message
        })
    }
}

exports.deleteCategoriesbyId = async (req,res) => {
    try{
            const data = await categoriesServices.deleteCategoriesbyId(req.params.id);
            res.status(200).json({
                message : "Category Deleted by id Successfully",
                data : data
            })
        }catch(error){
            res.status(500).json({
                message : error.message
            })
        } 
}