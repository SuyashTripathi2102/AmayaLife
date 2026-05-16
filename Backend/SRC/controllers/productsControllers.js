const productService = require('../services/productServices');

exports.getAllProducts = async (req,res) =>{
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page-1)*limit;
        const search = req.query.search?.trim() || '';
        const categoryId = req.query.category_id;
        const data = await productService.getAllProducts(page,limit,offset,search,categoryId);
        res.status(200).json({
            message : "All Products Fetched Successfully",
            data : data
        })
    }catch(error){
        res.status(500).json({
            message : error.message
        })
    }
}
exports.getAllActiveProducts = async (req,res) =>{
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page-1)*limit;
        const search = req.query.search?.trim() || '';
        const categoryId = req.query.category_id;
        const data = await productService.getAllActiveProducts(page,limit,offset,search,categoryId);
        res.status(200).json({
            message : "All Active Products Fetched Successfully",
            data : data
        })
    }catch(error){
        res.status(500).json({
            message : error.message
        })
    }
}

exports.addNewProducts = async (req,res) =>{
try{
        const data = await productService.addNewProducts(req.body);
        res.status(201).json({
            message : "New Product Added Successfully",
            data : data
        })
    }catch(error){
        res.status(500).json({
            message : error.message
        })
    }
}

exports.getProductbyId = async (req,res) =>{
    try{
        const data = await productService.getProductbyId(req.params.id);
        res.status(200).json({
            message : "Product fetched by id Successfully",
            data : data
        })
    }catch(error){
        res.status(500).json({
            message : error.message
        })
    }
}

exports.updateProductbyId = async (req,res) =>{
    try{
        const data = await productService.updateProductbyId(req.params.id,req.body);
        res.status(200).json({
            message : "Product Updated by id Successfully",
            data : data
        })
    }catch(error){
        res.status(500).json({
            message : error.message
        })
    }
}

exports.patchProductbyId = async (req,res) =>{
    try{
        const data = await productService.patchProductbyId(req.params.id,req.body);
        res.status(200).json({
            message : "Product Updated (PATCH) by id Successfully",
            data : data
        })
    }catch(error){
        res.status(500).json({
            message : error.message
        })
    }
}

exports.deleteProductbyId = async (req,res) =>{
    try{
        const data = await productService.deleteProductbyId(req.params.id);
        res.status(200).json({
            message : "Product Deleted by id Successfully",
            data : data
        })
    }catch(error){
        res.status(500).json({
            message : error.message
        })
    } 
}

exports.SoftDeleteProductbyId = async (req,res) =>{
    try{
        const data = await productService.SoftDeleteProductbyId(req.params.id);
        res.status(200).json({
            message : "Product Soft Deleted by id Successfully",
            data : data
        })
    }catch(error){
        res.status(500).json({
            message : error.message
        })
    } 
}