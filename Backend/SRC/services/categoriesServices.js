const mysql = require('../config/db');

exports.getAllCategories = async ()=>{
    const [data] = await mysql.query ('SELECT name FROM categories');
    if(data.length==0){
        throw new Error ('No Categories Find , Contact Admin');
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