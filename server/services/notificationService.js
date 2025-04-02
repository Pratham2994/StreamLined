import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Twilio client configuration for WhatsApp notifications
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);
const twilioWhatsAppFrom = process.env.TWILIO_WHATSAPP_FROM;
const notificationWhatsAppTo = 'whatsapp:+919833342125';

export const sendOrderNotificationEmail = async (order) => {
  try {
    const mailOptions = {
      from: `"Tracker System" <${process.env.EMAIL_USER}>`,
      to: 'pravin0305@gmail.com',
      subject: 'New Order Notification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2E86C1;">New Order Received</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Order Details</h3>
            <p><strong>Customer:</strong> ${order.customerName || 'N/A'}</p>
            <p><strong>Business:</strong> ${order.businessName || 'N/A'}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
            <p><strong>Expected Delivery:</strong> ${order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : 'N/A'}</p>
          </div>
          <h3 style="color: #2E86C1;">Order Items</h3>
          ${buildItemsTable(order)}
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated notification. Please do not reply to this email.</p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error in sendOrderNotificationEmail:", error);
    throw error;
  }
};

export const sendOrderNotificationWhatsApp = async (order) => {
  try {
    let itemsText = '';
    order.items.forEach(item => {
      itemsText += `• *Item Code:* ${item.itemCode}\n  *Product:* ${item.productName}\n  *Quantity:* ${item.quantity}\n\n`;
    });
    
    const messageBody = `*📦 New Order Notification*\n\n` +
      `*Customer:* ${order.customerName || 'N/A'}\n` +
      `*Business Name:* ${order.businessName || 'N/A'}\n` +
      `*Order Placer:* ${order.orderPlacerName || 'N/A'}\n` +
      `*Phone:* ${order.phoneNumber || 'N/A'}\n` +
      `*Delivery Date:* ${order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : 'N/A'}\n` +
      `*Order Date:* ${new Date(order.createdAt).toLocaleString()}\n\n` +
      `*📋 Items:*\n${itemsText}`;
      
    await twilioClient.messages.create({
      from: twilioWhatsAppFrom,
      body: messageBody,
      to: notificationWhatsAppTo
    });
    return true;
  } catch (error) {
    console.error("Error in sendOrderNotificationWhatsApp:", error);
    throw error;
  }
};

export const sendOrderStatusNotificationEmail = async (order) => {
  try {
    let subject = '';
    let statusColor = '';
    let statusText = '';
    
    if (order.orderStatus === 'Accepted') {
      subject = 'Your Order is Confirmed';
      statusColor = '#4CAF50';
      statusText = 'accepted';
    } else if (order.orderStatus === 'Rejected') {
      subject = 'Order Update';
      statusColor = '#F44336';
      statusText = 'rejected';
    } else {
      return;
    }
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${statusColor};">Order ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}</h2>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Dear ${order.customerName || 'Customer'},</p>
          <p>Your order has been <strong style="color: ${statusColor};">${statusText}</strong>.</p>
          ${order.orderStatus === 'Rejected' ? '<p>Please contact us for further details.</p>' : ''}
        </div>
        ${buildItemsTable(order)}
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
      </div>
    `;
    
    const mailOptions = {
      from: `"Tracker System" <${process.env.EMAIL_USER}>`,
      to: order.customerEmail,
      subject,
      html: htmlContent
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error in sendOrderStatusNotificationEmail:", error);
    throw error;
  }
};



const buildItemsTable = (order) => {
  let itemsHtml = '';
  order.items.forEach(item => {
    itemsHtml += `
      <tr>
        <td style="border:1px solid #ddd; padding:8px;">${item.itemCode}</td>
        <td style="border:1px solid #ddd; padding:8px;">${item.productName}</td>
        <td style="border:1px solid #ddd; padding:8px;">${item.drawingCode || 'N/A'}</td>
        <td style="border:1px solid #ddd; padding:8px;">${item.revision || 'N/A'}</td>
        <td style="border:1px solid #ddd; padding:8px; text-align:center;">${item.quantity}</td>
      </tr>
    `;
  });
  
  return `
    <table style="border-collapse: collapse; width:100%; margin: 20px 0;">
      <thead>
        <tr>
          <th style="border:1px solid #ddd; padding:8px; background-color:#f5f5f5;">Item Code</th>
          <th style="border:1px solid #ddd; padding:8px; background-color:#f5f5f5;">Product Name</th>
          <th style="border:1px solid #ddd; padding:8px; background-color:#f5f5f5;">Drawing Code</th>
          <th style="border:1px solid #ddd; padding:8px; background-color:#f5f5f5;">Revision</th>
          <th style="border:1px solid #ddd; padding:8px; background-color:#f5f5f5;">Quantity</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
  `;
};

export const sendTrackingUpdateNotificationEmail = async (order) => {
  try {
    const subject = `Order Tracking Update`;

    // Determine current stage index (skip "Order Placed")
    let currentStageIndex = -1;
    for (let i = 0; i < order.tracking.length; i++) {
      const stage = order.tracking[i];
      if (stage.stage === "Order Placed") continue;
      if (!stage.actualDate) {
        currentStageIndex = i;
        break;
      }
    }
    // If all stages have actualDate or only "Order Placed" exists, set currentStageIndex to last index.
    if (currentStageIndex === -1 && order.tracking.length > 0) {
      currentStageIndex = order.tracking.length - 1;
    }

    let trackingHtml = '';
    order.tracking.forEach((stage, index) => {
      // Base style for cells
      let baseStyle = "border:1px solid #ddd; padding:8px;";
      // If this row is the current stage, add highlighting.
      if (index === currentStageIndex) {
        baseStyle += " background-color: #e0f7fa; font-weight: bold;";
      }
      
      if (stage.stage === "Order Placed") {
        trackingHtml += `
          <tr>
            <td colspan="3" style="${baseStyle}">
              Order Placed on ${new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </td>
          </tr>
        `;
      } else {
        trackingHtml += `
          <tr>
            <td style="${baseStyle}">${stage.stage}</td>
            <td style="${baseStyle}">${stage.plannedDate ? new Date(stage.plannedDate).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }) : ''}</td>
            <td style="${baseStyle}">${stage.actualDate ? new Date(stage.actualDate).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }) : ''}</td>
          </tr>
        `;
      }
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color:#2E86C1;">Order Tracking Update</h2>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Dear ${order.customerName || 'Customer'},</p>
          <p>There is an update in the tracking of your order.</p>
        </div>
        ${buildItemsTable(order)}
        <h3 style="color:#2E86C1;">Tracking Details</h3>
        <table style="border-collapse: collapse; width:100%; margin-top:20px;">
          <thead>
            <tr>
              <th style="border:1px solid #ddd; padding:8px; background-color:#f5f5f5;">Stage</th>
              <th style="border:1px solid #ddd; padding:8px; background-color:#f5f5f5;">Planned Date</th>
              <th style="border:1px solid #ddd; padding:8px; background-color:#f5f5f5;">Actual Date</th>
            </tr>
          </thead>
          <tbody>
            ${trackingHtml}
          </tbody>
        </table>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated notification. Please do not reply to this email.</p>
      </div>
    `;

    const mailOptions = {
      from: `"Tracker System" <${process.env.EMAIL_USER}>`,
      to: order.customerEmail,
      subject,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error in sendTrackingUpdateNotificationEmail:", error);
    throw error;
  }
};
