const mysql = require ('../config/db');

exports.getAllProducts = async (page,limit,offset,search,categoryId)=>{
    let query = `SELECT * FROM product WHERE name LIKE ?`;
    let values = [`%${search}%`];
    if(categoryId){
        query += ` AND category_id = ? `;
        values.push(categoryId);
    }
    query += ` LIMIT ? OFFSET ? `;
    values.push(limit,offset);

    const [data] = await mysql.query(
        query,
        values
    )
    if(data.length==0){
        throw new Error ('Products are not avaialble pls contact Admin');
    }
    let queryFilter = `SELECT COUNT(*) as total FROM product WHERE name LIKE ?`;
    let valuesFilter = [`%${search}%`];
    if(categoryId){
        queryFilter += ` AND category_id = ? `;
        valuesFilter.push(categoryId);
    }
    const [totalCount] = await mysql.query(queryFilter,valuesFilter);
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

exports.getAllActiveProducts = async (page,limit,offset,search,categoryId)=>{
    let query = `SELECT * FROM product WHERE is_active = true AND name LIKE ?`;
    let values = [`%${search}%`];
    if(categoryId){
        query += ` AND category_id = ? `;
        values.push(categoryId);
    }
    query += ` LIMIT ? OFFSET ? `;
    values.push(limit,offset);

    const [data] = await mysql.query(
        query,
        values
    )
    if(data.length==0){
        throw new Error ('Products are not avaialble pls contact Admin');
    }
    let queryFilter = `SELECT COUNT(*) as total FROM product WHERE is_active = true AND name LIKE ?`;
    let valuesFilter = [`%${search}%`];
    if(categoryId){
        queryFilter += ` AND category_id = ? `;
        valuesFilter.push(categoryId);
    }
    const [totalCount] = await mysql.query(queryFilter,valuesFilter);
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
    const [data] = await mysql.query('SELECT name,price,description,stock_quantity,category_id,is_active FROM product WHERE product_id= ?',[userId]);
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
    const {name,price,description,stock_quantity,category_id,is_active} = userData;
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
    let updateIsActive = product.is_active;
    if(is_active!==undefined){
        updateIsActive = (is_active === true || is_active === 'true') ? true : false;
    }
    const [result] = await mysql.query("UPDATE product SET name=?,price=?,description=?,stock_quantity=?,category_id=?,is_active=? WHERE product_id =?",[updatedName,updatedPrice,updatedDescription,updatedStockQ,updateCategoryId,updateIsActive,id]);
    if(result.affectedRows==0){
        throw new Error ("Something Went Wrong Contact Admin");
    }
    return {
        id : id,
        name : updatedName,
        price : updatedPrice,
        description : updatedDescription,
        stock_quantity : updatedStockQ,
        category_id : updateCategoryId,
        is_active : updateIsActive
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
    const is_active = false;
    const [isExist] = await mysql.query('SELECT * FROM product WHERE product_id = ?',[id]);
    if(isExist.length==0){
        throw new Error('Product dont exist');
    }
    
    const [SoftDeletedProduct] = await mysql.query('UPDATE product SET is_active = ? WHERE product_id =?',[is_active,id]);
    return SoftDeletedProduct;
}