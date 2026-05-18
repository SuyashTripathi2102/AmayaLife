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


exports.getAllProductsImages = async (req,res) =>{
    try{
        const productId = req.params.id;
        const data = await imageService.getAllProductsImages(productId);
        res.status(200).json({
                message:
                'Image Fetched for Product by id successfully',
                data
            });
    }catch(error){
            res.status(500).json({
                error: error.message
            });
        }
};

exports.deleteImagebyId = async (req,res)=>{
    try{
        const ImageId = req.params.id;
        const data = await imageService.deleteImagebyId(ImageId);
        res.status(200).json({
                message:
                'Image Deleted for Product by id successfully',
                data
            });
    }catch(error){
            res.status(500).json({
                error: error.message
            });
        }
}