import { AbstractNotificationProviderService } from "@medusajs/utils";
import { Resend } from "resend";
import * as fs from "fs";
import * as path from "path";
import Handlebars from "handlebars";

type ResendOptions = {
  apiKey: string;
  from: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@geexfans.com";

function formatMoney(amount = 0, currencyCode = "USD") {
  return `${currencyCode.toUpperCase()} ${(amount / 100).toFixed(2)}`;
}

function baseEmail(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GEEX</title>
</head>
<body style="margin:0;background:#f8fbfd;color:#050607;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fbfd;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #dce6ec;">
          <tr>
            <td style="padding:32px 36px 18px;text-align:center;border-bottom:1px solid #dce6ec;">
              <div style="font-size:34px;font-weight:900;letter-spacing:6px;line-height:1;text-transform:uppercase;">GEEX</div>
              <div style="margin-top:10px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#48afcf;">Everyday electronics for better setups</div>
            </td>
          </tr>
          <tr>
            <td style="padding:34px 36px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 36px;background:#eef5f8;text-align:center;font-size:12px;line-height:20px;color:#5e6872;">
              GEEX Setup Support<br>
              <a href="mailto:${SUPPORT_EMAIL}" style="color:#48afcf;text-decoration:none;">${SUPPORT_EMAIL}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderCustomerCreated(data: any, frontendUrl: string) {
  const firstName = data.first_name || data.firstName || "there";
  const discountCode = data.discountCode;
  const validUntil = data.validUntil;

  return baseEmail(`
    <h1 style="margin:0 0 18px;font-size:28px;line-height:1.2;">Welcome to GEEX, ${firstName}.</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:26px;color:#5e6872;">
      Your GEEX account is ready. You can now save checkout details, track orders, and build a cleaner everyday tech setup with keyboards, peripherals, audio gear, and mobile accessories.
    </p>
    <p style="margin:0 0 26px;font-size:15px;line-height:26px;color:#5e6872;">
      Our support team can help compare compatibility, connectivity, charging, and setup options whenever you need a hand.
    </p>
    ${discountCode ? `
      <div style="margin:28px 0;padding:22px;border:1px dashed #82c8de;background:#f8fbfd;text-align:center;">
        <div style="font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#48afcf;">First order offer</div>
        <div style="margin-top:10px;font-size:24px;font-weight:900;letter-spacing:2px;">${discountCode}</div>
        ${validUntil ? `<div style="margin-top:8px;font-size:12px;color:#5e6872;">Valid until ${validUntil}</div>` : ""}
      </div>
    ` : ""}
    <p style="margin:0 0 30px;text-align:center;">
      <a href="${frontendUrl}/shop" style="display:inline-block;background:#050607;color:#ffffff;padding:14px 28px;text-decoration:none;font-size:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;">Shop GEEX Gear</a>
    </p>
    <p style="margin:0;font-size:13px;line-height:22px;color:#5e6872;border-top:1px solid #dce6ec;padding-top:18px;">
      Questions about devices, ports, switches, or audio pairing? Reply to this email and GEEX Setup Support will help.
    </p>
  `);
}

function renderOrderPlaced(data: any, frontendUrl: string) {
  const firstName = data.first_name || data.firstName || "there";
  const fullOrderId = String(data.id || data.display_id || "N/A");
  const orderId = fullOrderId.startsWith("order_") ? fullOrderId.substring(6) : fullOrderId;
  const currencyCode = data.currency_code || "USD";
  const items = Array.isArray(data.items) ? data.items : [];
  const shippingName = data.shipping_methods?.[0]?.name || "Shipping";
  const storefrontUrl = frontendUrl.replace(/\/$/, "");
  const logoUrl = `${storefrontUrl}/brand/geex-logo-lockup.png`;
  const orderLookupUrl = `${storefrontUrl}/order/lookup?order=${encodeURIComponent(orderId)}&email=${encodeURIComponent(data.email || "")}`;
  const brandFont = "'Arial Black','Microsoft YaHei UI','Microsoft YaHei',SimHei,Arial,sans-serif";

  const itemsHtml = items.map((item: any) => {
    const itemName = item.title || item.product_title || "GEEX product";
    const itemVariant = item.variant_title || "";
    const itemQty = item.quantity || 1;
    const itemPrice = formatMoney(item.unit_price || 0, currencyCode);
    const itemTotal = formatMoney((item.unit_price || 0) * itemQty, currencyCode);
    const itemImage = item.thumbnail || `${storefrontUrl}/placeholder.svg`;

    return `<tr>
      <td style="padding:17px 0;border-top:1px solid #dce6ec;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td width="82" valign="top">
              <img src="${itemImage}" alt="${itemName}" width="82" height="82" style="display:block;width:82px;height:82px;object-fit:cover;background:#eef5f8;border:1px solid #dce6ec;">
            </td>
            <td valign="middle" style="padding-left:16px;">
              <div style="font-size:15px;font-weight:900;color:#050607;">${itemName}</div>
              ${itemVariant ? `<div style="margin-top:6px;font-size:12px;line-height:20px;color:#5e6872;">${itemVariant}</div>` : ""}
              <div style="font-size:12px;line-height:20px;color:#5e6872;">Qty ${itemQty} x ${itemPrice}</div>
            </td>
            <td align="right" valign="middle" style="font-size:14px;font-weight:900;color:#050607;white-space:nowrap;">${itemTotal}</td>
          </tr>
        </table>
      </td>
    </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GEEX Order Confirmation</title>
</head>
<body style="margin:0;background:#f8fbfd;color:#050607;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fbfd;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;width:100%;background:#ffffff;border:1px solid #dce6ec;">
          <tr>
            <td style="padding:34px 42px 32px;border-bottom:1px solid #dce6ec;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" valign="top">
                    <img src="${logoUrl}" alt="GEEX" width="188" style="display:block;width:188px;max-width:188px;height:auto;border:0;">
                    <div style="margin-top:14px;color:#48afcf;font-family:${brandFont};font-size:11px;font-weight:900;letter-spacing:1.2px;line-height:1;text-transform:uppercase;">Everyday electronics for better setups</div>
                  </td>
                  <td align="right" valign="top">
                    <span style="display:inline-block;background:#e8f7fb;border:1px solid #bde4ee;border-radius:999px;padding:8px 13px;color:#117e96;font-size:11px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;">Order confirmed</span>
                  </td>
                </tr>
              </table>
              <h1 style="width:420px;max-width:100%;margin:48px 0 14px;color:#050607;font-family:${brandFont};font-size:34px;font-weight:900;line-height:1.12;letter-spacing:0;">Your setup gear is confirmed.</h1>
              <p style="max-width:470px;margin:0;color:#5e6872;font-size:15px;line-height:25px;">Hi ${firstName}, we received your order and are preparing your electronics and accessories for tracked delivery.</p>
            </td>
          </tr>
          <tr>
            <td>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-bottom:1px solid #dce6ec;">
                <tr>
                  <td width="33.33%" style="padding:14px 20px;border-right:1px solid #dce6ec;">
                    <div style="margin-bottom:5px;color:#5e6872;font-size:10px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;">Order</div>
                    <div style="color:#050607;font-size:14px;font-weight:800;white-space:nowrap;">#${orderId}</div>
                  </td>
                  <td width="33.33%" style="padding:14px 20px;border-right:1px solid #dce6ec;">
                    <div style="margin-bottom:5px;color:#5e6872;font-size:10px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;">Status</div>
                    <div style="color:#18a058;font-size:14px;font-weight:800;white-space:nowrap;">Paid</div>
                  </td>
                  <td width="33.33%" style="padding:14px 20px;">
                    <div style="margin-bottom:5px;color:#5e6872;font-size:10px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;">Next update</div>
                    <div style="color:#050607;font-size:14px;font-weight:800;white-space:nowrap;">Tracking</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:34px 42px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="padding:0 0 18px;font-size:18px;font-weight:900;color:#050607;">Items in your order</td>
                  <td align="right" style="padding:0 0 18px;font-size:12px;font-weight:700;color:#5e6872;">${items.length} ${items.length === 1 ? "product" : "products"}</td>
                </tr>
              </table>
              ${itemsHtml ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-bottom:1px solid #dce6ec;">${itemsHtml}</table>` : ""}
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:40px;background:#f3f8fb;border:1px solid #dce6ec;padding:22px;">
                <tr>
                  <td style="padding:7px 0;color:#5e6872;font-size:14px;">Subtotal</td>
                  <td align="right" style="padding:7px 0;color:#050607;font-size:14px;font-weight:800;">${formatMoney(data.subtotal || data.total || 0, currencyCode)}</td>
                </tr>
                <tr>
                  <td style="padding:7px 0;color:#5e6872;font-size:14px;">${shippingName}</td>
                  <td align="right" style="padding:7px 0;color:#050607;font-size:14px;font-weight:800;">${formatMoney(data.shipping_total || 0, currencyCode)}</td>
                </tr>
                <tr>
                  <td style="padding:16px 0 0;border-top:1px solid #dce6ec;color:#050607;font-size:20px;font-weight:900;">Total</td>
                  <td align="right" style="padding:16px 0 0;border-top:1px solid #dce6ec;color:#31aeca;font-size:24px;font-weight:900;">${formatMoney(data.total || 0, currencyCode)}</td>
                </tr>
              </table>
              <p style="margin:30px 0 0;text-align:center;">
                <a href="${orderLookupUrl}" style="display:inline-block;background:#050607;color:#ffffff;padding:15px 30px;text-decoration:none;font-size:12px;font-weight:900;letter-spacing:1.6px;text-transform:uppercase;">View Order Details</a>
              </p>
              <div style="margin-top:32px;padding:20px 22px;background:#e8f7fb;border:1px solid #bde4ee;color:#35515a;font-size:13px;line-height:22px;">
                <strong style="color:#050607;">What happens next:</strong> We will pack your order, hand it to the carrier, and send tracking details as soon as it ships. Need compatibility or setup help? Reply to this email.
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:26px 42px 32px;background:#f8fbfd;border-top:1px solid #dce6ec;text-align:center;color:#5e6872;font-size:12px;line-height:20px;">
              GEEX Setup Support<br>
              <a href="mailto:${SUPPORT_EMAIL}" style="color:#48afcf;font-weight:800;text-decoration:none;">${SUPPORT_EMAIL}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "resend-notification";
  protected resend: Resend;
  protected options: ResendOptions;

  constructor({ logger }, options: ResendOptions) {
    if (!options.apiKey) {
      throw new Error("[Resend Notification Provider] RESEND_API_KEY is required");
    }
    super();
    this.resend = new Resend(options.apiKey);
    this.options = options;
  }

  async send(notification: any): Promise<{ id: string; to: string; status: string; data: Record<string, unknown> }> {
    const from = this.options.from || "onboarding@resend.dev";
    const { to, template, data = {} } = notification;
    const frontendUrl = process.env.STOREFRONT_URL || process.env.FRONTEND_URL || "http://localhost:3000";

    if (!to) {
      throw new Error("No 'to' address provided for notification");
    }
    if (!EMAIL_REGEX.test(to)) {
      throw new Error("Invalid email address format");
    }

    let htmlContent = "";
    let textContent = "";
    let subject = "GEEX";

    try {
      if (template === "customer_created") {
        htmlContent = renderCustomerCreated(data, frontendUrl);
        subject = `Welcome to GEEX, ${data.first_name || data.firstName || "there"}`;
      } else if (template === "order_placed") {
        htmlContent = renderOrderPlaced(data, frontendUrl);
        const displayOrderId = data.display_id || data.id || "";
        subject = `GEEX Order Confirmation #${displayOrderId}`;
      } else {
        const templateBaseDir = path.join(process.cwd(), "data", "templates", template);
        const htmlPath = path.join(templateBaseDir, "html.hbs");
        const textPath = path.join(templateBaseDir, "text.hbs");

        if (fs.existsSync(htmlPath)) {
          htmlContent = Handlebars.compile(fs.readFileSync(htmlPath, "utf-8"))(data);
        } else {
          htmlContent = baseEmail(`<pre>${JSON.stringify(data, null, 2)}</pre>`);
        }

        if (fs.existsSync(textPath)) {
          textContent = Handlebars.compile(fs.readFileSync(textPath, "utf-8"))(data);
        }
      }
    } catch (err) {
      console.error("[Resend] Failed to render template:", err);
      htmlContent = baseEmail(`<pre>${JSON.stringify(data, null, 2)}</pre>`);
    }

    const { data: result, error } = await this.resend.emails.send({
      from,
      to,
      subject,
      html: htmlContent,
      text: textContent || undefined,
      replyTo: SUPPORT_EMAIL,
    });

    if (error) {
      console.error("[Resend] Email send failed:", error.message || "Unknown error");
      throw new Error("Email notification failed");
    }

    return {
      id: result?.id || `email-${Date.now()}`,
      to,
      status: "sent",
      data: {
        resend_id: result?.id,
        template,
      },
    };
  }
}

export default ResendNotificationProviderService;
