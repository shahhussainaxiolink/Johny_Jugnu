import nodemailer from 'nodemailer';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatMoney(amount) {
  return `Rs. ${Math.round(amount)}`;
}

function createTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

function buildOrderEmailHtml(order) {
  const itemsHtml = order.items.map((item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
        <strong>${escapeHtml(item.name)}</strong><br>
        <span style="color: #666666;">Qty: ${escapeHtml(item.quantity)}</span>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; text-align: right;">
        ${formatMoney(item.price * item.quantity)}
      </td>
    </tr>
  `).join('');

  const deliveryRow = order.orderType === 'delivery'
    ? `<tr><td style="padding: 6px 0;">Delivery Fee</td><td style="padding: 6px 0; text-align: right;">${formatMoney(order.deliveryFee)}</td></tr>`
    : '';

  const addressBlock = order.customerInfo.address
    ? `<p style="margin: 4px 0;"><strong>Address:</strong> ${escapeHtml(order.customerInfo.address)}</p>`
    : '';

  const notesBlock = order.specialInstructions
    ? `<p style="margin: 4px 0;"><strong>Instructions:</strong> ${escapeHtml(order.specialInstructions)}</p>`
    : '';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff; color: #111111;">
      <div style="background: #050505; padding: 28px; text-align: center; border-radius: 18px 18px 0 0;">
        <h1 style="margin: 0; color: #ffea00; letter-spacing: 1px;">Johnny &amp; Jugnu</h1>
        <p style="margin: 8px 0 0; color: #ffffff;">Your order has been received</p>
      </div>

      <div style="padding: 28px; border: 1px solid #eeeeee; border-top: 0; border-radius: 0 0 18px 18px;">
        <p style="font-size: 16px;">Hi ${escapeHtml(order.customerInfo.name)},</p>
        <p style="color: #444444;">Thanks for ordering from Johnny &amp; Jugnu. Here is your order summary.</p>

        <div style="background: #fff8d8; border-left: 5px solid #ffea00; padding: 16px; border-radius: 10px; margin: 22px 0;">
          <p style="margin: 4px 0;"><strong>Order #:</strong> ${escapeHtml(order.orderNumber)}</p>
          <p style="margin: 4px 0;"><strong>Order Type:</strong> ${escapeHtml(order.orderType)}</p>
          <p style="margin: 4px 0;"><strong>Payment:</strong> ${escapeHtml(order.paymentMethod)}</p>
          <p style="margin: 4px 0;"><strong>Estimated Time:</strong> ${escapeHtml(order.estimatedTime)} minutes</p>
          ${addressBlock}
          ${notesBlock}
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          ${itemsHtml}
        </table>

        <table style="width: 100%; border-collapse: collapse; margin-top: 18px;">
          <tr><td style="padding: 6px 0;">Subtotal</td><td style="padding: 6px 0; text-align: right;">${formatMoney(order.subtotal)}</td></tr>
          <tr><td style="padding: 6px 0;">Tax</td><td style="padding: 6px 0; text-align: right;">${formatMoney(order.tax)}</td></tr>
          ${deliveryRow}
          <tr>
            <td style="padding: 14px 0 0; font-size: 20px;"><strong>Total</strong></td>
            <td style="padding: 14px 0 0; text-align: right; font-size: 20px; color: #ff1e46;"><strong>${formatMoney(order.total)}</strong></td>
          </tr>
        </table>

        <p style="margin-top: 26px; color: #666666;">We will contact you if we need any extra details.</p>
      </div>
    </div>
  `;
}

export async function sendOrderSummaryEmail(order) {
  const transporter = createTransporter();

  if (!transporter) {
    return {
      sent: false,
      skipped: true,
      reason: 'Email credentials are not configured'
    };
  }

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: order.customerInfo.email,
    subject: `Your Johnny & Jugnu Order #${order.orderNumber}`,
    html: buildOrderEmailHtml(order)
  });

  return { sent: true };
}
