const imageService =
require('../services/cloudImageServices');

exports.uploadProductImage = async (req,res)=>{
    try{
        // product id from params
        const productId = req.params.id;

if(!req.file){
    return res.status(400).json({ message: 'No image file provided' });
}

        // uploaded image buffer
        const fileBuffer = req.file.buffer;

        //is primary
        const isPrimary = req.body.is_primary==='true';

        // call service
        const data = await imageService.uploadProductImage(productId,fileBuffer,isPrimary);
        res.status(201).json({
            message:
            'Image uploaded successfully',
            data
        });
    }catch(error){
        res.status(500).json({
            error: error.message
        });
    }
};