const mysql = require('../config/db');
const cloudinary = require('../config/cloudinaryConfig');

const {uploadToCloudinary} = require('../helper/cloudinaryHelper');

exports.uploadProductImage = async (productId,fileBuffer,isPrimary=false)=>{
    //upload to cloudinary
    const {url,publicId} = await uploadToCloudinary(fileBuffer);
     // get dedicated connection
    const connection = await mysql.getConnection();
    try{
        // start transaction 
        await connection.beginTransaction();

        const [existingImages] = await connection.query(`SELECT COUNT(*) as total FROM images WHERE product_id = ?`,[productId]);
            const totalImages = existingImages[0].total;
            // first image auto primary
            if(totalImages === 0){
            isPrimary = true;
            }

        // new image comes then isprimary becomes false
        if(isPrimary){
            await connection.query(
                `Update images SET is_primary= false WHERE product_id=?`,[productId]
            );
        }

        // insert new image
            const [result] = await connection.query (
                `INSERT INTO images (product_id,image_url,public_id,is_primary) VALUES(?,?,?,?)`,[productId,url,publicId,isPrimary]
            );

        await connection.commit();


    return {
        imageId : result.insertId,
        productId ,
        imageUrl: url,
        publicId,
        isPrimary
    };
    }catch(error){
        //undo all queries
        await connection.rollback();
        if(publicId){
        await cloudinary.uploader.destroy(publicId);
        }
        throw error;
    }finally{
        //release the connections back to pool
        connection.release();
    }
};