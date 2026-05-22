const mysql = require('../config/db');
const AppError = require('../utils/AppError');

exports.getAllCategories = async () => {
    const [data] = await mysql.query('SELECT cat_id , name FROM categories');
    if (data.length == 0) {
        throw new AppError('No Categories Found, Contact Admin', 404);
    }
    return data;
};

exports.getCategorybyId = async (catId) => {
    const [data] = await mysql.query('SELECT name FROM categories WHERE cat_id=?', [catId]);
    if (data.length == 0) {
        throw new AppError('No Category Found by Id, Contact Admin', 404);
    }
    return data;
};

exports.postCategories = async (userData) => {
    const { name } = userData;
    const [isExist] = await mysql.query('SELECT name FROM categories WHERE name =?', [name]);
    if (isExist.length > 0) {
        throw new AppError('Category already exists', 409);
    }
    const [newCat] = await mysql.query('INSERT INTO categories (name) VALUES (?)', [name]);
    if (newCat.affectedRows == 0) {
        throw new AppError('Something went wrong', 500);
    }
    return { id: newCat.insertId, name };
};

exports.updateCategorybyId = async (catId, catData) => {
    const { name } = catData;
    const [isExist] = await mysql.query('SELECT * FROM categories WHERE cat_id = ?', [catId]);
    if (isExist.length == 0) {
        throw new AppError('Category does not exist', 404);
    }
    const category = isExist[0];
    const updatedName = name || category.name;
    const [updated] = await mysql.query('UPDATE categories SET name=? WHERE cat_id=?', [updatedName, catId]);
    if (updated.affectedRows == 0) {
        throw new AppError('Something Went Wrong', 500);
    }
    return { id: catId, name: updatedName };
};

exports.deleteCategoriesbyId = async (userId) => {
    const [isExist] = await mysql.query('SELECT * FROM categories WHERE cat_id = ?', [userId]);
    if (isExist.length == 0) {
        throw new AppError('Category does not exist', 404);
    }
    const [deletedCat] = await mysql.query('DELETE FROM categories WHERE cat_id =?', [userId]);
    return deletedCat;
};
