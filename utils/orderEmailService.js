// Using isomorphic-fetch for compatibility
require('isomorphic-fetch');

async function sendOrderEmail(supplier, request, orderNotes = '') {
  try {
    console.log(`Sending order email to supplier: ${supplier.name} (${supplier.email})`);
    console.log('Supplier object:', JSON.stringify(supplier, null, 2));
    console.log('FormsFree key from supplier:', supplier.formsfree_key);

    // Prepare the email data
    const emailData = {
      // Supplier information
      supplier_name: supplier.name,
      supplier_email: supplier.email,
      supplier_phone: supplier.phone || 'N/A',
      
      // Request details
      request_id: request.id,
      vehicle_number: request.vehicleNumber,
      vehicle_brand: request.vehicleBrand,
      vehicle_model: request.vehicleModel,
      vehicle_year: request.year,
      
      // Requester information
      requester_name: request.requesterName,
      requester_email: request.requesterEmail,
      requester_phone: request.requesterPhone,
      user_section: request.userSection,
      
      // Tire specifications
      tire_size_required: request.tireSizeRequired,
      quantity: request.quantity,
      tubes_quantity: request.tubesQuantity,
      existing_tire_make: request.existingTireMake,
      tire_wear_pattern: request.tireWearPattern,
      cost_center: request.costCenter,
      
      // Vehicle readings
      present_km_reading: request.presentKmReading?.toLocaleString() || 'N/A',
      previous_km_reading: request.previousKmReading?.toLocaleString() || 'N/A',
      last_replacement_date: new Date(request.lastReplacementDate).toLocaleDateString(),
      
      // Request information
      request_reason: request.requestReason,
      comments: request.comments || 'N/A',
      order_notes: orderNotes || 'N/A',
      
      // Approval information
      supervisor_notes: request.supervisor_notes || 'N/A',
      technical_manager_notes: request.technical_manager_note || 'N/A',
      engineer_notes: request.engineer_note || 'N/A',
      
      // Order details
      order_date: new Date().toLocaleDateString(),
      order_time: new Date().toLocaleTimeString(),
      
      // Email subject and content
      subject: `Tire Order Request - Vehicle ${request.vehicleNumber} - Request #${request.id}`,
      message: `
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
      `.trim()
    };


    // Validate Formspree key exists
    if (!supplier.formsfree_key) {
      throw new Error('Supplier does not have a Formspree key configured');
    }

    // Handle both full URLs and form IDs
    let formspreeUrl = supplier.formsfree_key;
    console.log('Original Formspree key:', formspreeUrl);

    if (formspreeUrl.startsWith('https://formspree.io/f/')) {
      // Already a full URL, use as is
      console.log('Using full Formspree URL as provided');
    } else if (formspreeUrl.startsWith('http')) {
      // Extract the ID if a different URL format is stored
      const match = formspreeUrl.match(/\/f\/([a-zA-Z0-9]+)/);
      if (match) {
        formspreeUrl = `https://formspree.io/f/${match[1]}`;
        console.log('Extracted and rebuilt Formspree URL:', formspreeUrl);
      } else {
        throw new Error(`Invalid Formspree URL format: ${formspreeUrl}`);
      }
    } else {
      // Assume it's just the form ID
      if (!/^[a-zA-Z0-9]+$/.test(formspreeUrl)) {
        throw new Error(`Invalid Formspree key format: ${formspreeUrl}. Expected alphanumeric string or full URL.`);
      }
      formspreeUrl = `https://formspree.io/f/${formspreeUrl}`;
      console.log('Built Formspree URL from ID:', formspreeUrl);
    }

    console.log('Final Formspree URL:', formspreeUrl);
    const formData = {
      // Formspree will send the email to the form owner (supplier)
      // The 'email' field is the sender's email for reply purposes
      email: request.requesterEmail,
      name: request.requesterName,
      subject: emailData.subject,
      message: emailData.message,
      _replyto: request.requesterEmail,
      _subject: emailData.subject,

      // Additional order details
      supplier_name: supplier.name,
      supplier_email: supplier.email,
      vehicle_number: request.vehicleNumber,
      tire_size: request.tireSizeRequired,
      quantity: request.quantity,
      requester_name: request.requesterName,
      requester_email: request.requesterEmail,
      requester_phone: request.requesterPhone,
      user_section: request.userSection,
      cost_center: request.costCenter
    };

    console.log('Form fields to be sent:', JSON.stringify(formData, null, 2));

    const response = await fetch(formspreeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams(formData)
    });

    console.log('Formspree response status:', response.status);
    console.log('Formspree response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Formspree error response:', errorText);

      // Provide more specific error messages based on status code
      let errorMessage = `Formspree API error: ${response.status}`;
      if (response.status === 404) {
        errorMessage += ' - Invalid Formspree form ID. Please check the Formspree key in supplier settings.';
      } else if (response.status === 403) {
        errorMessage += ' - Access denied. Please verify the Formspree form is active and accessible.';
      } else if (response.status === 422) {
        errorMessage += ' - Invalid form data. Please check the email format and required fields.';
      } else {
        errorMessage += ' - Please check the Formspree key format in supplier settings.';
      }

      throw new Error(errorMessage);
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
