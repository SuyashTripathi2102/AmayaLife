const mysql = require('../config/db');
const cloudinary = require('../config/cloudinaryConfig');
const { uploadToCloudinary } = require('../helper/cloudinaryHelper');
const AppError = require('../utils/AppError');

exports.uploadProductImage = async (productId, fileBuffer, isPrimary = false) => {
    const { url, publicId } = await uploadToCloudinary(fileBuffer);
    const connection = await mysql.getConnection();
    try {
        await connection.beginTransaction();
        const [existingImages] = await connection.query(
            `SELECT COUNT(*) as total FROM images WHERE product_id = ?`,
            [productId]
        );
        const totalImages = existingImages[0].total;
        if (totalImages === 0) {
            isPrimary = true;
        }
        if (isPrimary) {
            await connection.query(`UPDATE images SET is_primary = false WHERE product_id = ?`, [productId]);
        }
        const [result] = await connection.query(
            `INSERT INTO images (product_id, image_url, public_id, is_primary) VALUES (?,?,?,?)`,
            [productId, url, publicId, isPrimary]
        );
        await connection.commit();
        return { imageId: result.insertId, productId, imageUrl: url, publicId, isPrimary };
    } catch (error) {
        await connection.rollback();
        if (publicId) {
            await cloudinary.uploader.destroy(publicId);
        }
        throw error;
    } finally {
        connection.release();
    }
};

exports.getAllProductsImages = async (productId) => {
    const [result] = await mysql.query(
        'SELECT * FROM images WHERE product_id = ? ORDER BY is_primary DESC',
        [productId]
    );
    if (result.length == 0) {
        throw new AppError('No Images Found, please contact Admin', 404);
    }
    return result;
};

exports.deleteImagebyId = async (ImageId) => {
    const [isExist] = await mysql.query(
        'SELECT public_id, is_primary, product_id FROM images WHERE id = ?',
        [ImageId]
    );
    if (isExist.length == 0) {
        throw new AppError('Image does not exist for this product', 404);
    }
    const imageProduct = isExist[0];
    const [deletedImage] = await mysql.query('DELETE FROM images WHERE id=?', [ImageId]);
    if (deletedImage.affectedRows == 0) {
        throw new AppError('Something Went Wrong', 500);
    }
    if (imageProduct.public_id) {
        await cloudinary.uploader.destroy(imageProduct.public_id);
    }
    if (imageProduct.is_primary) {
        const [nextImage] = await mysql.query(
            'SELECT id FROM images WHERE product_id=? ORDER BY created_at ASC LIMIT 1',
            [imageProduct.product_id]
        );
        if (nextImage.length > 0) {
            const [update] = await mysql.query(
                'UPDATE images SET is_primary = ? WHERE id=?',
                [true, nextImage[0].id]
            );
            if (update.affectedRows == 0) {
                throw new AppError('Something Went Wrong setting next image as primary', 500);
            }
        }
    }
    return deletedImage;
};
