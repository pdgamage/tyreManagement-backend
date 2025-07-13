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
      
      // Email subject and content - using professional plain text format for better compatibility
      subject: `🚛 Tire Order Request - Vehicle ${request.vehicleNumber} - Request #${request.id}`,
      message: 'This will be replaced by the professional message in the payload'
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

    // Create a simplified but professional plain text message for better compatibility
    const professionalMessage = `
🚛 TIRE ORDER REQUEST - Request #${request.id}
═══════════════════════════════════════════════════════════════

Dear ${supplier.name},

We would like to place an order for tires with the following specifications.
Please review the details below and confirm availability.

┌─────────────────────────────────────────────────────────────┐
│ 🚗 VEHICLE INFORMATION                                      │
├─────────────────────────────────────────────────────────────┤
│ Vehicle Number:     ${request.vehicleNumber}
│ Brand & Model:      ${request.vehicleBrand} ${request.vehicleModel}
│ Year:               ${request.year}
│ Present KM:         ${request.presentKmReading?.toLocaleString() || 'N/A'}
│ Previous KM:        ${request.previousKmReading?.toLocaleString() || 'N/A'}
│ Last Replacement:   ${new Date(request.lastReplacementDate).toLocaleDateString()}
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 🛞 TIRE SPECIFICATIONS                                      │
├─────────────────────────────────────────────────────────────┤
│ ⭐ Tire Size Required: ${request.tireSizeRequired}
│ ⭐ Quantity:           ${request.quantity}
│ ⭐ Tubes Quantity:     ${request.tubesQuantity}
│ ⭐ Existing Tire Make: ${request.existingTireMake}
│ ⭐ Tire Wear Pattern:  ${request.tireWearPattern}
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 👤 REQUESTER INFORMATION                                    │
├─────────────────────────────────────────────────────────────┤
│ Name:               ${request.requesterName}
│ Email:              ${request.requesterEmail}
│ Phone:              ${request.requesterPhone}
│ Department:         ${request.userSection}
│ Cost Center:        ${request.costCenter}
└─────────────────────────────────────────────────────────────┘

${orderNotes && orderNotes !== 'N/A' && orderNotes !== 'None' ? `
┌─────────────────────────────────────────────────────────────┐
│ 📝 SPECIAL ORDER NOTES                                      │
├─────────────────────────────────────────────────────────────┤
│ ${orderNotes}
└─────────────────────────────────────────────────────────────┘
` : ''}

┌─────────────────────────────────────────────────────────────┐
│ 📋 REQUIRED INFORMATION                                     │
├─────────────────────────────────────────────────────────────┤
│ Please confirm receipt of this order and provide:          │
│                                                             │
│ ✅ 1. TIRE AVAILABILITY                                     │
│    → Confirm stock status for the requested tire size      │
│                                                             │
│ ✅ 2. PRICING INFORMATION                                   │
│    → Unit price and total cost including taxes             │
│                                                             │
│ ✅ 3. DELIVERY TIMELINE                                     │
│    → Expected delivery date and time                       │
│                                                             │
│ ✅ 4. PAYMENT TERMS                                         │
│    → Preferred payment method and terms                    │
│                                                             │
│ ✅ 5. INSTALLATION SERVICES                                 │
│    → If available, please include installation options     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 📞 CONTACT INFORMATION                                      │
├─────────────────────────────────────────────────────────────┤
│ For any questions regarding this order, please contact:    │
│                                                             │
│ 👤 Contact Person: ${request.requesterName}
│ 📧 Email Address:  ${request.requesterEmail}
│ 📱 Phone Number:   ${request.requesterPhone}
│ 🏢 Department:     ${request.userSection}
└─────────────────────────────────────────────────────────────┘

Thank you for your prompt attention to this order request.
We look forward to your confirmation and working with you.

Best regards,
🏢 SLT Mobitel - Tire Management System

═══════════════════════════════════════════════════════════════
Order Date: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
Request ID: #${request.id}
Vehicle: ${request.vehicleNumber} (${request.vehicleBrand} ${request.vehicleModel})
═══════════════════════════════════════════════════════════════
    `.trim();

    // Prepare the email payload for Formspree
    const formspreePayload = {
      email: supplier.email,
      subject: emailData.subject,
      message: professionalMessage, // Use professional plain text message
      _replyto: request.requesterEmail || 'noreply@tyremanagement.com',
      _subject: emailData.subject,
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
