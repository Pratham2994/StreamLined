import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
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
      from: process.env.EMAIL_USER,
      to: 'pravin0305@gmail.com',
      subject: 'New Order Notification',
      html: buildOrderEmailTemplate(order)
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
      itemsText += `• Item Code: ${item.itemCode}\n  Product: ${item.productName}\n  Quantity: ${item.quantity}\n\n`;
    });
    const messageBody = `*New Order Notification*\n\n*Customer:* ${order.customerEmail}\n*Business Name:* ${order.businessName || 'N/A'}\n*Order Placer:* ${order.orderPlacerName || 'N/A'}\n*Phone:* ${order.phoneNumber || 'N/A'}\n*Delivery Date:* ${order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : 'N/A'}\n*Order Date:* ${new Date(order.createdAt).toLocaleString()}\n\n*Items:*\n${itemsText}`;
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
    let htmlContent = '';
    if (order.orderStatus === 'Accepted') {
      subject = 'Your Order is Confirmed';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height:1.6;">
          <h2 style="color:#2E86C1;">Order Confirmed</h2>
          <p>Dear Customer,</p>
          <p>Your order containing the following items has been <strong>accepted</strong>.</p>
          ${buildItemsTable(order)}
          <p>Thank you for your business.</p>
          <p>Best regards,<br/>Customer Support Team</p>
        </div>
      `;
    } else if (order.orderStatus === 'Rejected') {
      subject = 'Order Update';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height:1.6;">
          <h2 style="color:#C0392B;">Order Rejected</h2>
          <p>Dear Customer,</p>
          <p>Your order containing the following items has been <strong>rejected</strong>. Please contact us for further details.</p>
          ${buildItemsTable(order)}
          <p>We apologize for any inconvenience.</p>
          <p>Best regards,<br/>Customer Support Team</p>
        </div>
      `;
    } else {
      return; // No notification for other statuses
    }
    const mailOptions = {
      from: process.env.EMAIL_USER,
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

const buildOrderEmailTemplate = (order) => {
  // This template is for notifications to internal teams.
  let itemsHtml = '';
  order.items.forEach(item => {
    itemsHtml += `<tr>
      <td style="border:1px solid #ddd; padding:8px;">${item.itemCode}</td>
      <td style="border:1px solid #ddd; padding:8px;">${item.productName}</td>
      <td style="border:1px solid #ddd; padding:8px;">${item.drawingCode || 'N/A'}</td>
      <td style="border:1px solid #ddd; padding:8px;">${item.revision || 'N/A'}</td>
      <td style="border:1px solid #ddd; padding:8px; text-align:center;">${item.quantity}</td>
    </tr>`;
  });
  
  return `
    <div style="font-family: Arial, sans-serif; color:#333; line-height:1.6;">
      <h2 style="color:#2E86C1;">New Order Notification</h2>
      <p>A new order has been placed with the following details:</p>
      <table style="border-collapse: collapse; width:100%; margin-bottom:20px;">
        <tr>
          <td style="border:1px solid #ddd; padding:8px;"><strong>Customer Email</strong></td>
          <td style="border:1px solid #ddd; padding:8px;">${order.customerEmail}</td>
        </tr>
        <tr>
          <td style="border:1px solid #ddd; padding:8px;"><strong>Business Name</strong></td>
          <td style="border:1px solid #ddd; padding:8px;">${order.businessName || 'N/A'}</td>
        </tr>
        <tr>
          <td style="border:1px solid #ddd; padding:8px;"><strong>Order Placer</strong></td>
          <td style="border:1px solid #ddd; padding:8px;">${order.orderPlacerName || 'N/A'}</td>
        </tr>
        <tr>
          <td style="border:1px solid #ddd; padding:8px;"><strong>Phone Number</strong></td>
          <td style="border:1px solid #ddd; padding:8px;">${order.phoneNumber || 'N/A'}</td>
        </tr>
        <tr>
          <td style="border:1px solid #ddd; padding:8px;"><strong>Expected Delivery Date</strong></td>
          <td style="border:1px solid #ddd; padding:8px;">${order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : 'N/A'}</td>
        </tr>
        <tr>
          <td style="border:1px solid #ddd; padding:8px;"><strong>Order Date</strong></td>
          <td style="border:1px solid #ddd; padding:8px;">${new Date(order.createdAt).toLocaleString()}</td>
        </tr>
      </table>
      <h3 style="color:#2E86C1;">Order Items</h3>
      <table style="border-collapse: collapse; width:100%;">
        <thead>
          <tr>
            <th style="border:1px solid #ddd; padding:8px;">Item Code</th>
            <th style="border:1px solid #ddd; padding:8px;">Product Name</th>
            <th style="border:1px solid #ddd; padding:8px;">Drawing Code</th>
            <th style="border:1px solid #ddd; padding:8px;">Revision</th>
            <th style="border:1px solid #ddd; padding:8px;">Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <p>Please review the order details and proceed accordingly.</p>
      <p>Best regards,<br/>Order Notification System</p>
    </div>
  `;
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
    <h3 style="color:#2E86C1;">Order Items</h3>
    <table style="border-collapse: collapse; width:100%;">
      <thead>
        <tr>
          <th style="border:1px solid #ddd; padding:8px;">Item Code</th>
          <th style="border:1px solid #ddd; padding:8px;">Product Name</th>
          <th style="border:1px solid #ddd; padding:8px;">Drawing Code</th>
          <th style="border:1px solid #ddd; padding:8px;">Revision</th>
          <th style="border:1px solid #ddd; padding:8px;">Quantity</th>
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
        // For Order Placed, show a single cell spanning three columns
        trackingHtml += `
          <tr>
            <td colspan="3" style="${baseStyle}">
              Order Placed on ${new Date(order.createdAt).toLocaleDateString()}
            </td>
          </tr>
        `;
      } else {
        trackingHtml += `
          <tr>
            <td style="${baseStyle}">${stage.stage}</td>
            <td style="${baseStyle}">${stage.plannedDate ? new Date(stage.plannedDate).toLocaleDateString() : ''}</td>
            <td style="${baseStyle}">${stage.actualDate ? new Date(stage.actualDate).toLocaleDateString() : ''}</td>
          </tr>
        `;
      }
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color:#333; line-height:1.6;">
        <h2 style="color:#2E86C1;">Order Tracking Update</h2>
        <p>Dear Customer,</p>
        <p>There is an update in the tracking of your order containing the following items:</p>
        ${buildItemsTable(order)}
        <h3 style="color:#2E86C1;">Tracking Details</h3>
        <table style="border-collapse: collapse; width:100%; margin-bottom:20px;">
          <thead>
            <tr>
              <th style="border:1px solid #ddd; padding:8px;">Stage</th>
              <th style="border:1px solid #ddd; padding:8px;">Planned Date</th>
              <th style="border:1px solid #ddd; padding:8px;">Actual Date</th>
            </tr>
          </thead>
          <tbody>
            ${trackingHtml}
          </tbody>
        </table>
        <p>Thank you for choosing our service.</p>
        <p>Best regards,<br/>Customer Support Team</p>
      </div>
    `;
    const mailOptions = {
      from: process.env.EMAIL_USER,
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
