document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. ЖИВИЙ ІНДИКАТОР РОБОЧОГО ЧАСУ (Київський час)
  // ==========================================
  const updateWorkStatus = () => {
    const badge = document.getElementById("work-status-badge");
    if (!badge) return;

    try {
      const now = new Date();
      const kyivTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Kyiv" }));
      const day = kyivTime.getDay(); // 0 - Нд, 1..5 - Пн..Пт, 6 - Сб
      const hour = kyivTime.getHours();
      const minute = kyivTime.getMinutes();
      const currentMinutes = hour * 60 + minute;

      let isOpen = false;
      let statusText = "";

      if (day >= 1 && day <= 5) {
        // Пн-Пт: 09:00 (540) - 19:00 (1140)
        isOpen = currentMinutes >= 540 && currentMinutes < 1140;
        statusText = isOpen ? "Зараз відчинено (до 19:00)" : "Зачинено (відчиняємось о 09:00)";
      } else if (day === 6) {
        // Сб: 10:00 (600) - 17:00 (1020)
        isOpen = currentMinutes >= 600 && currentMinutes < 1020;
        statusText = isOpen ? "Зараз відчинено (до 17:00)" : "Зачинено (Пн з 09:00)";
      } else {
        // Неділя
        isOpen = false;
        statusText = "Сьогодні вихідний (приймаємо онлайн-заявки)";
      }

      const dotColor = isOpen ? "bg-emerald-400 animate-pulse" : "bg-amber-400";
      badge.innerHTML = `
        <span class="w-2 h-2 rounded-full ${dotColor}"></span>
        <span>${statusText}</span>
      `;
    } catch {
      badge.innerHTML = `<span>Пн–Сб: Приймаємо пристрої</span>`;
    }
  };
  updateWorkStatus();

  // ==========================================
  // 2. МОБІЛЬНЕ МЕНЮ ТА ЛИПКИЙ ХЕДЕР
  // ==========================================
  const menuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const iconOpen = document.getElementById("menu-icon-open");
  const iconClose = document.getElementById("menu-icon-close");
  const navbar = document.getElementById("navbar");

  const toggleMenu = (forceClose = false) => {
    if (!menuBtn || !mobileMenu) return;
    const isExpanded = menuBtn.getAttribute("aria-expanded") === "true";
    const shouldClose = forceClose || isExpanded;

    menuBtn.setAttribute("aria-expanded", String(!shouldClose));
    mobileMenu.classList.toggle("hidden", shouldClose);
    iconOpen?.classList.toggle("hidden", !shouldClose);
    iconClose?.classList.toggle("hidden", shouldClose);
  };

  menuBtn?.addEventListener("click", () => toggleMenu());
  document.querySelectorAll(".mobile-link").forEach((link) => {
    link.addEventListener("click", () => toggleMenu(true));
  });

  if (navbar) {
    window.addEventListener(
      "scroll",
      () => {
        navbar.classList.toggle("shadow-md", window.scrollY > 12);
      },
      { passive: true }
    );
  }

  // ==========================================
  // 3. ІНТЕРАКТИВНИЙ КАЛЬКУЛЯТОР РЕМОНТУ
  // ==========================================
  const pricingMatrix = {
    iphone: {
      name: "Apple iPhone",
      selectValue: "Apple iPhone",
      screen: {
        title: "Заміна дисплея / Переклейка скла",
        price: "від 1 200 ₴",
        time: "40–90 хвилин",
        warranty: "6 місяців",
        note: "Програмуємо True Tone під рідну матрицю. Якщо зображення без смуг і плям, переклеїмо лише розбите скло у барокамері."
      },
      battery: {
        title: "Заміна акумулятора (з переносом BMS)",
        price: "від 900 ₴",
        time: "30–45 хвилин",
        warranty: "6 місяців",
        note: "Встановлюємо елементи з нульовим циклом та відновлюємо заводську вологозахисну проклейку корпусу."
      },
      charging: {
        title: "Ремонт роз'єму Lightning / Type-C або чистка",
        price: "від 500 ₴",
        time: "30–60 хвилин",
        warranty: "6 місяців",
        note: "У 40% випадків достатньо професійної чистки під мікроскопом без заміни шлейфа."
      },
      water: {
        title: "Відновлення після води / BGA-пайка плати",
        price: "від 900 ₴",
        time: "від 2 годин",
        warranty: "3–6 місяців",
        note: "Розбираємо пристрій поза чергою, промиваємо плату в ультразвуковій ванні та усуваємо короткі замикання."
      }
    },
    samsung: {
      name: "Samsung",
      selectValue: "Samsung",
      screen: {
        title: "Заміна AMOLED-екрана або переклейка скла",
        price: "від 1 100 ₴",
        time: "60–120 хвилин",
        warranty: "6 місяців",
        note: "У наявності оригінальні сервісні пакети (Service Pack) разом із рамкою, а також окрема переклейка скла."
      },
      battery: {
        title: "Заміна акумулятора Samsung",
        price: "від 750 ₴",
        time: "40 хвилин",
        warranty: "6 місяців",
        note: "Безпечне розклеювання задньої кришки на сепараторі зі збереженням заводського вигляду."
      },
      charging: {
        title: "Заміна роз'єму Type-C / субплати зарядки",
        price: "від 550 ₴",
        time: "40 хвилин",
        warranty: "6 місяців",
        note: "Відновлюємо роботу швидкої зарядки Super Fast Charging та передачі даних."
      },
      water: {
        title: "Чистка після залиття / Ремонт материнської плати",
        price: "від 800 ₴",
        time: "від 2 годин",
        warranty: "3–6 місяців",
        note: "Усуваємо помилку «Волога в порту зарядки» та відновлюємо ланцюги живлення."
      }
    },
    xiaomi: {
      name: "Xiaomi / POCO",
      selectValue: "Xiaomi / POCO / Redmi",
      screen: {
        title: "Заміна дисплейного модуля / скла",
        price: "від 850 ₴",
        time: "45–90 хвилин",
        warranty: "6 місяців",
        note: "Доступні як оригінальні матриці, так і перевірені бюджетні копії на вибір клієнта."
      },
      battery: {
        title: "Заміна акумулятора Xiaomi / Redmi / POCO",
        price: "від 650 ₴",
        time: "30–40 хвилин",
        warranty: "6 місяців",
        note: "Повна перевірка споживання струму на лабораторному блоці живлення перед видачею."
      },
      charging: {
        title: "Заміна гнізда зарядки / кнопки увімкнення",
        price: "від 450 ₴",
        time: "30–45 хвилин",
        warranty: "6 місяців",
        note: "Вирішуємо проблему циклічного перезавантаження (залипання кнопки живлення) за 30 хвилин."
      },
      water: {
        title: "Ребол процесора / Відновлення після води",
        price: "від 800 ₴",
        time: "від 2 годин",
        warranty: "3–6 місяців",
        note: "Професійно лікуємо типові хвороби POCO X3 Pro / М3 (відвал процесора чи контролера живлення)."
      }
    },
    other: {
      name: "Смартфон",
      selectValue: "Motorola / Google Pixel / Інший",
      screen: {
        title: "Заміна розбитого екрана або сенсора",
        price: "від 900 ₴",
        time: "від 60 хвилин",
        warranty: "6 місяців",
        note: "Працюємо з Motorola, Google Pixel, Realme, OnePlus, Oppo та іншими брендами."
      },
      battery: {
        title: "Заміна акумуляторної батареї",
        price: "від 700 ₴",
        time: "40–60 хвилин",
        warranty: "6 місяців",
        note: "Підбір та встановлення нового акумулятора з перевіркою контролера заряду."
      },
      charging: {
        title: "Ремонт роз'єму живлення Type-C / Micro-USB",
        price: "від 450 ₴",
        time: "40 хвилин",
        warranty: "6 місяців",
        note: "Пайка нового порту під мікроскопом із посиленням контактних площадок."
      },
      water: {
        title: "Компонентний ремонт плати / Чистка",
        price: "від 750 ₴",
        time: "від 2 годин",
        warranty: "3–6 місяців",
        note: "Безкоштовна діагностика несправності та узгодження вартості до початку пайки."
      }
    }
  };

  let currentBrand = "iphone";
  let currentIssue = "screen";

  const brandBtns = document.querySelectorAll(".calc-brand-btn");
  const issueBtns = document.querySelectorAll(".calc-issue-btn");
  const resTitle = document.getElementById("calc-result-title");
  const resPrice = document.getElementById("calc-result-price");
  const resTime = document.getElementById("calc-result-time");
  const resWarranty = document.getElementById("calc-result-warranty");
  const resNote = document.getElementById("calc-result-note");
  const applyBtn = document.getElementById("calc-apply-btn");

  const renderCalculator = () => {
    const brandData = pricingMatrix[currentBrand];
    const issueData = brandData[currentIssue];

    if (resTitle) resTitle.textContent = `${brandData.name} — ${issueData.title}`;
    if (resPrice) resPrice.textContent = issueData.price;
    if (resTime) resTime.textContent = issueData.time;
    if (resWarranty) resWarranty.textContent = issueData.warranty;
    if (resNote) resNote.textContent = issueData.note;
  };

  brandBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      brandBtns.forEach((b) => {
        b.classList.remove("active-pill");
        b.classList.add("bg-white", "text-ink", "border-slate-200");
      });
      btn.classList.add("active-pill");
      btn.classList.remove("bg-white", "text-ink", "border-slate-200");
      currentBrand = btn.dataset.brand;
      renderCalculator();
    });
  });

  issueBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      issueBtns.forEach((b) => {
        b.classList.remove("active-pill");
        b.classList.add("bg-white", "text-ink", "border-slate-200");
      });
      btn.classList.add("active-pill");
      btn.classList.remove("bg-white", "text-ink", "border-slate-200");
      currentIssue = btn.dataset.issue;
      renderCalculator();
    });
  });

  // Автозаповнення форми при кліку в калькуляторі
  applyBtn?.addEventListener("click", () => {
    const brandData = pricingMatrix[currentBrand];
    const issueData = brandData[currentIssue];
    const deviceSelect = document.getElementById("device");
    const messageInput = document.getElementById("message");
    const formSection = document.getElementById("repair-request");

    if (deviceSelect) deviceSelect.value = brandData.selectValue;
    if (messageInput) {
      messageInput.value = `Цікавить: ${issueData.title} (${issueData.price}). `;
    }
    formSection?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => document.getElementById("name")?.focus(), 600);
  });

  // ==========================================
  // 4. МАСКА ТЕЛЕФОНУ ТА ВІДПРАВКА ФОРМИ
  // ==========================================
  const phoneInput = document.getElementById("phone");
  phoneInput?.addEventListener("focus", () => {
    if (!phoneInput.value) phoneInput.value = "+380";
  });

  const form = document.getElementById("lead-form");
  const feedbackBox = document.getElementById("form-feedback");
  const submitBtn = document.getElementById("submit-btn");

  const showFeedback = (type, text) => {
    if (!feedbackBox) return;
    feedbackBox.className = "p-4 rounded-xl text-sm font-medium border ";
    if (type === "success") {
      feedbackBox.classList.add("bg-emerald-50", "text-emerald-800", "border-emerald-200");
    } else {
      feedbackBox.classList.add("bg-red-50", "text-red-800", "border-red-200");
    }
    feedbackBox.textContent = text;
    feedbackBox.classList.remove("hidden");
  };

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name")?.value.trim() || "";
    const phone = document.getElementById("phone")?.value.trim() || "";
    const device = document.getElementById("device")?.value || "";
    const message = document.getElementById("message")?.value.trim() || "";
    const honeypot = document.getElementById("website_url")?.value || "";

    // Валідація перед запитом
    const cleanDigits = phone.replace(/\D/g, "");
    if (name.length < 2) {
      showFeedback("error", "Будь ласка, вкажіть ваше ім'я (мінімум 2 символи).");
      return;
    }
    if (cleanDigits.length < 10) {
      showFeedback("error", "Введіть коректний номер телефону, щоб майстер зміг до вас додзвонитися.");
      return;
    }
    if (!device) {
      showFeedback("error", "Оберіть бренд вашого смартфона зі списку.");
      return;
    }

    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Відправляємо заявку...";
    feedbackBox?.classList.add("hidden");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch("/api/send-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          name,
          phone,
          device,
          message: message || "Не вказано",
          website_url: honeypot
        })
      });

      clearTimeout(timeoutId);
      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        showFeedback("success", "Дякуємо! Заявку прийнято. Майстер зателефонує вам найближчим часом.");
        form.reset();
      } else {
        showFeedback("error", data.error || "Не вдалося відправити заявку. Зателефонуйте нам: +38 (093) 771-88-17.");
      }
    } catch {
      showFeedback("error", "Помилка з'єднання з сервером. Будь ласка, наберіть нас напряму: +38 (093) 771-88-17.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });
});