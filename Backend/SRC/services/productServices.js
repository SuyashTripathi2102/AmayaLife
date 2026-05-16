const mysql = require ('../config/db');

exports.getAllProducts = async (page,limit,offset,search)=>{
    const [data] = await mysql.query('SELECT * FROM product WHERE name LIKE ? LIMIT ? OFFSET ?',[`%${search}%`,limit,offset]);
    if(data.length==0){
        throw new Error ('Products are not avaialble pls contact Admin');
    }
    const [totalCount] = await mysql.query('SELECT COUNT(*) as total FROM product WHERE name LIKE ?',[`%${search}%`]);
    const totalProducts = totalCount[0].total;
    const totalPages = Math.ceil(totalProducts/limit);
    return {
        data,
        pagination : {
            totalProducts,
            CurrentPage : page,
            totalPages : totalPages,
            limit
        }
    };
}

exports.getAllAciveProducts = async (page,limit,offset,search)=>{
    const [data] = await mysql.query('SELECT * FROM product WHERE is_active = TRUE AND name LIKE ? LIMIT ? OFFSET ?',[`%${search}%`,limit,offset]);
    if(data.length==0){
        throw new Error ('Products are not avaialble pls contact Admin');
    }
    const [totalCount] = await mysql.query("SELECT COUNT(*) as total FROM product WHERE is_active = TRUE AND name LIKE ?",[`%${search}%`]);
    const totalProducts = totalCount[0].total;
    const totalPages = Math.ceil(totalProducts/limit);

    return {
        data,
        pagination : {
            totalProducts,
            CurrentPage : page,
            totalPages : totalPages,
            limit
        }
    };
}

exports.addNewProducts = async (userData) =>{
    const {name,price,description,stock_quantity,category_id} = userData;
    const [isExist] = await mysql.query('SELECT * FROM product WHERE name = ?',[name]);
    if(isExist.length>0){
        throw new Error('Product already exist');
    }
    const [result] = await mysql.query('INSERT INTO product (name,price,description,stock_quantity,category_id) VALUES (?,?,?,?,?)',[name,price,description,stock_quantity,category_id]);
    if(result.affectedRows==0){
        throw new Error ('Something Went Wrong');
    }
    return {
        id : result.insertId,
        name : name,
        price : price,
        description : description,
        stock_quantity : stock_quantity,
        category_id : category_id
    }
}

exports.getProductbyId = async (userId) =>{
    //const{id} = userId;
    const [data] = await mysql.query('SELECT name,price,description,stock_quantity,category_id FROM product WHERE product_id= ?',[userId]);
    if(data.length==0){
        throw new Error ('Product is not Avialable pls contact Admin');
    }
    return data;
}

exports.updateProductbyId = async (userId,userData) => {
    const {name,price,description,stock_quantity,category_id} = userData;
    //const id = userId;
    const [isExist] = await mysql.query('SELECT * FROM product WHERE product_id = ?',[userId]);
    if(isExist.length==0){
        throw new Error('Product dont exist');
    }
    const [result] = await mysql.query("UPDATE product SET name=?,price=?,description=?,stock_quantity=?,category_id=? WHERE product_id=?",[name,price,description,stock_quantity,category_id,userId]);
    if(result.affectedRows==0){
        throw new Error ("Something Went Wrong Contact Admin");
    }
    return {
        id : userId,
        name : name,
        price : price,
        description : description,
        stock_quantity : stock_quantity,
        category_id : category_id
    }
}

exports.patchProductbyId = async (userId,userData) => {
    const {name,price,description,stock_quantity,category_id} = userData;
    const id = userId;
    const [isExist] = await mysql.query('SELECT * FROM product WHERE product_id = ?',[id]);
    if(isExist.length==0){
        throw new Error('Product dont exist');
    }
    const product = isExist[0];
    const updatedName = name || product.name;
    const updatedPrice = price || product.price;
    const updatedDescription = description || product.description;
    const updatedStockQ = stock_quantity || product.stock_quantity;
    const updateCategoryId = category_id || product.category_id;
    const [result] = await mysql.query("UPDATE product SET name=?,price=?,description=?,stock_quantity=?,category_id=? WHERE product_id =?",[updatedName,updatedPrice,updatedDescription,updatedStockQ,updateCategoryId,id]);
    if(result.affectedRows==0){
        throw new Error ("Something Went Wrong Contact Admin");
    }
    return {
        id : id,
        name : updatedName,
        price : updatedPrice,
        description : updatedDescription,
        stock_quantity : updatedStockQ,
        category_id : updateCategoryId
    }
}

exports.deleteProductbyId = async (userId) =>{
    const id = userId;
    const [isExist] = await mysql.query('SELECT * FROM product WHERE product_id = ?',[id]);
    if(isExist.length==0){
        throw new Error('Product dont exist');
    }
    const [DeletedProduct] = await mysql.query('DELETE FROM product WHERE product_id =?',[id]);
    return DeletedProduct;
}

exports.SoftDeleteProductbyId = async (userId) =>{
    const id = userId;
    const is_active = "FALSE";
    const [isExist] = await mysql.query('SELECT * FROM product WHERE product_id = ?',[id]);
    if(isExist.length==0){
        throw new Error('Product dont exist');
    }
    
    const [SoftDeletedProduct] = await mysql.query('UPDATE product SET is_active = ? WHERE product_id =?',[is_active,id]);
    return SoftDeletedProduct;
}