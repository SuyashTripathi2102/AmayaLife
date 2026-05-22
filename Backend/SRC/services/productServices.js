const mysql = require('../config/db');
const AppError = require('../utils/AppError');

exports.getAllProducts = async (page, limit, offset, search, categoryId) => {
    let query = `SELECT * FROM product WHERE name LIKE ?`;
    let values = [`%${search}%`];
    if (categoryId) {
        query += ` AND category_id = ? `;
        values.push(categoryId);
    }
    query += ` LIMIT ? OFFSET ? `;
    values.push(limit, offset);
    const [data] = await mysql.query(query, values);
    if (data.length == 0) {
        throw new AppError('Products are not available, please contact Admin', 404);
    }
    let queryFilter = `SELECT COUNT(*) as total FROM product WHERE name LIKE ?`;
    let valuesFilter = [`%${search}%`];
    if (categoryId) {
        queryFilter += ` AND category_id = ? `;
        valuesFilter.push(categoryId);
    }
    const [totalCount] = await mysql.query(queryFilter, valuesFilter);
    const totalProducts = totalCount[0].total;
    const totalPages = Math.ceil(totalProducts / limit);
    return {
        data,
        pagination: { totalProducts, CurrentPage: page, totalPages, limit }
    };
};

exports.getAllActiveProducts = async (page, limit, offset, search, categoryId) => {
    let query = `SELECT * FROM product WHERE is_active = true AND name LIKE ?`;
    let values = [`%${search}%`];
    if (categoryId) {
        query += ` AND category_id = ? `;
        values.push(categoryId);
    }
    query += ` LIMIT ? OFFSET ? `;
    values.push(limit, offset);
    const [data] = await mysql.query(query, values);
    if (data.length == 0) {
        throw new AppError('Products are not available, please contact Admin', 404);
    }
    let queryFilter = `SELECT COUNT(*) as total FROM product WHERE is_active = true AND name LIKE ?`;
    let valuesFilter = [`%${search}%`];
    if (categoryId) {
        queryFilter += ` AND category_id = ? `;
        valuesFilter.push(categoryId);
    }
    const [totalCount] = await mysql.query(queryFilter, valuesFilter);
    const totalProducts = totalCount[0].total;
    const totalPages = Math.ceil(totalProducts / limit);
    return {
        data,
        pagination: { totalProducts, CurrentPage: page, totalPages, limit }
    };
};

exports.addNewProducts = async (userData) => {
    const { name, price, description, stock_quantity, category_id } = userData;
    const [isExist] = await mysql.query('SELECT * FROM product WHERE name = ?', [name]);
    if (isExist.length > 0) {
        throw new AppError('Product already exists', 409);
    }
    const [result] = await mysql.query(
        'INSERT INTO product (name,price,description,stock_quantity,category_id) VALUES (?,?,?,?,?)',
        [name, price, description, stock_quantity, category_id]
    );
    if (result.affectedRows == 0) {
        throw new AppError('Something Went Wrong', 500);
    }
    return { id: result.insertId, name, price, description, stock_quantity, category_id };
};

exports.getProductbyId = async (userId) => {
    const [data] = await mysql.query(
        'SELECT name,price,description,stock_quantity,category_id,is_active FROM product WHERE product_id= ?',
        [userId]
    );
    if (data.length == 0) {
        throw new AppError('Product is not Available, please contact Admin', 404);
    }
    return data;
};

exports.updateProductbyId = async (userId, userData) => {
    const { name, price, description, stock_quantity, category_id } = userData;
    const [isExist] = await mysql.query('SELECT * FROM product WHERE product_id = ?', [userId]);
    if (isExist.length == 0) {
        throw new AppError('Product does not exist', 404);
    }
    const [result] = await mysql.query(
        "UPDATE product SET name=?,price=?,description=?,stock_quantity=?,category_id=? WHERE product_id=?",
        [name, price, description, stock_quantity, category_id, userId]
    );
    if (result.affectedRows == 0) {
        throw new AppError('Something Went Wrong, Contact Admin', 500);
    }
    return { id: userId, name, price, description, stock_quantity, category_id };
};

exports.patchProductbyId = async (userId, userData) => {
    const { name, price, description, stock_quantity, category_id, is_active } = userData;
    const [isExist] = await mysql.query('SELECT * FROM product WHERE product_id = ?', [userId]);
    if (isExist.length == 0) {
        throw new AppError('Product does not exist', 404);
    }
    const product = isExist[0];
    const updatedName = name || product.name;
    const updatedPrice = price || product.price;
    const updatedDescription = description || product.description;
    const updatedStockQ = stock_quantity || product.stock_quantity;
    const updatedCategoryId = category_id || product.category_id;
    let updatedIsActive = product.is_active;
    if (is_active !== undefined) {
        updatedIsActive = (is_active === true || is_active === 'true') ? true : false;
    }
    const [result] = await mysql.query(
        "UPDATE product SET name=?,price=?,description=?,stock_quantity=?,category_id=?,is_active=? WHERE product_id=?",
        [updatedName, updatedPrice, updatedDescription, updatedStockQ, updatedCategoryId, updatedIsActive, userId]
    );
    if (result.affectedRows == 0) {
        throw new AppError('Something Went Wrong, Contact Admin', 500);
    }
    return { id: userId, name: updatedName, price: updatedPrice, description: updatedDescription, stock_quantity: updatedStockQ, category_id: updatedCategoryId, is_active: updatedIsActive };
};

exports.deleteProductbyId = async (userId) => {
    const [isExist] = await mysql.query('SELECT * FROM product WHERE product_id = ?', [userId]);
    if (isExist.length == 0) {
        throw new AppError('Product does not exist', 404);
    }
    const [deletedProduct] = await mysql.query('DELETE FROM product WHERE product_id =?', [userId]);
    return deletedProduct;
};

exports.SoftDeleteProductbyId = async (userId) => {
    const [isExist] = await mysql.query('SELECT * FROM product WHERE product_id = ?', [userId]);
    if (isExist.length == 0) {
        throw new AppError('Product does not exist', 404);
    }
    const [softDeleted] = await mysql.query('UPDATE product SET is_active = ? WHERE product_id =?', [false, userId]);
    return softDeleted;
};
