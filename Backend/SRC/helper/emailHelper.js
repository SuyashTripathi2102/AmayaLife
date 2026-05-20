const nodemailer = require('nodemailer');

exports.verifyMail = async (to,subject,html)=>{

var transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  secure : false,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

const mailConfiguration = {
    from : process.env.EMAIL_FROM,
    to : to,
    subject : subject, 
    html : html
}
try{
    const info = await transporter.sendMail(mailConfiguration);
    console.log("email sent Successfully");
}catch(error){
    throw new Error (error.message);
}


}
