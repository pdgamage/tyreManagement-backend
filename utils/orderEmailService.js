// Using built-in fetch API (Node.js 18+)

async function sendOrderEmail(supplier, request, orderNotes = '') {
  try {
    console.log(`Sending order email to supplier: ${supplier.name} (${supplier.email})`);
    
    // Prepare the email data
    const emailData = {
      // Supplier information
      supplier_name: supplier.name,
      supplier_email: supplier.email,
      supplier_phone: supplier.phone || '',
      
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


    // Ensure the formsfree_key is just the ID, not a full URL
    let formspreeUrl = supplier.formsfree_key;
    if (formspreeUrl.startsWith('http')) {
      // Extract the ID if a full URL is stored
      const match = formspreeUrl.match(/\/f\/([a-zA-Z0-9]+)/);
      formspreeUrl = match ? match[1] : formspreeUrl;
    }
    // Always use the correct URL format
    formspreeUrl = `https://formspree.io/f/${formspreeUrl}`;

    console.log('Sending to FormsFree URL:', formspreeUrl);
    console.log('Form fields:', {
      email: supplier.email,
      subject: emailData.subject,
      message: emailData.message,
      _replyto: 'noreply@tyremanagement.com',
      _subject: emailData.subject,
      vehicle_number: request.vehicleNumber,
      tire_size: request.tireSizeRequired,
      quantity: request.quantity,
      requester_name: request.requesterName,
      requester_email: request.requesterEmail
    });

    const response = await fetch(formspreeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: request.requesterName,
        email: request.requesterEmail,
        message: emailData.message,
        _replyto: 'noreply@tyremanagement.com',
        _subject: emailData.subject,
        vehicle_number: request.vehicleNumber,
        tire_size: request.tireSizeRequired,
        quantity: request.quantity,
        supplier_email: supplier.email // custom field for tracking
      })
    });

    console.log('FormsFree response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FormsFree error response:', errorText);
      throw new Error(`FormsFree API error: ${response.status} - Please check the FormsFree key format in supplier settings.`);
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
