// Using isomorphic-fetch for Node.js compatibility
const fetch = require('isomorphic-fetch');

async function sendOrderEmail(supplier, request, orderNotes = '') {
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
      subject: `🚛 Tire Order Request - Vehicle ${request.vehicleNumber} - Request #${request.id}`,
      plainTextMessage: `
TIRE ORDER REQUEST - Request #${request.id}

Dear ${supplier.name},

We would like to place an order for tires with the following specifications:

═══════════════════════════════════════════════════════════════
🚗 VEHICLE INFORMATION
═══════════════════════════════════════════════════════════════
• Vehicle Number: ${request.vehicleNumber}
• Brand & Model: ${request.vehicleBrand} ${request.vehicleModel}
• Year: ${request.year}
• Present KM Reading: ${request.presentKmReading?.toLocaleString() || 'N/A'}

═══════════════════════════════════════════════════════════════
🛞 TIRE SPECIFICATIONS
═══════════════════════════════════════════════════════════════
• Tire Size Required: ${request.tireSizeRequired}
• Quantity: ${request.quantity}
• Tubes Quantity: ${request.tubesQuantity}
• Existing Tire Make: ${request.existingTireMake}
• Tire Wear Pattern: ${request.tireWearPattern}

═══════════════════════════════════════════════════════════════
👤 REQUESTER INFORMATION
═══════════════════════════════════════════════════════════════
• Name: ${request.requesterName}
• Email: ${request.requesterEmail}
• Phone: ${request.requesterPhone}
• Department: ${request.userSection}
• Cost Center: ${request.costCenter}

${orderNotes && orderNotes !== 'N/A' ? `
═══════════════════════════════════════════════════════════════
📝 SPECIAL ORDER NOTES
═══════════════════════════════════════════════════════════════
${orderNotes}
` : ''}

═══════════════════════════════════════════════════════════════
📋 REQUIRED INFORMATION
═══════════════════════════════════════════════════════════════
Please confirm receipt of this order and provide:

1. TIRE AVAILABILITY - Confirm stock status for the requested tire size
2. PRICING INFORMATION - Unit price and total cost including taxes
3. DELIVERY TIMELINE - Expected delivery date and time
4. PAYMENT TERMS - Preferred payment method and terms
5. INSTALLATION SERVICES - If available, please include installation options

═══════════════════════════════════════════════════════════════
📞 CONTACT INFORMATION
═══════════════════════════════════════════════════════════════
For any questions regarding this order, please contact:
${request.requesterName} | ${request.requesterEmail} | ${request.requesterPhone}

Thank you for your service.

Best regards,
Tire Management System
Order Date: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
Request ID: #${request.id}
      `.trim(),
      message: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tire Order Request</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 5px 0 0 0; opacity: 0.9; }
        .section { margin-bottom: 25px; }
        .section-title { background: #f8f9fa; padding: 12px 15px; border-left: 4px solid #667eea; font-weight: bold; color: #2c3e50; margin-bottom: 15px; border-radius: 0 5px 5px 0; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
        .info-item { background: #f8f9fa; padding: 12px; border-radius: 5px; border: 1px solid #e9ecef; }
        .info-label { font-weight: bold; color: #495057; margin-bottom: 5px; }
        .info-value { color: #6c757d; }
        .highlight { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; border-radius: 0 5px 5px 0; margin: 15px 0; }
        .action-items { background: #f0f8ff; padding: 20px; border-radius: 8px; border: 2px solid #4a90e2; }
        .action-items h3 { color: #2c5aa0; margin-top: 0; }
        .action-items ol { margin: 10px 0; padding-left: 20px; }
        .action-items li { margin-bottom: 8px; color: #34495e; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee; color: #7f8c8d; }
        .contact-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px; }
        @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚛 Tire Order Request</h1>
            <p>Request #${request.id} | Vehicle ${request.vehicleNumber}</p>
        </div>

        <p>Dear <strong>${supplier.name}</strong>,</p>
        <p>We would like to place an order for tires with the following specifications. Please review the details below and confirm availability.</p>

        <div class="section">
            <div class="section-title">🚗 Vehicle Information</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Vehicle Number</div>
                    <div class="info-value">${request.vehicleNumber}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Brand & Model</div>
                    <div class="info-value">${request.vehicleBrand} ${request.vehicleModel}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Year</div>
                    <div class="info-value">${request.year}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Present KM Reading</div>
                    <div class="info-value">${request.presentKmReading?.toLocaleString() || 'N/A'}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">🛞 Tire Specifications</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Tire Size Required</div>
                    <div class="info-value"><strong>${request.tireSizeRequired}</strong></div>
                </div>
                <div class="info-item">
                    <div class="info-label">Quantity</div>
                    <div class="info-value"><strong>${request.quantity}</strong></div>
                </div>
                <div class="info-item">
                    <div class="info-label">Tubes Quantity</div>
                    <div class="info-value">${request.tubesQuantity}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Existing Tire Make</div>
                    <div class="info-value">${request.existingTireMake}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">👤 Requester Information</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Name</div>
                    <div class="info-value">${request.requesterName}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Email</div>
                    <div class="info-value">${request.requesterEmail}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Phone</div>
                    <div class="info-value">${request.requesterPhone}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Department</div>
                    <div class="info-value">${request.userSection}</div>
                </div>
            </div>
        </div>

        ${orderNotes && orderNotes !== 'N/A' ? `
        <div class="highlight">
            <strong>📝 Special Order Notes:</strong><br>
            ${orderNotes}
        </div>
        ` : ''}

        <div class="action-items">
            <h3>📋 Required Information</h3>
            <p>Please confirm receipt of this order and provide the following:</p>
            <ol>
                <li><strong>Tire Availability</strong> - Confirm stock status for the requested tire size</li>
                <li><strong>Pricing Information</strong> - Unit price and total cost including any applicable taxes</li>
                <li><strong>Delivery Timeline</strong> - Expected delivery date and time</li>
                <li><strong>Payment Terms</strong> - Preferred payment method and terms</li>
                <li><strong>Installation Services</strong> - If available, please include installation options</li>
            </ol>
        </div>

        <div class="contact-info">
            <strong>📞 Contact Information:</strong><br>
            For any questions regarding this order, please contact:<br>
            <strong>${request.requesterName}</strong> | ${request.requesterEmail} | ${request.requesterPhone}
        </div>

        <div class="footer">
            <p><strong>Tire Management System</strong></p>
            <p>Order Date: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p>Request ID: #${request.id}</p>
        </div>
    </div>
</body>
</html>
      `.trim()
    };


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

    // Prepare the email payload for Formspree
    const formspreePayload = {
      email: supplier.email,
      subject: emailData.subject,
      message: emailData.message, // HTML version
      _replyto: request.requesterEmail || 'noreply@tyremanagement.com',
      _subject: emailData.subject,
      _format: 'html', // Tell Formspree to send HTML email
      _text: emailData.plainTextMessage, // Plain text fallback
      // Additional structured data for the supplier
      vehicle_number: request.vehicleNumber,
      tire_size: request.tireSizeRequired,
      quantity: request.quantity,
      tubes_quantity: request.tubesQuantity,
      requester_name: request.requesterName,
      requester_email: request.requesterEmail,
      requester_phone: request.requesterPhone,
      order_notes: orderNotes || 'None',
      request_id: request.id,
      vehicle_brand: request.vehicleBrand,
      vehicle_model: request.vehicleModel,
      order_date: new Date().toLocaleDateString(),
      order_time: new Date().toLocaleTimeString()
    };

    console.log('Formspree payload keys:', Object.keys(formspreePayload));
    console.log('Formspree payload sample:', {
      email: formspreePayload.email,
      subject: formspreePayload.subject,
      vehicle_number: formspreePayload.vehicle_number,
      tire_size: formspreePayload.tire_size
    });

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
