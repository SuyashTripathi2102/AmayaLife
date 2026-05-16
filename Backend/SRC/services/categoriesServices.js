const mysql = require('../config/db');

exports.getAllCategories = async ()=>{
    const [data] = await mysql.query ('SELECT cat_id , name FROM categories');
    if(data.length==0){
        throw new Error ('No Categories Find , Contact Admin');
    }
    return data;
}
exports.getCategorybyId = async (catId) =>{
    const id = catId;
    const [data] = await mysql.query ('SELECT name FROM categories WHERE cat_id=?',[id]);
    if(data.length==0){
        throw new Error ('No Category Found by Id, Contact Admin');
    }
    return data;
}
exports.postCategories = async (userData) =>{
    const {name} = userData;
    const [isExist] = await mysql.query('SELECT name FROM categories WHERE name =?',[name]);
    if(isExist.length>0){
        throw new Error ('Categorey already exist');
    }
    const [newCat] = await mysql.query('INSERT INTO categories (name) VALUES (?)',[name]);
    if(newCat.affectedRows==0){
        throw new Error ('Something went wrong');
    }
    return {
        id:newCat.insertId,
        name:name
    }
}
exports.updateCategorybyId = async (catId,catData)=>{
    const {name} = catData;
    const id=catId;
    console.log(id,name);
    const [isExist] = await mysql.query('SELECT * FROM categories WHERE cat_id = ?',[id]);
    if(isExist.length==0){
        throw new Error('Categorey dont exist');
    }
    const Categorey = isExist[0];
    const UpCategoryName =  name||Categorey.name;
    const [Updated] = await mysql.query('UPDATE categories SET name=? WHERE cat_id=? ',[UpCategoryName,id]);
    if(Updated.affectedRows==0){
        throw new Error ('Something Went Wrong');
    }
    return {
        id : id,
        name : UpCategoryName
    }
}
exports.deleteCategoriesbyId = async (userId) =>{
    const id = userId;
    const [isExist] = await mysql.query('SELECT * FROM categories WHERE cat_id = ?',[id]);
    if(isExist.length==0){
        throw new Error('Categorey dont exist');
    }
    const [DeletedCat] = await mysql.query('DELETE FROM categories WHERE cat_id =?',[id]);
    return DeletedCat;
}

