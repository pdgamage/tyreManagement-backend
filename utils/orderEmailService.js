// Simple and clean email service using Formspree
require('isomorphic-fetch');

async function sendOrderEmail(supplier, request, orderNotes = '') {
  try {
    console.log(`📧 Sending order email to supplier: ${supplier.name}`);

    // Validate inputs
    if (!supplier.formsfree_key) {
      throw new Error('Supplier does not have a Formspree key configured');
    }

    if (!request.requesterEmail) {
      throw new Error('Request does not have a valid requester email');
    }

    // Get Formspree URL
    let formspreeUrl = supplier.formsfree_key;
    if (!formspreeUrl.startsWith('https://formspree.io/f/')) {
      throw new Error('Invalid Formspree URL format');
    }

    // Create email message
    const emailMessage = `
TIRE ORDER REQUEST

Dear ${supplier.name},

We would like to place an order for tires with the following details:

VEHICLE INFORMATION:
• Vehicle Number: ${request.vehicleNumber}
• Brand: ${request.vehicleBrand}
• Model: ${request.vehicleModel}
• Year: ${request.year}

TIRE SPECIFICATIONS:
• Tire Size: ${request.tireSizeRequired}
• Quantity: ${request.quantity}
• Tubes Quantity: ${request.tubesQuantity}

REQUESTER DETAILS:
• Name: ${request.requesterName}
• Email: ${request.requesterEmail}
• Phone: ${request.requesterPhone}
• Section: ${request.userSection}

REQUEST INFORMATION:
• Request ID: ${request.id}
• Request Reason: ${request.requestReason}
• Order Notes: ${orderNotes || 'None'}

Please confirm receipt and provide pricing and delivery information.

Thank you,
Tire Management System
    `.trim();

    // Prepare form data for Formspree
    const formData = {
      email: request.requesterEmail,
      name: request.requesterName,
      subject: `Tire Order Request - Vehicle ${request.vehicleNumber}`,
      message: emailMessage
    };

    console.log(`📤 Sending to: ${formspreeUrl}`);

    // Send to Formspree
    const response = await fetch(formspreeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams(formData)
    });

    console.log(`📨 Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Formspree error:', errorText);
      throw new Error(`Formspree error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Email sent successfully');

    return {
      success: true,
      message: 'Order email sent successfully',
      supplier: supplier.name,
      email: supplier.email
    };

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
}

module.exports = {
  sendOrderEmail
};