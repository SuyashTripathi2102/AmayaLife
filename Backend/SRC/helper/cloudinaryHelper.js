const cloudinary =
require('../config/cloudinaryConfig');

const uploadToCloudinary = async (fileBuffer)=>{
    return new Promise((resolve,reject)=>{
        const stream = cloudinary.uploader.upload_stream({
                folder: 'products'
            },
            (error,result)=>{

                if(error){

                    reject(error);

                }else{

                    resolve({

                        url: result.secure_url,

                        publicId: result.public_id
                    });
                }
            }
        );

        // send buffer directly
        stream.end(fileBuffer);
    });
};

module.exports = {
    uploadToCloudinary
};