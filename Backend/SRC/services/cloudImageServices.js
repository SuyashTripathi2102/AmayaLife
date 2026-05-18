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

exports.getAllProductsImages = async(productId) =>{
    const [result] = await mysql.query ('SELECT * FROM images WHERE product_id = ? ORDER BY is_primary DESC',[productId]);
    if(result.length==0){
        throw new Error ('No Images Found pls contact Admin');
    }
    return result;
};

exports.deleteImagebyId = async(ImageId) =>{
    const id = ImageId;
    const [isExist] = await mysql.query('SELECT public_id,is_primary,product_id FROM images WHERE id = ?',[id]);
    if(isExist.length==0){
        throw new Error ('images not exist for this product id');
    }
    const ImageProduct = isExist[0];
    const [deletedImage] = await mysql.query('DELETE FROM images WHERE id=?',[id]);
    if(deletedImage.affectedRows==0){
        throw new Error ('Something Went Wrong');
    }
    if(ImageProduct.public_id){
       await cloudinary.uploader.destroy(ImageProduct.public_id);
    }
    if(ImageProduct.is_primary){
        const [ImageP] = await mysql.query('SELECT id,is_primary FROM images WHERE product_id=? ORDER BY created_at ASC LIMIT 1',[ImageProduct.product_id]);
        if(ImageP.length>0){
            const NextPrimary = ImageP[0];
            let UpdateisPrimary = true;
            const [Update] = await mysql.query('UPDATE images SET is_primary = ? WHERE id=?',[UpdateisPrimary,NextPrimary.id]);
            if(Update.affectedRows==0){
                throw new Error ("Something Went Wrong next Image is not aviable to Set as primary");
            }
        }
        
    }
    return deletedImage;
}