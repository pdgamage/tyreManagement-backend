const axios = require('axios');

async function sendOrderEmail(supplier, request, orderNotes) {
  const formspreeEndpoint = `https://formspree.io/f/${supplier.formsfree_key}`;

  const emailData = {
    to: supplier.email,
    subject: `New Tyre Order - Request ID: ${request.id}`,
    html: `
      <h1>New Tyre Order</h1>
      <p>A new tyre order has been placed for the following request:</p>
      <ul>
        <li><strong>Request ID:</strong> ${request.id}</li>
        <li><strong>Vehicle Number:</strong> ${request.vehicleNumber}</li>
        <li><strong>Quantity:</strong> ${request.quantity}</li>
        <li><strong>Tire Size:</strong> ${request.tireSize}</li>
        <li><strong>Requester:</strong> ${request.requesterName}</li>
      </ul>
      <h2>Order Notes:</h2>
      <p>${orderNotes}</p>
    `,
  };

  try {
    const response = await axios.post(formspreeEndpoint, emailData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error sending email via Formspree:', error);
    throw new Error('Failed to send order email');
  }
}

module.exports = { sendOrderEmail };