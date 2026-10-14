// Серверна функція екранування спецсимволів для захисту HTML-парсера Telegram
const escapeHTML = (str = "") =>
  String(str)
    .trim()
    .replace(/[&<>'"]/g, (tag) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    }[tag] || tag));

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const { name, phone, device, message, website_url } = body;

    // 1. Захист від спам-ботів (Honeypot)
    // Якщо приховане поле заповнене — це бот. Віддаємо фейковий 200 OK, щоб бот не пробував ще раз.
    if (website_url) {
      return res.status(200).json({ success: true });
    }

    // 2. Жорстка серверна валідація
    const cleanPhone = String(phone || "").replace(/\D/g, "");
    if (!name || String(name).trim().length < 2 || cleanPhone.length < 10 || !device) {
      return res.status(400).json({
        success: false,
        error: "Перевірте правильність заповнення імені та номера телефону."
      });
    }

    // 3. Безпечне очищення та обмеження довжини полів
    const safeName = escapeHTML(name).slice(0, 60);
    const safePhone = escapeHTML(phone).slice(0, 25);
    const safeDevice = escapeHTML(device).slice(0, 60);
    const safeMessage = escapeHTML(message || "Не вказано").slice(0, 600);

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error("[Config Error]: Відсутні змінні TELEGRAM_BOT_TOKEN або TELEGRAM_CHAT_ID");
      return res.status(500).json({
        success: false,
        error: "Помилка конфігурації сервера."
      });
    }

    const text = [
      "🛠 <b>Нова заявка — СЦ Chipset</b>",
      "",
      `👤 <b>Клієнт:</b> ${safeName}`,
      `📞 <b>Телефон:</b> <code>${safePhone}</code>`,
      `📱 <b>Пристрій:</b> ${safeDevice}`,
      `💬 <b>Опис:</b> ${safeMessage}`
    ].join("\n");

    const tgResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true
      })
    });

    const tgResult = await tgResponse.json();

    if (!tgResponse.ok || !tgResult.ok) {
      console.error("[Telegram API Error]:", tgResult);
      return res.status(502).json({
        success: false,
        error: "Сервіс сповіщень тимчасово недоступний."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Заявку успішно відправлено!"
    });
  } catch (error) {
    console.error("[Server Exception]:", error);
    return res.status(500).json({
      success: false,
      error: "Внутрішня помилка сервера."
    });
  }
}