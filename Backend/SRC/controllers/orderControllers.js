const orderServices = require('../services/orderServices');


exports.placeOrders = async (req,res,next) =>{
    try{
        const data = await orderServices.placeOrders(req.user);
        res.status(201).json({
            message : "Order Placed SuccessFully",
            data : data
        })
    }catch(error){
        next(error);
    }
}

exports.getOrders = async (req,res,next) =>{
    try{
        const data = await orderServices.getOrders(req.user);
        res.status(200).json({
            message : "Order Fetched SuccessFully",
            data : data
        })
    }catch(error){
        next(error);
    }
}

exports.getOrderbyId = async (req,res,next) =>{
    try{
        const data = await orderServices.getOrderbyId(req.user,req.params);
        res.status(200).json({
            message : "Order Fetched by id SuccessFully",
            data : data
        })
    }catch(error){
        next(error);
    }
}

exports.cancelOrder = async (req,res,next) =>{
    try{
        const data = await orderServices.cancelOrder(req.user,req.params);
        res.status(200).json({
            message : "Order Canceled SuccessFully",
            data : data
        })
    }catch(error){
        next(error);
    }
}

exports.initiatePayment = async (req, res, next) => {
    try {
        const data = await orderServices.initiatePayment(req.params, req.user);
        res.status(200).json({
            message: 'Payment initiated successfully',
            data
        });
    } catch(error) {
        next(error);
    }
};

exports.handleWebhook = async (req, res, next) => {
    try {
        const data = await orderServices.handleWebhook(req.body);
        res.status(200).json({
            message: 'Payment Completed successfully',
            data
        });
    } catch(error) {
        next(error);
    }
}