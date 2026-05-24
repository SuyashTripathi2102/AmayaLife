const cartServies = require('../services/cartServices');


exports.addToCart = async (req, res, next) => {
    try{
        const data = await cartServies.addToCart(req.user,req.body);
        res.status(201).json({
            message : "Product added to Cart Successfully",
            data : data
        })
    }catch(error){
        next(error)
    }
}

exports.getCart = async (req, res, next) => {
    try{
        const data = await cartServies.getCart(req.user);
        res.status(200).json({
            message : "Get Cart Successfully",
            data : data
        })
    }catch(error){
        next(error)
    }
}

exports.updateCartItem = async (req, res, next) => {
    try{
        const data = await cartServies.updateCartItem(req.params.itemId,req.body);
        res.status(200).json({
            message : "Cart Updated Successfully",
            data : data
        })
    }catch(error){
        next(error)
    }
}

exports.removeCartItem = async (req, res, next) => {
    try{
        const data = await cartServies.removeCartItem(req.params.itemId);
        res.status(200).json({
            message : "Cart item Delete by id Successfully",
            data : data
        })
    }catch(error){
        next(error)
    }
}

exports.clearCart = async (req, res, next) => {
     try{
        const data = await cartServies.clearCart(req.user);
        res.status(200).json({
            message : "Cart item Delete Successfully",
            data : data
        })
    }catch(error){
        next(error)
    }
}