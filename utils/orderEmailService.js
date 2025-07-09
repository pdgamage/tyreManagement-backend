// Using built-in fetch API (Node.js 18+)

async function sendOrderEmail(supplier, request, orderNotes = '') {
  try {
    console.log(`Sending order email to supplier: ${supplier.name} (${supplier.email})`);
    
    // Validate supplier email
    if (!supplier.email || !isValidEmail(supplier.email)) {
      throw new Error(`Invalid supplier email address: ${supplier.email}`);
    }

    // Validate requester email if being used in _replyto
    if (request.requesterEmail && !isValidEmail(request.requesterEmail)) {
      console.warn('Requester email is invalid, using default noreply address');
      request.requesterEmail = 'noreply@tyremanagement.com';
    }

    // Prepare the email data (your existing emailData preparation remains the same)
    const emailData = {
      subject: `New Tyre Request from ${request.requesterName}`,
      message: `
        <h1>New Tyre Request</h1>
        <p>A new tyre request has been submitted by ${request.requesterName}.</p>
        <h2>Request Details:</h2>
        <ul>
          <li><strong>Vehicle Number:</strong> ${request.vehicleNumber}</li>
          <li><strong>Tyre Size Required:</strong> ${request.tireSizeRequired}</li>
          <li><strong>Quantity:</strong> ${request.quantity}</li>
          <li><strong>Requester Name:</strong> ${request.requesterName}</li>
          <li><strong>Requester Email:</strong> ${request.requesterEmail}</li>
        </ul>
        <h2>Order Notes:</h2>
        <p>${orderNotes || 'No additional notes.'}</p>
      `
    };

    // Process FormsFree URL
    let formspreeUrl = supplier.formsfree_key;
    if (!formspreeUrl) {
      throw new Error('No FormsFree key configured for this supplier');
    }

    if (formspreeUrl.startsWith('http')) {
      const match = formspreeUrl.match(/\/f\/([a-zA-Z0-9]+)/);
      formspreeUrl = match ? match[1] : formspreeUrl;
    }
    
    formspreeUrl = `https://formspree.io/f/${formspreeUrl}`;

    console.log('Sending to FormsFree URL:', formspreeUrl);
    
    // Prepare form data
    const formData = new URLSearchParams();
    formData.append('email', supplier.email);
    formData.append('subject', emailData.subject);
    formData.append('message', emailData.message);
    formData.append('_replyto', request.requesterEmail || 'noreply@tyremanagement.com');
    formData.append('_subject', emailData.subject);
    
    // Add additional fields if needed
    if (request.vehicleNumber) formData.append('vehicle_number', request.vehicleNumber);
    if (request.tireSizeRequired) formData.append('tire_size', request.tireSizeRequired);
    if (request.quantity) formData.append('quantity', request.quantity);
    if (request.requesterName) formData.append('requester_name', request.requesterName);
    if (request.requesterEmail) formData.append('requester_email', request.requesterEmail);

    console.log('Form fields:', Object.fromEntries(formData));

    const response = await fetch(formspreeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: formData
    });

    console.log('FormsFree response status:', response.status);

    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorResponse = await response.json();
        errorDetails = JSON.stringify(errorResponse);
      } catch (e) {
        errorDetails = await response.text();
      }
      
      throw new Error(`FormsFree API error: ${response.status} - ${errorDetails}`);
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
    throw new Error(`Failed to send order email to ${supplier.name}: ${error.message}`);
  }
}

// Helper function to validate email format
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

module.exports = {
  sendOrderEmail
};

