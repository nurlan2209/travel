import nodemailer from "nodemailer";

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP_CONFIG_MISSING");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

export async function sendResetCodeEmail(email: string, code: string) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!from) throw new Error("SMTP_CONFIG_MISSING");

  const transporter = getTransport();
  await transporter.sendMail({
    from,
    to: email,
    subject: "Тур-платформа: Код для сброса пароля",
    text: `Ваш код для сброса пароля: ${code}. Код действует 15 минут.`,
    html: `<div style=\"font-family:Arial,sans-serif;line-height:1.5\"><h2>Tour Platform</h2><p>Ваш код для сброса пароля:</p><p style=\"font-size:28px;font-weight:700;letter-spacing:6px\">${code}</p><p>Код действует 15 минут.</p></div>`
  });
}

type ApplicationStatusMailPayload = {
  email: string;
  fullName: string;
  tourTitle: string;
  tourDate: Date;
  status: "NEW" | "CONTACTED" | "GOING" | "NOT_GOING";
  note?: string | null;
};

export async function sendApplicationStatusEmail(payload: ApplicationStatusMailPayload) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!from) throw new Error("SMTP_CONFIG_MISSING");

  const statusText = {
    NEW: "Новая",
    CONTACTED: "В контакте",
    GOING: "Подтверждена (вы едете)",
    NOT_GOING: "Отклонена / не подтверждена"
  }[payload.status];

  const tourDate = payload.tourDate.toLocaleDateString("ru-RU");
  const subject = `Тур-платформа: статус вашей заявки — ${statusText}`;

  const transporter = getTransport();
  await transporter.sendMail({
    from,
    to: payload.email,
    subject,
    text:
      `Здравствуйте, ${payload.fullName}.\n` +
      `Статус вашей заявки обновлен: ${statusText}.\n` +
      `Тур: ${payload.tourTitle}\n` +
      `Дата: ${tourDate}\n` +
      (payload.note ? `Комментарий менеджера: ${payload.note}\n` : "") +
      `\nTour Platform`,
    html:
      `<div style=\"font-family:Arial,sans-serif;line-height:1.5\">` +
      `<h2>Tour Platform</h2>` +
      `<p>Здравствуйте, <b>${payload.fullName}</b>.</p>` +
      `<p>Статус вашей заявки обновлен: <b>${statusText}</b>.</p>` +
      `<p><b>Тур:</b> ${payload.tourTitle}<br/><b>Дата:</b> ${tourDate}</p>` +
      (payload.note ? `<p><b>Комментарий менеджера:</b> ${payload.note}</p>` : "") +
      `<p>Спасибо, что путешествуете с нами.</p>` +
      `</div>`
  });
}
