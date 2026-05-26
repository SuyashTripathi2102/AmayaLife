const mysql = require('../config/db');
const AppError = require('../utils/AppError');
const cartServices = require('./cartServices');
const razorpay = require('../config/razorpayConfig');
const crypto = require('crypto');


exports.placeOrders = async (userData) =>{
    const {id : userId} = userData;
    if(!userId) {
        throw new AppError("User Id is Missing",401);
    }

    const[cartItems] = await mysql.query(`SELECT ci.id ,ci.product_id,p.name, p.price , ci.quantity , 
        (p.price*ci.quantity) as subtotal FROM cart as c 
        JOIN cart_items as ci ON c.id = ci.cart_id 
        JOIN product as p ON ci.product_id = p.product_id 
        WHERE user_id = ?`,[userId]);
    
    if(cartItems.length==0){
        throw new AppError ("Cart Is Empty",404);
    }

    const [total_amount] = await mysql.query(`SELECT 
                    SUM(p.price * ci.quantity) AS total_amount
                FROM cart AS c
                JOIN cart_items AS ci 
                    ON c.id = ci.cart_id
                JOIN product AS p 
                    ON ci.product_id = p.product_id
                WHERE c.user_id = ?`,[userId]);
      if(total_amount.length==0){
        throw new AppError ("Something Went Wrong",500);
    }   
     const total = total_amount[0].total_amount;

     const [orders] = await mysql.query(`INSERT INTO orders (user_id,total_amount,status,razorpay_order_id) VALUES (?,?,?,?)`,[userId,total,'pending',null]);
     const orderId = orders.insertId;
     
     for (const item of cartItems) {
        await mysql.query(
            `INSERT INTO order_items (order_id,product_id,quantity,price) VALUES (?,?,?,?)`,
            [orderId,item.product_id,item.quantity,item.price]
        );
     }

    await cartServices.clearCart(userData);   
    
    return {
        orderId,
        total_amount:total,
        status : 'pending',
    }
}

exports.getOrders = async(userData) =>{
    const {id:userId} = userData;
    if(!userId){
        throw new AppError ("User id missing",401);
    }
    const [getOrder] = await mysql.query("SELECT * FROM orders WHERE user_id=?",[userId]);
    if(getOrder.length==0){
        throw new AppError("No orders found", 404);
    }
    return getOrder;
}

exports.getOrderbyId = async (userId,params)=>{
    const {id} = params;
    const {id: uId} = userId;
    if(!id || !uId){
        throw new AppError("param id / userid is missing ",401);
    }
    const [orderData] = await mysql.query("SELECT * FROM orders WHERE id = ? AND user_id = ?",[id,uId]);
    if(orderData.length==0){
        throw new AppError("No Orders Found",404);
    }
    const [orderItems] = await mysql.query (`SELECT oi.id,oi.product_id,oi.quantity
        ,oi.price,p.name FROM order_items as oi
        JOIN product as p ON oi.product_id=p.product_id 
        WHERE order_id= ?`,[id]);
    
    if(orderItems.length==0){
        throw new AppError("NO order ITEMS Present",404);
    }
    return {
        orderData,
        orderItems 
    }
}

exports.cancelOrder = async (userId,params) =>{
    const{id} = params;
    const{id:uId} = userId;
    if(!id || !uId){
        throw new AppError("param id / userid is missing ",401);
    }
    const [orderData] = await mysql.query("SELECT * FROM orders WHERE id = ? AND user_id = ?",[id,uId]);
    if(orderData.length==0){
        throw new AppError("No Orders Found",404);
    }
    let cancelOrder ;
    if(orderData[0].status=='pending'){
        const [update] = await mysql.query('UPDATE orders SET status=? WHERE id=?',['cancelled',id]);
        if(update.affectedRows==0){
            throw new AppError ("Failed to Update the Status");
        }
        
        cancelOrder = update;
    }else{
        throw new AppError ("Order Cant be canceled as its not pending",400);
    }
    return cancelOrder;
}


exports.initiatePayment = async (params,userData) =>{
    const {id:userId} = userData;
    const {id:orderId} = params
    if(!userId || !orderId){
        throw new AppError("orderId / userId is missing",400)
    }
    const [findData] = await mysql.query("SELECT * FROM orders WHERE id = ? AND user_id = ?",[orderId,userId]);
    if(findData.length==0){
        throw new AppError("Order Not Found",404);
    } 
    if(findData[0].status!=='pending'){
        throw new AppError("Already Paid or Cancelled",400);
    }

    const order = findData[0];
    let razorpayOrder;
    try {
    razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.total_amount * 100),
    currency: 'INR',
    receipt: `order_${orderId}`
    });
    } catch (err) {
    console.log('Razorpay full error:', JSON.stringify(err));
    throw new AppError('Razorpay API call failed', 500);
    }
    const [update] = await mysql.query(
    'UPDATE orders SET razorpay_order_id = ? WHERE id = ?',
    [razorpayOrder.id, orderId]
    );

    return {
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    orderId
    };
}

exports.handleWebhook = async (weebhookData) =>{
    const {razorpay_order_id,razorpay_payment_id,razorpay_signature} = weebhookData;

    if(!razorpay_order_id|| !razorpay_payment_id || !razorpay_signature){
        throw new AppError('Missing payment data',400);
    }

    const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        throw new AppError('Invalid payment signature', 400);
    }

    const [findData] = await mysql.query("SELECT * FROM orders WHERE razorpay_order_id = ?",[razorpay_order_id]);
    if(findData.length==0){
        throw new AppError("Order Not Found",404);
    } 
    const [update] = await mysql.query('UPDATE orders SET status=? WHERE id=?',['paid',findData[0].id]);
        if(update.affectedRows==0){
            throw new AppError ("Failed to Update the Status",500);
        }
        
    return update;

}