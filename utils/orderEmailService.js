// Using isomorphic-fetch for Node.js compatibility
const fetch = require('isomorphic-fetch');

async function sendOrderEmail(supplier, request, orderNotes = '', orderNumber = '') {
  try {
    console.log(`Sending order email to supplier: ${supplier.name} (${supplier.email})`);
    
    // Create email subject
    const emailSubject = `🚛 Tire Order Request - Vehicle ${request.vehicleNumber} - Order #${orderNumber} - Request #${request.id}`;

    // Add order details at the top of the message
    const orderDetails = `
ORDER DETAILS:
-------------
Order Number: ${orderNumber}
Order Notes: ${orderNotes || 'N/A'}
Request ID: ${request.id}
`;


    // Handle different formats of formsfree_key
    let formspreeUrl = supplier.formsfree_key.trim();

    // If it's already a full URL, use it directly
    if (formspreeUrl.startsWith('https://formspree.io/f/')) {
      // Already in correct format
    } else if (formspreeUrl.startsWith('http')) {
      // Some other URL format, extract the form ID
      const match = formspreeUrl.match(/\/f\/([a-zA-Z0-9]+)/);
      if (match) {
        formspreeUrl = `https://formspree.io/f/${match[1]}`;
      } else {
        throw new Error('Invalid Formspree URL format');
      }
    } else {
      // Just the form ID, construct the full URL
      formspreeUrl = `https://formspree.io/f/${formspreeUrl}`;
    }

    console.log('Sending to Formspree URL:', formspreeUrl);
    console.log('Supplier details:', {
      name: supplier.name,
      email: supplier.email,
      formsfree_key: supplier.formsfree_key
    });

    // Debug order notes
    console.log('Order notes received:', {
      orderNotes: orderNotes,
      type: typeof orderNotes,
      length: orderNotes ? orderNotes.length : 0,
      trimmed: orderNotes ? orderNotes.trim() : 'null/undefined'
    });

    // Check if we should include notes
    const shouldIncludeNotes = orderNotes &&
                              orderNotes.trim() !== '' &&
                              orderNotes.trim().toLowerCase() !== 'ok' &&
                              orderNotes.trim() !== 'N/A' &&
                              orderNotes.trim() !== 'None';

    console.log('Should include notes:', shouldIncludeNotes);

    // Create simple delivery paragraph
    let deliveryParagraph = '';

    // Check if any delivery fields exist
    if (request.deliveryOfficeName || request.deliveryStreetName || request.deliveryTown) {
      const deliveryParts = [];

      if (request.deliveryOfficeName) {
        deliveryParts.push(request.deliveryOfficeName);
      }
      if (request.deliveryStreetName) {
        deliveryParts.push(request.deliveryStreetName);
      }
      if (request.deliveryTown) {
        deliveryParts.push(request.deliveryTown);
      }

      if (deliveryParts.length > 0) {
        deliveryParagraph = `\n\nPlease arrange delivery to: ${deliveryParts.join(', ')}.`;
      }
    }

    // Create a beautiful professional business letter format
    const professionalMessage = `
Dear ${supplier.name},

I hope this message finds you well. This is an official tire order from SLT Mobitel.

ORDER DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ORDER NUMBER: ${orderNumber}
REQUEST ID: ${request.id}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRODUCT SPECIFICATIONS:
• Vehicle Number: ${request.vehicleNumber}
• Tire Size Required: ${request.tireSizeRequired}
    • Quantity: ${request.quantity} tire${request.quantity > 1 ? 's' : ''}${request.tubesQuantity > 0 ? ` and ${request.tubesQuantity} tube${request.tubesQuantity > 1 ? 's' : ''}` : ''}${deliveryParagraph}

${shouldIncludeNotes ? `Additional Requirements: ${orderNotes.trim()}\n` : ''}We would greatly appreciate if you could provide us with your most competitive pricing along with your delivery schedule and terms of service. Your prompt response would be highly valued as we aim to maintain our fleet operations efficiently.

Thank you for your continued partnership and support. We look forward to hearing from you soon.

Warm regards,

${request.requesterName}
${request.userSection}
SLT Mobitel

Contact Information:
Phone: ${request.requesterPhone}
Email: ${request.requesterEmail}
    `.trim();

    // Prepare the email payload for Formspree - only the essential message
    const formspreePayload = {
      email: supplier.email,
      subject: emailSubject,
      message: professionalMessage
    };

    console.log('Final email message being sent:');
    console.log('=================================');
    console.log(professionalMessage);
    console.log('=================================');

    console.log('Formspree payload keys:', Object.keys(formspreePayload));

    const response = await fetch(formspreeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formspreePayload)
    });

    console.log('Formspree response status:', response.status);
    console.log('Formspree response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Formspree error response:', errorText);
      console.error('Formspree error status:', response.status);
      console.error('Formspree error statusText:', response.statusText);

      // Try to parse error as JSON if possible
      let errorDetails = errorText;
      try {
        errorDetails = JSON.parse(errorText);
      } catch (e) {
        // Keep as text if not JSON
      }

      throw new Error(`Formspree API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorDetails)}`);
    }

    const result = await response.json();
    console.log('Order email sent successfully:', result);
    
    return {
      success: true,
      message: 'Order email sent successfully',
      supplier: supplier.name,
      email: supplier.email,
      formsfree_response: result
    };

  } catch (error) {
    console.error('Error sending order email:', error);
    throw new Error(`Failed to send order email: ${error.message}`);
  }
}

module.exports = {
  sendOrderEmail
};
