const cron = require('node-cron');
const mysql = require('../config/db');

cron.schedule('*/30 * * * *', async () => {
    try {
        const [result] = await mysql.query(
            `UPDATE orders 
             SET status = 'cancelled' 
             WHERE status = 'pending' 
             AND razorpay_order_id IS NULL 
             AND created_at < NOW() - INTERVAL 30 MINUTE`
        );
        console.log(`Cron ran: ${result.affectedRows} orders auto-cancelled`);
    } catch (error) {
        console.error('Cron job failed:', error.message);
    }
});

