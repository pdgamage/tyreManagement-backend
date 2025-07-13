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
      message: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tire Order Request</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; }
        .email-container { max-width: 800px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; position: relative; }
        .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=200&fit=crop&crop=center') center/cover; opacity: 0.1; }
        .header-content { position: relative; z-index: 2; }
        .header h1 { font-size: 28px; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        .header p { font-size: 16px; opacity: 0.9; }
        .tire-icon { width: 60px; height: 60px; margin: 0 auto 15px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; }
        .content { padding: 0; }
        .greeting { background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%); color: white; padding: 25px; text-align: center; }
        .greeting h2 { font-size: 24px; margin-bottom: 10px; }
        .section { margin: 0; border-bottom: 1px solid #eee; }
        .section:last-child { border-bottom: none; }
        .section-header { background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 15px 25px; font-weight: bold; font-size: 18px; display: flex; align-items: center; }
        .section-icon { width: 30px; height: 30px; margin-right: 15px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .section-content { padding: 25px; background: #f8f9fa; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
        .info-card { background: white; padding: 20px; border-radius: 10px; border-left: 4px solid #667eea; box-shadow: 0 2px 10px rgba(0,0,0,0.1); transition: transform 0.2s; }
        .info-card:hover { transform: translateY(-2px); }
        .info-label { font-weight: bold; color: #495057; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
        .info-value { color: #2c3e50; font-size: 16px; font-weight: 600; }
        .highlight-card { background: linear-gradient(45deg, #ff9a9e 0%, #fecfef 100%); color: #2c3e50; padding: 25px; margin: 20px; border-radius: 15px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .action-section { background: linear-gradient(45deg, #a8edea 0%, #fed6e3 100%); padding: 30px; text-align: center; }
        .action-section h3 { color: #2c3e50; margin-bottom: 20px; font-size: 22px; }
        .action-list { text-align: left; max-width: 600px; margin: 0 auto; }
        .action-item { background: white; margin: 10px 0; padding: 15px 20px; border-radius: 10px; border-left: 4px solid #667eea; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .action-item strong { color: #667eea; }
        .contact-section { background: linear-gradient(45deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; text-align: center; }
        .contact-card { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 15px 0; }
        .footer { background: #2c3e50; color: white; padding: 25px; text-align: center; }
        .footer-logo { width: 150px; height: auto; margin-bottom: 15px; }
        .truck-image { width: 100%; max-width: 200px; height: auto; margin: 15px 0; border-radius: 10px; }
        @media (max-width: 600px) {
            .info-grid { grid-template-columns: 1fr; }
            .header h1 { font-size: 24px; }
            .section-header { font-size: 16px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="header-content">
                <div class="tire-icon">🚛</div>
                <h1>Tire Order Request</h1>
                <p>Request #${request.id} | Vehicle ${request.vehicleNumber}</p>
                <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=100&fit=crop&crop=center" alt="Truck" class="truck-image">
            </div>
        </div>

        <!-- Greeting -->
        <div class="greeting">
            <h2>Dear ${supplier.name},</h2>
            <p>We would like to place an order for tires with the following specifications. Please review the details below and confirm availability.</p>
        </div>

        <!-- Vehicle Information -->
        <div class="section">
            <div class="section-header">
                <div class="section-icon">🚗</div>
                Vehicle Information
            </div>
            <div class="section-content">
                <div class="info-grid">
                    <div class="info-card">
                        <div class="info-label">Vehicle Number</div>
                        <div class="info-value">${request.vehicleNumber}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Brand & Model</div>
                        <div class="info-value">${request.vehicleBrand} ${request.vehicleModel}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Year</div>
                        <div class="info-value">${request.year}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Present KM Reading</div>
                        <div class="info-value">${request.presentKmReading?.toLocaleString() || 'N/A'}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tire Specifications -->
        <div class="section">
            <div class="section-header">
                <div class="section-icon">🛞</div>
                Tire Specifications
            </div>
            <div class="section-content">
                <div class="info-grid">
                    <div class="info-card" style="border-left-color: #e74c3c;">
                        <div class="info-label">Tire Size Required</div>
                        <div class="info-value" style="color: #e74c3c; font-size: 20px;">${request.tireSizeRequired}</div>
                    </div>
                    <div class="info-card" style="border-left-color: #27ae60;">
                        <div class="info-label">Quantity</div>
                        <div class="info-value" style="color: #27ae60; font-size: 20px;">${request.quantity}</div>
                    </div>
                    <div class="info-card" style="border-left-color: #f39c12;">
                        <div class="info-label">Tubes Quantity</div>
                        <div class="info-value" style="color: #f39c12;">${request.tubesQuantity}</div>
                    </div>
                    <div class="info-card" style="border-left-color: #9b59b6;">
                        <div class="info-label">Existing Tire Make</div>
                        <div class="info-value" style="color: #9b59b6;">${request.existingTireMake}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Requester Information -->
        <div class="section">
            <div class="section-header">
                <div class="section-icon">👤</div>
                Requester Information
            </div>
            <div class="section-content">
                <div class="info-grid">
                    <div class="info-card">
                        <div class="info-label">Name</div>
                        <div class="info-value">${request.requesterName}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Email</div>
                        <div class="info-value">${request.requesterEmail}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Phone</div>
                        <div class="info-value">${request.requesterPhone}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Department</div>
                        <div class="info-value">${request.userSection}</div>
                    </div>
                </div>
            </div>
        </div>

        ${orderNotes && orderNotes !== 'N/A' && orderNotes !== 'None' ? `
        <!-- Special Notes -->
        <div class="highlight-card">
            <h3 style="margin-bottom: 15px; color: #2c3e50;">📝 Special Order Notes</h3>
            <p style="font-size: 16px; font-weight: 500;">${orderNotes}</p>
        </div>
        ` : ''}

        <!-- Action Items -->
        <div class="action-section">
            <h3>📋 Required Information</h3>
            <p style="margin-bottom: 25px; color: #2c3e50;">Please confirm receipt of this order and provide the following:</p>
            <div class="action-list">
                <div class="action-item">
                    <strong>1. Tire Availability</strong><br>
                    Confirm stock status for the requested tire size
                </div>
                <div class="action-item">
                    <strong>2. Pricing Information</strong><br>
                    Unit price and total cost including any applicable taxes
                </div>
                <div class="action-item">
                    <strong>3. Delivery Timeline</strong><br>
                    Expected delivery date and time
                </div>
                <div class="action-item">
                    <strong>4. Payment Terms</strong><br>
                    Preferred payment method and terms
                </div>
                <div class="action-item">
                    <strong>5. Installation Services</strong><br>
                    If available, please include installation options
                </div>
            </div>
        </div>

        <!-- Contact Information -->
        <div class="contact-section">
            <h3 style="margin-bottom: 20px;">📞 Contact Information</h3>
            <div class="contact-card">
                <p><strong>For any questions regarding this order, please contact:</strong></p>
                <p style="font-size: 18px; margin: 10px 0;"><strong>${request.requesterName}</strong></p>
                <p>📧 ${request.requesterEmail}</p>
                <p>📱 ${request.requesterPhone}</p>
                <p>🏢 ${request.userSection}</p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/ed/SLTMobitel_Logo.svg" alt="SLT Mobitel" class="footer-logo">
            <p><strong>Tire Management System</strong></p>
            <p>Order Date: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p>Request ID: #${request.id} | Vehicle: ${request.vehicleNumber}</p>
            <p style="margin-top: 15px; opacity: 0.8;">Thank you for your prompt attention to this order request.</p>
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
      message: emailData.message, // HTML message
      _replyto: request.requesterEmail || 'noreply@tyremanagement.com',
      _subject: emailData.subject,
      _format: 'html', // Tell Formspree to send HTML email
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
