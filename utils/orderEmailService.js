
// Minimal, robust supplier order email service for Formspree
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function sendOrderEmail(supplier, request, orderNotes = '') {
  // 1. Get the correct Formspree endpoint
  let formspreeUrl = supplier.formsfree_key;
  if (formspreeUrl.startsWith('http')) {
    const match = formspreeUrl.match(/\/f\/([a-zA-Z0-9]+)/);
    formspreeUrl = match ? match[1] : formspreeUrl;
  }
  formspreeUrl = `https://formspree.io/f/${formspreeUrl}`;

  // 2. Compose the message
  const subject = `Tire Order Request - Vehicle ${request.vehicleNumber} - Request #${request.id}`;
  const message = `
Dear ${supplier.name},

We would like to place an order for tires with the following specifications:

VEHICLE INFORMATION:
- Vehicle Number: ${request.vehicleNumber}
- Brand: ${request.vehicleBrand}
- Model: ${request.vehicleModel}
- Year: ${request.year}

TIRE SPECIFICATIONS:
- Tire Size Required: ${request.tireSizeRequired}
- Quantity: ${request.quantity}
- Tubes Quantity: ${request.tubesQuantity}
- Existing Tire Make: ${request.existingTireMake}

VEHICLE DETAILS:
- Present KM Reading: ${request.presentKmReading?.toLocaleString() || 'N/A'}
- Previous KM Reading: ${request.previousKmReading?.toLocaleString() || 'N/A'}
- Last Replacement Date: ${new Date(request.lastReplacementDate).toLocaleDateString()}
- Tire Wear Pattern: ${request.tireWearPattern}

REQUESTER INFORMATION:
- Name: ${request.requesterName}
- Email: ${request.requesterEmail}
- Phone: ${request.requesterPhone}
- Section: ${request.userSection}
- Cost Center: ${request.costCenter}

REQUEST DETAILS:
- Request ID: ${request.id}
- Request Reason: ${request.requestReason}
- Comments: ${request.comments || 'N/A'}
- Order Notes: ${orderNotes || 'N/A'}

APPROVAL HISTORY:
- Supervisor Notes: ${request.supervisor_notes || 'N/A'}
- Technical Manager Notes: ${request.technical_manager_note || 'N/A'}
- Engineer Notes: ${request.engineer_note || 'N/A'}

Please confirm receipt of this order and provide:
1. Availability of the requested tires
2. Pricing information
3. Expected delivery timeline
4. Any additional requirements

Thank you for your service.

Best regards,
Tire Management System
Order Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
  `.trim();

  // 3. Prepare the form fields (minimal required for Formspree)
  const formFields = {
    email: request.requesterEmail,
    _subject: subject,
    message: message
  };

  // 4. Send the request
  const response = await fetch(formspreeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: new URLSearchParams(formFields)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`FormsFree API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return {
    success: true,
    message: 'Order email sent successfully',
    supplier: supplier.name,
    email: supplier.email,
    formsfree_response: result
  };
}

module.exports = {
  sendOrderEmail
};
