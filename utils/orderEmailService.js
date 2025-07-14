// Using isomorphic-fetch for Node.js compatibility
const fetch = require('isomorphic-fetch');

async function sendOrderEmail(supplier, request, orderNotes = '') {
  try {
    console.log(`Sending order email to supplier: ${supplier.name} (${supplier.email})`);
    
    // Create email subject
    const emailSubject = `🚛 Tire Order Request - Vehicle ${request.vehicleNumber} - Request #${request.id}`;


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

    // Create delivery address paragraph
    const deliveryAddress = [];
    if (request.deliveryOfficeName) deliveryAddress.push(request.deliveryOfficeName);
    if (request.deliveryStreetName) deliveryAddress.push(request.deliveryStreetName);
    if (request.deliveryTown) deliveryAddress.push(request.deliveryTown);

    const deliveryText = deliveryAddress.length > 0
      ? `\n\nDelivery Address: ${deliveryAddress.join(', ')}`
      : '';

    // Create a professional business letter format
    const professionalMessage = `
Dear ${supplier.name},

We require a quotation for tire supply to our vehicle fleet.

Vehicle Number: ${request.vehicleNumber}
Tire Size: ${request.tireSizeRequired}
Quantity Required: ${request.quantity} tires${request.tubesQuantity > 0 ? ` and ${request.tubesQuantity} tubes` : ''}${deliveryText}
${shouldIncludeNotes ? `\nNote: ${orderNotes.trim()}` : ''}

Please provide your best pricing and delivery schedule.

Regards,
${request.requesterName}
${request.userSection}
SLT Mobitel
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
