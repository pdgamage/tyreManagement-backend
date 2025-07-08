// Using built-in fetch API (Node.js 18+)

async function sendOrderEmail(supplier, request, orderNotes = '') {
  console.log('=== EMAIL SERVICE STARTED ===');
  console.log('Supplier:', supplier.name, '| Email:', supplier.email);
  console.log('Formspree Key:', supplier.formsfree_key);
  console.log('Request ID:', request.id, '| Vehicle:', request.vehicleNumber);
  try {
    console.log(`Sending order email to supplier: ${supplier.name} (${supplier.email})`);
    
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


    // Validate and extract Formspree form ID
    if (!supplier.formsfree_key) {
      throw new Error(`Supplier ${supplier.name} does not have a Formspree key configured`);
    }

    let formspreeId = supplier.formsfree_key;

    // Extract form ID from full URL if needed
    if (formspreeId.startsWith('http')) {
      const match = formspreeId.match(/\/f\/([a-zA-Z0-9]+)/);
      if (match) {
        formspreeId = match[1];
      } else {
        throw new Error(`Invalid Formspree URL format: ${formspreeId}`);
      }
    }

    const formspreeUrl = `https://formspree.io/f/${formspreeId}`;
    console.log('Final Formspree URL:', formspreeUrl);

    // Prepare comprehensive form data for Formspree
    const formFields = {
      // Core email fields (required by Formspree)
      subject: emailData.subject,
      message: emailData.message,
      _replyto: request.requesterEmail, // Reply-to requester, not system
      _subject: emailData.subject,

      // Order details
      request_id: request.id,
      vehicle_number: request.vehicleNumber,
      vehicle_brand: request.vehicleBrand,
      vehicle_model: request.vehicleModel,
      tire_size_required: request.tireSizeRequired,
      quantity: request.quantity,
      tubes_quantity: request.tubesQuantity,

      // Requester information
      requester_name: request.requesterName,
      requester_email: request.requesterEmail,
      requester_phone: request.requesterPhone,
      user_section: request.userSection,
      cost_center: request.costCenter,

      // Vehicle information
      present_km_reading: request.presentKmReading?.toLocaleString() || 'N/A',
      previous_km_reading: request.previousKmReading?.toLocaleString() || 'N/A',
      last_replacement_date: new Date(request.lastReplacementDate).toLocaleDateString(),
      tire_wear_pattern: request.tireWearPattern,
      existing_tire_make: request.existingTireMake,
      request_reason: request.requestReason,

      // Additional notes
      order_notes: orderNotes || 'No additional notes',
      comments: request.comments || 'N/A',

      // Metadata
      order_timestamp: new Date().toISOString(),
      supplier_name: supplier.name,
      supplier_email: supplier.email
    };

    console.log('Submitting to Formspree URL:', formspreeUrl);
    console.log('Form fields count:', Object.keys(formFields).length);

    const response = await fetch(formspreeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams(formFields)
    });

    console.log('=== FORMSPREE RESPONSE ===');
    console.log('Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('=== FORMSPREE ERROR ===');
      console.error('Status:', response.status, response.statusText);
      console.error('Error Response:', errorText);
      console.error('Form URL:', formspreeUrl);
      console.error('Supplier:', supplier.name, '|', supplier.email);

      // Provide specific error messages for common Formspree issues
      let errorMessage = `Formspree submission failed (${response.status})`;
      if (response.status === 422) {
        errorMessage += ' - Form validation error or unverified form';
      } else if (response.status === 429) {
        errorMessage += ' - Rate limit exceeded';
      } else if (response.status === 403) {
        errorMessage += ' - Form access denied';
      }

      throw new Error(`${errorMessage}: ${errorText}`);
    }

    const result = await response.json();
    console.log('=== EMAIL SUCCESS ===');
    console.log('Formspree response:', result);
    console.log('Email sent to supplier:', supplier.name, '|', supplier.email);
    
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
