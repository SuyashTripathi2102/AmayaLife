
const setRefreshCookie = (res, token) => {
    const isProd = process.env.ENV === 'production';
    res.cookie('refreshtoken', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};

const clearRefreshCookie = (res) => {
    const isProd = process.env.ENV === 'production';
    res.clearCookie('refreshtoken', {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/'
    });
};

const setCsrfCookie = (res, token) => {
    const isProd = process.env.ENV === 'production';
    res.cookie('csrf_token', token, {
        httpOnly: false,   // JS must be able to read this
        secure: isProd,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};

const clearCsrfCookie = (res) => {
    const isProd = process.env.ENV === 'production';
    res.clearCookie('csrf_token', {
        httpOnly: false,
        secure: isProd,
        sameSite: 'lax',
        path: '/'
    });
};
module.exports = { setRefreshCookie, clearRefreshCookie , setCsrfCookie ,clearCsrfCookie };

