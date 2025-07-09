const fetch = require('isomorphic-fetch');

/**
 * Send order email to supplier using Formspree
 * @param {Object} orderData - Order details
 * @param {Object} supplier - Supplier information with formsfree_key
 * @param {string} orderNotes - Optional order notes
 * @returns {Promise<boolean>} - Success status
 */
async function sendOrderEmail(orderData, supplier, orderNotes = '') {
  try {
    if (!supplier.formsfree_key) {
      throw new Error('Supplier does not have a Formspree key configured');
    }

    // Prepare email content
    const emailData = {
      to: supplier.email,
      subject: `New Tire Order - Request #${orderData.id}`,
      message: `
Dear ${supplier.name},

We would like to place the following tire order:

ORDER DETAILS:
- Request ID: #${orderData.id}
- Vehicle: ${orderData.vehicleNumber}
- Tire Size: ${orderData.tireSize}
- Quantity: ${orderData.quantity}
- Tubes: ${orderData.tubesQuantity}

VEHICLE INFORMATION:
- Vehicle Number: ${orderData.vehicleNumber}
- Make: ${orderData.vehicleBrand}
- Model: ${orderData.vehicleModel}
- Year: ${orderData.year}

${orderNotes ? `SPECIAL INSTRUCTIONS:\n${orderNotes}\n` : ''}

Please confirm receipt of this order and provide delivery timeline.

Best regards,
SLT Mobitel Tire Management Team
      `,
      _replyto: 'noreply@sltmobitel.lk',
      _subject: `New Tire Order - Request #${orderData.id}`,
    };

    // Send email via Formspree
    const response = await fetch(supplier.formsfree_key, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      throw new Error(`Formspree API error: ${response.status} ${response.statusText}`);
    }

    console.log(`Order email sent successfully to ${supplier.email}`);
    return true;
  } catch (error) {
    console.error('Error sending order email:', error);
    throw error;
  }
}

module.exports = {
  sendOrderEmail,
};