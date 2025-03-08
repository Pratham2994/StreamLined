import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Existing nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Existing Twilio client setup (if needed)
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
      subject: 'New Order Placed',
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
      itemsText += `Item Code: ${item.itemCode}, Product: ${item.productName}, Qty: ${item.quantity}\n\n`;
    });
    const messageBody = `New Order Placed:
Customer: ${order.customerEmail}
Business Name: ${order.businessName || 'N/A'}
Order Placer: ${order.orderPlacerName || 'N/A'}
Phone: ${order.phoneNumber || 'N/A'}
Delivery Date: ${order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : 'N/A'}
Order Date: ${new Date(order.createdAt).toLocaleString()}\n
Items:
${itemsText}`;
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
      subject = 'Your Order Has Been Accepted';
      htmlContent = `
        <h2>Order Accepted</h2>
        <p>Dear Customer,</p>
        <p>Your order with ID <strong>${order._id}</strong> has been accepted.</p>
        <p>Thank you for your business!</p>
      `;
    } else if (order.orderStatus === 'Rejected') {
      subject = 'Your Order Has Been Rejected';
      htmlContent = `
        <h2>Order Rejected</h2>
        <p>Dear Customer,</p>
        <p>We regret to inform you that your order with ID <strong>${order._id}</strong> has been rejected.</p>
        <p>Please contact us for further details.</p>
      `;
    } else {
      return; // no notification for other statuses
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
  let itemsHtml = '';
  order.items.forEach(item => {
    itemsHtml += `<tr>
      <td style="border:1px solid #ddd; padding:8px;">${item.itemCode}</td>
      <td style="border:1px solid #ddd; padding:8px;">${item.productName}</td>
      <td style="border:1px solid #ddd; padding:8px;">${item.drawingCode || 'N/A'}</td>
      <td style="border:1px solid #ddd; padding:8px;">${item.revision || 'N/A'}</td>
      <td style="border:1px solid #ddd; padding:8px;">${item.quantity}</td>
    </tr>`;
  });
  
  return `
    <h2>New Order Placed</h2>
    <p><strong>Customer Email:</strong> ${order.customerEmail}</p>
    <p><strong>Business Name:</strong> ${order.businessName || 'N/A'}</p>
    <p><strong>Order Placer Name:</strong> ${order.orderPlacerName || 'N/A'}</p>
    <p><strong>Phone Number:</strong> ${order.phoneNumber || 'N/A'}</p>
    <p><strong>Expected Delivery Date:</strong> ${order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : 'N/A'}</p>
    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
    <h3>Items:</h3>
    <table style="border-collapse: collapse; width: 100%;">
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
    const subject = `Your Order ${order._id} Tracking Update`;
    let trackingHtml = '';
    order.tracking.forEach(stage => {
      trackingHtml += `<p><strong>${stage.stage}:</strong> Planned: ${stage.plannedDate ? new Date(stage.plannedDate).toLocaleDateString() : 'N/A'}, Actual: ${stage.actualDate ? new Date(stage.actualDate).toLocaleDateString() : 'N/A'}</p>`;
    });
    const htmlContent = `
      <h2>Tracking Update for Your Order</h2>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
      <h3>Tracking Details:</h3>
      ${trackingHtml}
      <p>Thank you for choosing our service!</p>
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
