const mysql = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { verifyMail } = require('../helper/emailHelper');
const AppError = require('../utils/AppError');

function getAppUrl() {
    return process.env.APP_URL || `http://localhost:${process.env.PORT}`;
}

function getGoogleClient() {
    return new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
}

exports.register = async (userdata) => {
    const { name, email, password, phoneNo, role } = userdata;
    if (!name || !email || !password || !phoneNo) {
        throw new AppError("User Info Missing pls Enter Info properly", 400);
    }
    const [ifExist] = await mysql.query("SELECT * FROM users WHERE email = ?", [email]);
    if (ifExist.length > 0) {
        throw new AppError("User already exist with this email", 409);
    }
    const userRole = role || 'customer';
    const hashedpassword = await bcrypt.hash(password, 10);
    const [result] = await mysql.query(
        "INSERT INTO users (name,email,password,phoneNo,role,is_email_verified,two_factor_enabled) VALUES (?,?,?,?,?,?,?)",
        [name, email, hashedpassword, phoneNo, userRole, false, false]
    );
    const verifyToken = jwt.sign({ id: result.insertId, name }, process.env.JWT_SECRET, { expiresIn: '5m' });
    const verifyURL = `${getAppUrl()}/api/users/auth/verify-email?token=${verifyToken}`;
    await verifyMail(
        email,
        "EMAIL Verification Mail",
        `<p>please verify your email by clicking the link:</p>
        <p><a href="${verifyURL}">${verifyURL}</a></p>`
    );
    return { id: result.insertId, name, email, phoneNo, role, isEmailVerified: false };
};

exports.verifyMailHandler = async (userData) => {
    const { token } = userData;
    if (!token) {
        throw new AppError("Token is missing", 400);
    }
    const playload = jwt.verify(token, process.env.JWT_SECRET);
    const [user] = await mysql.query('SELECT * FROM users WHERE id=?', [playload.id]);
    if (user.length === 0) {
        throw new AppError("User not found", 404);
    }
    if (user[0].is_email_verified) {
        return true;
    }
    const [updateEmailVerification] = await mysql.query(
        "UPDATE users SET is_email_verified = ? WHERE id=?",
        [true, playload.id]
    );
    if (updateEmailVerification.affectedRows == 0) {
        throw new AppError('Something Went Wrong to store Verifying Email in DB', 500);
    }
    return true;
};

exports.login = async (userdata) => {
    const { email, password } = userdata;
    if (!email || !password) {
        throw new AppError("Email and password are required", 400);
    }
    const [ifExist] = await mysql.query("SELECT * FROM users WHERE email = ?", [email]);
    if (ifExist.length === 0) {
        throw new AppError("User not found with this email", 404);
    }
    const user = ifExist[0];
    const ispasswordMatch = await bcrypt.compare(password, user.password);
    if (!ispasswordMatch) {
        throw new AppError("Password is not match", 401);
    }
    if (!user.is_email_verified) {
        throw new AppError("Email is not verified Pls verify first", 403);
    }
    const Accesstoken = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const Refershtoken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return {
        Accesstoken,
        Refershtoken,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            isEmailVerified: user.is_email_verified,
            twoFactorEnabled: user.two_factor_enabled
        }
    };
};

exports.refershToken = async (token) => {
    if (!token) {
        throw new AppError('Refersh Token is not Present pls check', 401);
    }
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = decode;
    const [ifExist] = await mysql.query("SELECT * FROM users WHERE id = ?", [id]);
    if (ifExist.length === 0) {
        throw new AppError("User not found with this id", 404);
    }
    const user = ifExist[0];
    const newAccessToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return newAccessToken;
};

exports.forgetPassword = async (userData) => {
    const { email } = userData;
    if (!email) {
        throw new AppError("EMAIL IS REQUIRED", 400);
    }
    const [ifExist] = await mysql.query("SELECT * FROM users WHERE email = ?", [email]);
    if (ifExist.length === 0) {
        throw new AppError("User not found with this email", 404);
    }
    const user = ifExist[0];
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const RestPassExpire = new Date(Date.now() + 15 * 60 * 1000);
    const [update] = await mysql.query(
        "UPDATE users SET reset_password_token=?, reset_password_expires=? WHERE email=?",
        [hashedToken, RestPassExpire, email]
    );
    if (update.affectedRows == 0) {
        throw new AppError("Something went wrong", 500);
    }
    const restURL = `${getAppUrl()}/api/users/auth/reset-password?token=${rawToken}`;
    await verifyMail(
        user.email,
        "RESET YOUR PASSWORD",
        `<p>Pls reset your password by clicking below link</p>
        <p><a href='${restURL}'>${restURL}</a></p>`
    );
    return update;
};

exports.resetPassword = async (userData, token) => {
    const { Newpassword } = userData;
    if (!Newpassword || Newpassword.length < 6) {
        throw new AppError("Pls provide atleast 6 character new passwords for reset", 400);
    }
    if (!token) {
        throw new AppError("Token is missing", 400);
    }
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const [ifExist] = await mysql.query(
        'SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()',
        [tokenHash]
    );
    if (ifExist.length == 0) {
        throw new AppError("Token expired or invalid", 400);
    }
    const user = ifExist[0];
    const newpasswordUpdate = await bcrypt.hash(Newpassword, 10);
    const [Update] = await mysql.query(
        "UPDATE users SET password = ?, reset_password_token = ?, reset_password_expires = ? WHERE id = ?",
        [newpasswordUpdate, null, null, user.id]
    );
    if (Update.affectedRows == 0) {
        throw new AppError("RESET Password Failed", 500);
    }
    return Update;
};

exports.getAllUsers = async () => {
    const [getAll] = await mysql.query("SELECT id, name, email, phoneNo, role FROM users");
    return { data: getAll };
};

exports.getUserbyId = async (userId) => {
    const { id } = userId;
    const [isExist] = await mysql.query("SELECT name,email,phoneNo,role FROM users WHERE id=?", [id]);
    if (isExist.length == 0) {
        throw new AppError("User does not exist", 404);
    }
    return isExist;
};

exports.updateUserbyId = async (userId, userData) => {
    const { id } = userId;
    const { name, email, phoneNo, role } = userData;
    const [updateUser] = await mysql.query(
        "UPDATE users SET name=?,email=?,phoneNo=?,role=? WHERE id=?",
        [name, email, phoneNo, role, id]
    );
    if (updateUser.affectedRows === 0) {
        throw new AppError("User does not exist", 404);
    }
    return { id, name, email, phoneNo, role };
};

exports.patchUserbyId = async (userId, userData) => {
    const { id } = userId;
    const { name, email, phoneNo, role } = userData;
    const [isExist] = await mysql.query("SELECT * FROM users WHERE id=?", [id]);
    if (isExist.length == 0) {
        throw new AppError("User does not exist", 404);
    }
    const existingUser = isExist[0];
    const updatedName = name || existingUser.name;
    const updatedEmail = email || existingUser.email;
    const updatedPhoneNo = phoneNo || existingUser.phoneNo;
    const updatedRole = role || existingUser.role;
    const [updateUser] = await mysql.query(
        "UPDATE users SET name=?,email=?,phoneNo=?,role=? WHERE id=?",
        [updatedName, updatedEmail, updatedPhoneNo, updatedRole, id]
    );
    return updateUser;
};

exports.deleteUserbyId = async (userId) => {
    const { id } = userId;
    const [isExist] = await mysql.query("SELECT * FROM users WHERE id=?", [id]);
    if (isExist.length == 0) {
        throw new AppError("User does not exist", 404);
    }
    const [deleteUser] = await mysql.query("DELETE FROM users WHERE id=?", [id]);
    return deleteUser;
};

exports.googleAuthStartHandler = () => {
    const client = getGoogleClient();
    const url = client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: ['openid', 'email', 'profile']
    });
    return url;
};

exports.googleAuthCallbackHandler = async (code) => {
    const client = getGoogleClient();
    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID
    });
    const { email, name, sub } = ticket.getPayload();
    const [ifExist] = await mysql.query(
        'SELECT * FROM users WHERE google_id = ? OR email = ?',
        [sub, email]
    );
    let user;
    if (ifExist.length > 0) {
        user = ifExist[0];
    } else {
        const [result] = await mysql.query(
            'INSERT INTO users (name, email, google_id, auth_provider, is_email_verified, two_factor_enabled) VALUES (?,?,?,?,?,?)',
            [name, email, sub, 'google', true, false]
        );
        const [newUser] = await mysql.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
        user = newUser[0];
    }
    const Accesstoken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
    const Refershtoken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
    return {
        Accesstoken,
        Refershtoken,
        user: { id: user.id, email: user.email, role: user.role }
    };
};
