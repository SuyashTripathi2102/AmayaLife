    const mysql = require('../config/db');
    const AppError = require('../utils/AppError');


    exports.addToCart = async (userData,cartData)=>{
        const{id: userId } = userData;
        const {product_id,quantity} = cartData;

        if(!userId){
            throw new AppError("User Id not found",401);
        }

        if(!product_id || !quantity){
            throw new AppError ("productId/quantity not found",401);
        }

        const [data] = await mysql.query("SELECT * FROM cart WHERE user_id=?",[userId]);
        
        let cart;

        if(data.length>0){
            cart=data[0];
        }else{
            const [result] = await mysql.query("INSERT INTO cart (user_id) VALUES (?)",[userId]);
            if(result.affectedRows==0){
                throw new AppError("Something went Wrong",500);
            }
            cart = {
                id: result.insertId
            }
        }
        
        const [checkCartItem] = await mysql.query("SELECT * FROM cart_items WHERE cart_id = ? AND product_id=?",[cart.id,product_id]);
        let updatedCart;
        if(checkCartItem.length>0){
            const updatedquantity = parseInt(checkCartItem[0].quantity) + quantity;
            const [uItmes] = await mysql.query("UPDATE cart_items SET quantity=? WHERE cart_id = ? and product_id = ?",[updatedquantity,cart.id,product_id]);
            if(uItmes.affectedRows==0){
                throw new AppError("Something went Wrong",500);
            }
            updatedCart = { cartItemId: checkCartItem[0].id, 
                quantity: updatedquantity };
        } else{
            const[nItems] = await mysql.query("INSERT INTO cart_items (cart_id,product_id,quantity) VALUES (?,?,?)",[cart.id,product_id,quantity]);
            if(nItems.affectedRows==0){
                throw new AppError("Something went Wrong",500);
            }
            updatedCart = { cartItemId: nItems.insertId, quantity };
        }

        return {
            updatedCart
        }
    }


    exports.getCart = async (userData) =>{
        const{id: userId } = userData;
        if(!userId){
            throw new AppError("User Id not found",401);
        }
        const [data] = await mysql.query (`SELECT ci.id ,p.name, p.price , ci.quantity ,
            (p.price*ci.quantity) as subtotal FROM cart as c
            JOIN cart_items as ci ON c.id = ci.cart_id
            JOIN product as p ON ci.product_id = p.product_id 
            WHERE user_id= ?`,
            [userId]
            );
        if(data.length==0){
            throw new AppError("DATA not exist" , 404);
        }   
        return data;
    }

    exports.updateCartItem = async (cartId,cartQ) =>{
        const cart_item_id = cartId;
        const {quantity} = cartQ;
        if(!cart_item_id||!quantity){
            throw new AppError("cart item id / quantity missing",400) ;
        }
        const [data] = await mysql.query("SELECT cart_id,product_id,quantity FROM cart_items WHERE id=?",[cart_item_id]);
        if(data.length==0){
            throw new AppError("DATA NOT EXIST",404);
        }
        const [updateCart] = await mysql.query("UPDATE cart_items SET quantity=? WHERE id = ?",[quantity,cart_item_id]);
        if(updateCart.affectedRows==0){
            throw new AppError("Something went Wrong",500);
        }

        return { cartItemId: cart_item_id, quantity }
    }

    exports.removeCartItem  = async (itemId) =>{
        if(!itemId){
            throw new AppError("cart item id ",400) ;
        }
        const [ifExist] = await mysql.query("SELECT * FROM cart_items WHERE id=?",[itemId]);
        if(ifExist.length==0){
            throw new AppError("item not exist",404);
        }
        const [DELETEbyId] = await mysql.query("DELETE FROM cart_items WHERE id=?",[itemId]);
        if(DELETEbyId.affectedRows==0){
        throw new AppError("Something went Wrong",500);
        }
        return DELETEbyId;
    }

    exports.clearCart = async (userId) =>{
        const {id} = userId;
        if(!id){
            throw new AppError("User id is missing",400);
        }
        const [ifExist] = await mysql.query("SELECT * FROM cart WHERE user_id=?",[id]);
        if(ifExist.length==0){
            throw new AppError ("User Cart Not found",404);
        }
        const [Delete] = await mysql.query("DELETE FROM cart_items WHERE cart_id=?",[ifExist[0].id]);
        if(Delete.affectedRows==0){
            throw new AppError("Something went Wrong",500);
        }
        return Delete;
    }
