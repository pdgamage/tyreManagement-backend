const fetch = require('node-fetch');

class OrderEmailService {
  static async sendOrderToSupplier(supplier, request, orderDetails) {
    try {
      const emailData = {
        to: supplier.email,
        subject: `New Tire Order Request - ${request.vehicleNumber}`,
        message: this.generateOrderEmailContent(supplier, request, orderDetails)
      };

      // Send email using FormsFree API
      const response = await fetch(`https://formspree.io/f/${supplier.formsfree_key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        throw new Error(`FormsFree API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Order email sent successfully to:', supplier.email);
      return result;
    } catch (error) {
      console.error('Error sending order email:', error);
      throw error;
    }
  }

  static generateOrderEmailContent(supplier, request, orderDetails) {
    return `
Dear ${supplier.name},

We have a new tire order request for your review:

ORDER DETAILS:
=============
Request ID: ${request.id}
Order Date: ${new Date().toLocaleDateString()}

VEHICLE INFORMATION:
==================
Vehicle Number: ${request.vehicleNumber}
Vehicle Brand: ${request.vehicleBrand}
Vehicle Model: ${request.vehicleModel}
Year: ${request.year}

TIRE SPECIFICATIONS:
==================
Tire Size Required: ${request.tireSizeRequired}
Quantity: ${request.quantity}
Tubes Quantity: ${request.tubesQuantity}
Current Tire Make: ${request.existingTireMake}

VEHICLE USAGE:
=============
Present KM Reading: ${request.presentKmReading?.toLocaleString() || 'N/A'}
Previous KM Reading: ${request.previousKmReading?.toLocaleString() || 'N/A'}
Last Replacement Date: ${new Date(request.lastReplacementDate).toLocaleDateString()}
Tire Wear Pattern: ${request.tireWearPattern}

REQUESTER INFORMATION:
====================
Name: ${request.requesterName}
Email: ${request.requesterEmail}
Phone: ${request.requesterPhone}
Department: ${request.userSection}
Cost Center: ${request.costCenter}

REQUEST REASON:
==============
${request.requestReason}

${request.comments ? `ADDITIONAL COMMENTS:\n================\n${request.comments}\n\n` : ''}

APPROVAL HISTORY:
================
${request.supervisor_notes ? `Supervisor Notes: ${request.supervisor_notes}\n` : ''}
${request.technical_manager_note ? `Technical Manager Notes: ${request.technical_manager_note}\n` : ''}
${request.engineer_note ? `Engineer Notes: ${request.engineer_note}\n` : ''}

Please review this order request and provide your quotation and delivery timeline.

For any questions, please contact the requester directly at ${request.requesterEmail} or ${request.requesterPhone}.

Thank you for your service.

Best regards,
Tire Management System
    `.trim();
  }
}

module.exports = OrderEmailService;
