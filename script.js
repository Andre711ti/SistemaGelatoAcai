const SUPABASE_URL = "https://hfphuyznxobzgfmmvtxj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_9_aK9g8DPrP6cxN1c4L4UA_m95mJWtc";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartSubtotalElement = document.getElementById("cart-subtotal");
const deliveryFeeElement = document.getElementById("delivery-fee");
const cartDiscountElement = document.getElementById("cart-discount");
const cartTotalElement = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");

const couponCodeInput = document.getElementById("coupon-code");
const applyCouponBtn = document.getElementById("apply-coupon-btn");
const couponMessage = document.getElementById("coupon-message");

const addressInput = document.getElementById("address");
const neighborhoodInput = document.getElementById("address1");
const numberInput = document.getElementById("address2");
const cepInput = document.getElementById("cep");

const addressWarn = document.getElementById("Address-warn");
const neighborhoodWarn = document.getElementById("Address-warn1");
const numberWarn = document.getElementById("Address-warn2");

const productModal = document.getElementById("cart-modalPRODUTO");
const comboModal = document.getElementById("cart-modalPRODUTO2");
const closeProductModalBtn = document.getElementById("close-modal-btnProduto");
const closeComboModalBtn = document.getElementById("close-modal-btnProduto2");

const modalProductImg = document.getElementById("modal-produto-img");
const modalProductName = document.getElementById("modal-produto-name");
const modalProductDesc = document.getElementById("modal-produto-desc");
const modalProductPrice = document.getElementById("modal-produto-preco");

const modalComboImg = document.getElementById("modal-produto-img2");
const modalComboName = document.getElementById("modal-produto-name2");
const modalComboDesc = document.getElementById("modal-produto-desc2");
const modalComboPrice = document.getElementById("modal-produto-preco2");

const imageModal = document.getElementById("image-modal");
const imageModalImg = document.getElementById("image-modal-img");

const customerModal = document.getElementById("customer-modal");
const closeCustomerModalBtn = document.getElementById("close-customer-modal");
const goToPaymentBtn = document.getElementById("go-to-payment-btn");
const customerNameInput = document.getElementById("customer-name");
const customerPhoneInput = document.getElementById("customer-phone");
const customerNameWarn = document.getElementById("customer-name-warn");
const customerPhoneWarn = document.getElementById("customer-phone-warn");

const paymentModal = document.getElementById("payment-modal");
const paymentTotal = document.getElementById("payment-total");
const confirmPaymentBtn = document.getElementById("confirm-payment");
const closePaymentBtn = document.getElementById("close-payment");

const trocoArea = document.getElementById("troco-area");
const trocoInput = document.getElementById("troco-input");
const pixWarning = document.getElementById("pix-warning");

const fruitSection = document.getElementById("secao-frutas");
const complementSection = document.getElementById("secao-complementos");
const additionalSection = document.getElementById("secao-adicionais");
const limitWarning = document.getElementById("modal-aviso-limites");

const fruitsContent = document.getElementById("frutas-content");
const complementsContent = document.getElementById("complementos-content");
const additionalsContent = document.getElementById("adicionais-content");

const comboCup1Container = document.getElementById("combo-cup1-container");
const comboCup2Container = document.getElementById("combo-cup2-container");

const DELIVERY_FEE = 4.5;
const WHATSAPP_NUMBER = "5511944842614";

let couponsCache = [];
let cart = [];
let appliedCoupon = null;
let discountAmount = 0;
let categoriesCache = [];
let storeSettings = null;

function formatCurrency(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function parsePriceFromText(text) {
  return (
    parseFloat(
      String(text)
        .replace("R$", "")
        .replace(/\s/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
    ) || 0
  );
}

function getProductsSubtotal() {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

function calculateDiscount(subtotal) {
  if (!appliedCoupon) return 0;
  if (appliedCoupon.type === "percent") return subtotal * (appliedCoupon.value / 100);
  if (appliedCoupon.type === "fixed") return appliedCoupon.value;
  if (appliedCoupon.type === "delivery") return DELIVERY_FEE;
  return 0;
}

function updateCouponMessage(message, type = "success") {
  if (!couponMessage) return;

  couponMessage.textContent = message;
  couponMessage.classList.remove("hidden", "text-green-600", "text-red-500");
  couponMessage.classList.add(type === "success" ? "text-green-600" : "text-red-500");
}

function showToast(message, color = "#16a34a") {
  if (typeof Toastify === "undefined") return;

  Toastify({
    text: message,
    duration: 2200,
    gravity: "top",
    position: "right",
    style: { background: color },
  }).showToast();
}

function normalizarTexto(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function resetWarnings() {
  addressWarn?.classList.add("hidden");
  neighborhoodWarn?.classList.add("hidden");
  numberWarn?.classList.add("hidden");

  addressInput?.classList.remove("border-red-500");
  neighborhoodInput?.classList.remove("border-red-500");
  numberInput?.classList.remove("border-red-500");

  customerNameWarn?.classList.add("hidden");
  customerPhoneWarn?.classList.add("hidden");

  customerNameInput?.classList.remove("border-red-500");
  customerPhoneInput?.classList.remove("border-red-500");
}

function clearTextInputs() {
  if (addressInput) addressInput.value = "";
  if (neighborhoodInput) neighborhoodInput.value = "";
  if (numberInput) numberInput.value = "";
  if (cepInput) cepInput.value = "";
  if (customerNameInput) customerNameInput.value = "";
  if (customerPhoneInput) customerPhoneInput.value = "";
  if (trocoInput) trocoInput.value = "";
  if (couponCodeInput) couponCodeInput.value = "";
}

function resetPaymentOptions() {
  document.querySelectorAll("input[name='paymethod']").forEach((radio) => {
    radio.checked = false;
  });

  trocoArea?.classList.add("hidden");
  pixWarning?.classList.add("hidden");
}

function resetCouponState() {
  appliedCoupon = null;
  discountAmount = 0;

  if (!couponMessage) return;
  couponMessage.textContent = "";
  couponMessage.classList.add("hidden");
  couponMessage.classList.remove("text-green-600", "text-red-500");
}

function resetComboSelections() {
  document.querySelectorAll(".fruta-combo, .complemento-combo, .adicional-combo").forEach((item) => {
    item.checked = false;
    item.disabled = false;
  });
}

function limparModalProduto() {
  fruitsContent.innerHTML = "";
  complementsContent.innerHTML = "";
  additionalsContent.innerHTML = "";

  fruitSection.classList.add("hidden");
  complementSection.classList.add("hidden");
  additionalSection.classList.add("hidden");
  limitWarning.classList.add("hidden");
}

function escapeHtml(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeImage(url) {
  if (url && url.trim() !== "") return url;
  return "https://placehold.co/200x200?text=Gelato%27s";
}

function getCategoryNameById(categoryId) {
  const category = categoriesCache.find((c) => c.id === categoryId);
  return category ? category.name : "";
}

function isProdutoMontadoByCategory(categoryName) {
  const nome = normalizarTexto(categoryName);
  return nome.includes("simplesinho") || nome.includes("sugestoes gelato") || nome.includes("sugestoes");
}

function isComboCategory(categoryName) {
  return normalizarTexto(categoryName).includes("combo");
}

async function carregarCupons() {
  try {
    const { data, error } = await supabaseClient
      .from("coupons")
      .select("*")
      .eq("active", true);

    if (error) {
      console.error("Erro ao carregar cupons:", error);
      return;
    }

    couponsCache = data || [];
  } catch (err) {
    console.error("Erro inesperado ao carregar cupons:", err);
  }
}

function buscarCupomPorCodigo(code) {
  const agora = new Date();

  return couponsCache.find((coupon) => {
    if (String(coupon.code).toUpperCase() !== code.toUpperCase()) return false;
    if (!coupon.active) return false;

    if (coupon.expires_at) {
      const expiracao = new Date(coupon.expires_at);
      if (expiracao < agora) return false;
    }

    return true;
  });
}

async function carregarStoreSettingsPublic() {
  try {
    const { data, error } = await supabaseClient
      .from("store_settings")
      .select("*")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Erro ao carregar store_settings:", error);
      return;
    }

    storeSettings = data;
    aplicarStatusLojaNoCardapio();
  } catch (err) {
    console.error("Erro inesperado ao carregar store_settings:", err);
  }
}

function aplicarStatusLojaNoCardapio() {
  if (!storeSettings) return;

  const botoesCompra = document.querySelectorAll(".ver-produto-dinamico-btn");
  const footerCartBtn = document.getElementById("cart-btn");

  if (!storeSettings.is_open) {
    botoesCompra.forEach((btn) => {
      btn.disabled = true;
      btn.classList.add("opacity-50", "cursor-not-allowed");
      btn.title = "Loja fechada";
    });

    if (footerCartBtn) {
      footerCartBtn.disabled = true;
      footerCartBtn.classList.add("opacity-50", "cursor-not-allowed");
      footerCartBtn.title = "Loja fechada";
    }

    let aviso = document.getElementById("store-closed-warning");
    if (!aviso) {
      aviso = document.createElement("div");
      aviso.id = "store-closed-warning";
      aviso.className = "max-w-7xl mx-auto px-4 mb-6";
      aviso.innerHTML = `
        <div class="bg-red-100 border border-red-300 text-red-700 rounded-lg px-4 py-3 text-center font-semibold">
          Loja fechada no momento.
        </div>
      `;
      const menuContainer = document.getElementById("menu");
      menuContainer?.parentNode?.insertBefore(aviso, menuContainer);
    }
  } else {
    botoesCompra.forEach((btn) => {
      btn.disabled = false;
      btn.classList.remove("opacity-50", "cursor-not-allowed");
      btn.title = "";
    });

    if (footerCartBtn) {
      footerCartBtn.disabled = false;
      footerCartBtn.classList.remove("opacity-50", "cursor-not-allowed");
      footerCartBtn.title = "";
    }

    const aviso = document.getElementById("store-closed-warning");
    if (aviso) aviso.remove();
  }
}

async function carregarCategorias() {
  try {
    const { data, error } = await supabaseClient
      .from("categories")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Erro ao carregar categorias:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Erro inesperado ao carregar categorias:", err);
    return [];
  }
}

async function carregarProdutos() {
  try {
    const [categorias, produtosResp] = await Promise.all([
      carregarCategorias(),
      supabaseClient
        .from("products")
        .select("*")
        .eq("active", true)
        .order("id", { ascending: true }),
    ]);

    if (produtosResp.error) {
      console.error("Erro ao carregar produtos:", produtosResp.error);
      return;
    }

    categoriesCache = categorias || [];
    renderizarProdutosAgrupados(categorias, produtosResp.data || []);
  } catch (err) {
    console.error("Erro inesperado ao carregar produtos:", err);
  }
}

function renderizarProdutosAgrupados(categorias, produtos) {
  if (!menu) return;

  menu.innerHTML = "";

  categorias.forEach((categoria) => {
    const produtosDaCategoria = produtos.filter((produto) => produto.category_id === categoria.id);
    if (!produtosDaCategoria.length) return;

    const tituloSecao = document.createElement("div");
    tituloSecao.className = "text-2xl md:text-4xl font-bold text-center mt-9 mb-6";
    tituloSecao.innerHTML = `<h3 class="font-bold text-3xl">${escapeHtml(categoria.name)}</h3>`;
    menu.appendChild(tituloSecao);

    const grid = document.createElement("div");
    grid.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 md:gap-10 mx-auto max-w-7xl px-2 mb-16";

    produtosDaCategoria.forEach((produto) => {
      const nome = produto.name || "Produto";
      const descricao = produto.description || "";
      const preco = Number(produto.price || 0);
      const img = normalizeImage(produto.image_url);
      const sizeLabel = produto.size_label || "";

      const isMontado = isProdutoMontadoByCategory(categoria.name);
      const isCombo = isComboCategory(categoria.name);

      const card = document.createElement("div");
      card.className = "flex gap-2";

      card.innerHTML = `
        <img
          src="${escapeHtml(img)}"
          alt="${escapeHtml(nome)}"
          class="produto-img w-28 h-28 rounded-md hover:scale-110 hover:-rotate-2 duration-300 object-cover cursor-pointer"
          data-img="${escapeHtml(img)}"
        />

        <div class="w-full">
          <p class="font-bold">${escapeHtml(nome)}</p>
          <p class="text-sm">${escapeHtml(descricao)}</p>
          ${sizeLabel ? `<p class="text-xs text-gray-500 mt-1">${escapeHtml(sizeLabel)}</p>` : ""}

          <div class="flex items-center gap-2 justify-between mt-3">
            <p class="font-bold text-lg">R$ ${preco.toFixed(2).replace(".", ",")}</p>

            <button
              type="button"
              class="bg-gray-900 px-5 rounded ver-produto-dinamico-btn"
              data-id="${produto.id}"
              data-category-id="${produto.category_id}"
              data-name="${escapeHtml(nome)}"
              data-desc="${escapeHtml(descricao)}"
              data-price="${preco}"
              data-img="${escapeHtml(img)}"
              data-is-montado="${isMontado ? "true" : "false"}"
              data-is-combo="${isCombo ? "true" : "false"}">
              <i class="fa fa-cart-plus text-lg text-white pointer-events-none"></i>
            </button>
          </div>
        </div>
      `;

      grid.appendChild(card);
    });

    menu.appendChild(grid);
  });

  aplicarStatusLojaNoCardapio();
}

async function carregarOpcoesProduto(productId) {
  try {
    const { data, error } = await supabaseClient
      .from("product_options")
      .select("*")
      .eq("product_id", productId)
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Erro ao carregar opções do produto:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Erro inesperado ao carregar opções:", err);
    return [];
  }
}

function renderOptionGroup(container, options, inputClass) {
  if (!container) return;

  if (!options.length) {
    container.innerHTML = `<p class="text-sm text-gray-500">Nenhuma opção disponível.</p>`;
    return;
  }

  container.innerHTML = options
    .map((option) => `
      <label class="flex justify-between items-center gap-2">
        <span>
          <input
            type="checkbox"
            class="${inputClass}"
            data-name="${escapeHtml(option.option_name)}"
            data-price="${Number(option.price || 0)}"
            data-max-quantity="${Number(option.max_quantity || 1)}"
          />
          ${escapeHtml(option.option_name)}
        </span>
        <span>( + ${formatCurrency(option.price || 0)} )</span>
      </label>
    `)
    .join("");
}

function montarSecoesCombo(options, cupNumber) {
  const frutas = options.filter((opt) => normalizarTexto(opt.group_name) === "frutas");
  const complementos = options.filter((opt) => normalizarTexto(opt.group_name) === "complementos");
  const adicionais = options.filter((opt) => {
    const g = normalizarTexto(opt.group_name);
    return g === "adicionais" || g === "extras";
  });

  const renderGroup = (title, list, inputType, inputClass, targetId, groupName) => {
    if (!list.length) return "";

    return `
      <div class="mt-3">
        <button class="accordion-btn flex justify-between items-center w-full font-semibold" data-target="${targetId}">
          ${title}
          <span class="arrow">▼</span>
        </button>

        <div id="${targetId}" class="hidden mt-2 space-y-2">
          ${list.map((option) => `
            <label class="flex justify-between items-center gap-2">
              <span>
                <input
                  type="${inputType}"
                  name="${groupName}"
                  class="${inputClass}"
                  data-copo="${cupNumber}"
                  data-name="${escapeHtml(option.option_name)}"
                  data-price="${Number(option.price || 0)}"
                />
                ${escapeHtml(option.option_name)}
              </span>
              <span>( + ${formatCurrency(option.price || 0)} )</span>
            </label>
          `).join("")}
        </div>
      </div>
    `;
  };

  return `
    ${renderGroup("Frutas", frutas, "radio", "fruta-combo", `combo-copo${cupNumber}-frutas`, `fruta-copo-${cupNumber}`)}
    ${renderGroup("Complementos", complementos, "checkbox", "complemento-combo", `combo-copo${cupNumber}-complementos`, `complemento-copo-${cupNumber}`)}
    ${renderGroup("Adicionais", adicionais, "checkbox", "adicional-combo", `combo-copo${cupNumber}-adicionais`, `adicional-copo-${cupNumber}`)}
  `;
}

async function abrirModalProdutoDinamico({ id, categoryId, name, desc, price, img }) {
  if (storeSettings && !storeSettings.is_open) {
    alert("A loja está fechada no momento.");
    return;
  }

  const categoryName = getCategoryNameById(categoryId);
  const options = await carregarOpcoesProduto(id);

  // produto montado: abre modal simples sem opções
  if (isProdutoMontadoByCategory(categoryName)) {
    limparModalProduto();

    modalProductName.textContent = name;
    modalProductDesc.textContent = desc;
    modalProductImg.src = img;
    modalProductPrice.dataset.basePrice = price;
    modalProductPrice.textContent = formatCurrency(price);

    productModal.style.display = "flex";
    return;
  }

  // combo
  if (isComboCategory(categoryName)) {
    modalComboName.textContent = name;
    modalComboDesc.textContent = desc;
    modalComboImg.src = img;
    modalComboPrice.dataset.basePrice = price;
    modalComboPrice.textContent = formatCurrency(price);

    comboCup1Container.innerHTML = montarSecoesCombo(options, 1);
    comboCup2Container.innerHTML = montarSecoesCombo(options, 2);

    resetComboSelections();
    comboModal.style.display = "flex";
    return;
  }

  // produto personalizável
  modalProductName.textContent = name;
  modalProductDesc.textContent = desc;
  modalProductImg.src = img;
  modalProductPrice.dataset.basePrice = price;
  modalProductPrice.textContent = formatCurrency(price);

  const fruitOptions = options.filter((opt) => normalizarTexto(opt.group_name) === "frutas");
  const complementOptions = options.filter((opt) => normalizarTexto(opt.group_name) === "complementos");
  const additionalOptions = options.filter((opt) => {
    const g = normalizarTexto(opt.group_name);
    return g === "extras" || g === "adicionais";
  });

  fruitSection?.classList.toggle("hidden", fruitOptions.length === 0);
  complementSection?.classList.toggle("hidden", complementOptions.length === 0);
  additionalSection?.classList.toggle("hidden", additionalOptions.length === 0);

  renderOptionGroup(fruitsContent, fruitOptions, "fruta-item");
  renderOptionGroup(complementsContent, complementOptions, "complemento-item1");
  renderOptionGroup(additionalsContent, additionalOptions, "complemento-item");

  if (limitWarning) {
    const fruitLimit = fruitOptions.length ? Math.max(...fruitOptions.map((x) => Number(x.max_quantity || 1))) : 0;
    const complementLimit = complementOptions.length ? Math.max(...complementOptions.map((x) => Number(x.max_quantity || 1))) : 0;

    if (fruitOptions.length || complementOptions.length || additionalOptions.length) {
      limitWarning.classList.remove("hidden");
      limitWarning.textContent = `ESCOLHA ATÉ ${complementLimit || 0} COMPLEMENTO(S) E ${fruitLimit || 0} FRUTA(S)`;
    } else {
      limitWarning.classList.add("hidden");
    }
  }

  bindProductOptionEvents(
    complementOptions.length ? Math.max(...complementOptions.map((x) => Number(x.max_quantity || 1))) : 99,
    fruitOptions.length ? Math.max(...fruitOptions.map((x) => Number(x.max_quantity || 1))) : 99
  );

  productModal.style.display = "flex";
}

function loadDefaultProductOptions() {
  limparModalProduto();
}

function bindProductOptionEvents(maxComplements = 3, maxFruits = 1) {
  document.querySelectorAll(".complemento-item").forEach((item) => {
    item.addEventListener("change", updateProductTotal);
  });

  document.querySelectorAll(".complemento-item1, .fruta-item").forEach((item) => {
    item.addEventListener("change", () => {
      const complementItems = document.querySelectorAll(".complemento-item1");
      const fruitItems = document.querySelectorAll(".fruta-item");

      const selectedComplements = [...complementItems].filter((i) => i.checked).length;
      const selectedFruits = [...fruitItems].filter((i) => i.checked).length;

      complementItems.forEach((i) => {
        i.disabled = !i.checked && selectedComplements >= maxComplements;
      });

      fruitItems.forEach((i) => {
        i.disabled = !i.checked && selectedFruits >= maxFruits;
      });

      updateProductTotal();
    });
  });
}

function updateProductTotal() {
  if (!modalProductPrice) return;

  const basePrice = parseFloat(modalProductPrice.dataset.basePrice || 0);
  let extras = 0;

  document.querySelectorAll(".complemento-item").forEach((item) => {
    if (item.checked) extras += parseFloat(item.dataset.price || 0);
  });

  document.querySelectorAll(".fruta-item").forEach((item) => {
    if (item.checked) extras += parseFloat(item.dataset.price || 0);
  });

  modalProductPrice.textContent = formatCurrency(basePrice + extras);
}

function aplicarLimitesCombo() {
  [1, 2].forEach((copo) => {
    const complementos = [...document.querySelectorAll(`.complemento-combo[data-copo="${copo}"]`)];
    const complementosSelecionados = complementos.filter((item) => item.checked).length;

    complementos.forEach((item) => {
      item.disabled = !item.checked && complementosSelecionados >= 3;
    });
  });
}

function updateComboTotal() {
  if (!modalComboPrice) return;

  const basePrice = parseFloat(modalComboPrice.dataset.basePrice || 0);
  let extras = 0;

  document.querySelectorAll(".fruta-combo, .complemento-combo, .adicional-combo").forEach((item) => {
    if (item.checked) {
      extras += parseFloat(item.dataset.price || 0);
    }
  });

  modalComboPrice.textContent = formatCurrency(basePrice + extras);
  aplicarLimitesCombo();
}

document.addEventListener("click", (event) => {
  const img = event.target.closest(".produto-img");
  if (!img || !imageModal || !imageModalImg) return;

  imageModalImg.src = img.dataset.img || img.src;
  imageModal.style.display = "flex";
});

imageModal?.addEventListener("click", (event) => {
  if (event.target === imageModal) imageModal.style.display = "none";
});

function addToCart(name, price, img, complementos = null) {
  cart.push({
    id: Date.now() + Math.floor(Math.random() * 1000),
    name,
    price,
    img,
    complementos,
    quantity: 1,
  });

  updateCartModal();
}

function renderComboList(comboData) {
  let html = `<ul class="ml-4">`;

  if (comboData.frutas?.length) {
    html += `<li>Frutas: ${comboData.frutas.map((item) => item.name).join(", ")}</li>`;
  }

  if (comboData.complementos?.length) {
    html += `<li>Complementos: ${comboData.complementos.map((item) => item.name).join(", ")}</li>`;
  }

  if (comboData.adicionais?.length) {
    html += `<li>Adicionais: ${comboData.adicionais.map((item) => item.name).join(", ")}</li>`;
  }

  html += `</ul>`;
  return html;
}

function renderComplementos(complementos) {
  if (!complementos) return "";

  let html = `<div class="mt-2 text-sm text-gray-700">`;

  if (complementos.frutas?.length) {
    html += `
      <p class="font-semibold">Frutas:</p>
      <ul class="ml-4">
        ${complementos.frutas.map((fruit) => `<li>- ${fruit.name}${fruit.price > 0 ? ` (+R$ ${fruit.price.toFixed(2)})` : ""}</li>`).join("")}
      </ul>
    `;
  }

  if (complementos.complementos?.length) {
    html += `
      <p class="font-semibold mt-1">Complementos:</p>
      <ul class="ml-4">
        ${complementos.complementos.map((item) => `<li>- ${item.name}</li>`).join("")}
      </ul>
    `;
  }

  if (complementos.adicionais?.length) {
    html += `
      <p class="font-semibold mt-1">Adicionais:</p>
      <ul class="ml-4">
        ${complementos.adicionais.map((item) => `<li>- ${item.name} (+R$ ${item.price.toFixed(2)})</li>`).join("")}
      </ul>
    `;
  }

  if (complementos.comboCup1 || complementos.comboCup2) {
    if (complementos.comboCup1) {
      html += `<p class="font-semibold mt-1">Copo 1:</p>${renderComboList(complementos.comboCup1)}`;
    }
    if (complementos.comboCup2) {
      html += `<p class="font-semibold mt-1">Copo 2:</p>${renderComboList(complementos.comboCup2)}`;
    }
  }

  html += `</div>`;
  return html;
}

function updateCartModal() {
  if (!cartItemsContainer) return;

  cartItemsContainer.innerHTML = "";

  cart.forEach((item) => {
    const cartItemElement = document.createElement("div");
    cartItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col");

    cartItemElement.innerHTML = `
      <div class="flex gap-3 items-start">
        <img src="${item.img}" class="w-20 h-20 rounded object-cover" alt="${escapeHtml(item.name)}">
        <div class="flex-1">
          <div class="flex justify-between items-start">
            <p class="font-bold">${escapeHtml(item.name)}</p>
            <button class="remove-btn text-red-500 text-sm" data-id="${item.id}">
              Remover
            </button>
          </div>

          <div class="flex items-center gap-2 mt-1">
            <button class="decrease bg-gray-200 px-2 rounded" data-id="${item.id}">-</button>
            <span>${item.quantity}</span>
            <button class="increase bg-gray-200 px-2 rounded" data-id="${item.id}">+</button>
          </div>

          <p class="font-medium mt-1">${formatCurrency(item.price)}</p>
          ${item.complementos ? renderComplementos(item.complementos) : ""}
        </div>
      </div>
    `;

    cartItemsContainer.appendChild(cartItemElement);
  });

  const subtotal = getProductsSubtotal();
  discountAmount = Math.min(calculateDiscount(subtotal), subtotal + DELIVERY_FEE);
  const total = subtotal + DELIVERY_FEE - discountAmount;

  if (cartSubtotalElement) cartSubtotalElement.textContent = formatCurrency(subtotal);
  if (deliveryFeeElement) deliveryFeeElement.textContent = formatCurrency(DELIVERY_FEE);
  if (cartDiscountElement) cartDiscountElement.textContent = `- ${formatCurrency(discountAmount)}`;
  if (cartTotalElement) cartTotalElement.textContent = formatCurrency(total);
  if (cartCounter) cartCounter.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);
}

cartBtn?.addEventListener("click", () => {
  if (storeSettings && !storeSettings.is_open) {
    alert("A loja está fechada no momento.");
    return;
  }

  cartModal.style.display = "flex";
  updateCartModal();
});

closeModalBtn?.addEventListener("click", () => {
  cartModal.style.display = "none";
});

cartModal?.addEventListener("click", (event) => {
  if (event.target === cartModal) cartModal.style.display = "none";
});

closeProductModalBtn?.addEventListener("click", () => {
  productModal.style.display = "none";
});

productModal?.addEventListener("click", (event) => {
  if (event.target === productModal) productModal.style.display = "none";
});

closeComboModalBtn?.addEventListener("click", () => {
  comboModal.style.display = "none";
});

comboModal?.addEventListener("click", (event) => {
  if (event.target === comboModal) comboModal.style.display = "none";
});

cartItemsContainer?.addEventListener("click", (event) => {
  const removeBtn = event.target.closest(".remove-btn");
  const increaseBtn = event.target.closest(".increase");
  const decreaseBtn = event.target.closest(".decrease");

  if (removeBtn) {
    const id = Number(removeBtn.dataset.id);
    cart = cart.filter((item) => item.id !== id);
    updateCartModal();
    return;
  }

  if (increaseBtn) {
    const id = Number(increaseBtn.dataset.id);
    const item = cart.find((cartItem) => cartItem.id === id);
    if (item) {
      item.quantity++;
      updateCartModal();
    }
    return;
  }

  if (decreaseBtn) {
    const id = Number(decreaseBtn.dataset.id);
    const item = cart.find((cartItem) => cartItem.id === id);
    if (item) {
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        cart = cart.filter((cartItem) => cartItem.id !== id);
      }
      updateCartModal();
    }
  }
});

menu?.addEventListener("click", async (event) => {
  const button = event.target.closest(".ver-produto-dinamico-btn");
  if (!button) return;

  event.preventDefault();
  event.stopPropagation();

  if (storeSettings && !storeSettings.is_open) {
    alert("A loja está fechada no momento.");
    return;
  }

  const productId = Number(button.getAttribute("data-id"));
  const categoryId = Number(button.getAttribute("data-category-id"));
  const name = button.getAttribute("data-name") || "Produto";
  const price = parseFloat(button.getAttribute("data-price") || 0);
  const desc = button.getAttribute("data-desc") || "";
  const img = button.getAttribute("data-img") || "https://placehold.co/200x200?text=Gelato%27s";

  await abrirModalProdutoDinamico({
    id: productId,
    categoryId,
    name,
    desc,
    price,
    img,
  });
});

document.addEventListener("change", (event) => {
  if (
    event.target.matches(".fruta-combo") ||
    event.target.matches(".complemento-combo") ||
    event.target.matches(".adicional-combo")
  ) {
    if (event.target.matches(".complemento-combo")) {
      const copo = event.target.dataset.copo;
      const selecionados = document.querySelectorAll(`.complemento-combo[data-copo="${copo}"]:checked`).length;

      if (selecionados > 3) {
        event.target.checked = false;
        alert("Você pode escolher no máximo 3 complementos por copo.");
      }
    }

    updateComboTotal();
  }
});

document.addEventListener("click", (event) => {
  const button = event.target.closest(".accordion-btn");
  if (!button) return;

  const targetId = button.dataset.target;
  const content = document.getElementById(targetId);
  const arrow = button.querySelector(".arrow");

  if (!content) return;

  content.classList.toggle("hidden");
  if (arrow) arrow.textContent = content.classList.contains("hidden") ? "▼" : "▲";
});

applyCouponBtn?.addEventListener("click", () => {
  const couponCode = couponCodeInput.value.trim().toUpperCase();
  const subtotal = getProductsSubtotal();

  if (subtotal <= 0) {
    updateCouponMessage("Adicione produtos ao carrinho antes de aplicar um cupom.", "error");
    return;
  }

  if (!couponCode) {
    appliedCoupon = null;
    discountAmount = 0;
    updateCouponMessage("Digite um cupom para aplicar.", "error");
    updateCartModal();
    return;
  }

  const coupon = buscarCupomPorCodigo(couponCode);

  if (!coupon) {
    appliedCoupon = null;
    discountAmount = 0;
    updateCouponMessage("Cupom inválido ou expirado.", "error");
    updateCartModal();
    return;
  }

  appliedCoupon = {
    code: coupon.code,
    type: coupon.discount_type,
    value: Number(coupon.discount_value || 0),
  };

  discountAmount = calculateDiscount(subtotal);
  updateCouponMessage(`Cupom ${coupon.code} aplicado com sucesso!`);
  updateCartModal();
});

document.getElementById("checkout-btnPRODUTO")?.addEventListener("click", () => {
  const name = modalProductName.textContent;
  const price = parsePriceFromText(modalProductPrice.textContent);
  const img = modalProductImg.src;

  const noComplements =
    fruitSection.classList.contains("hidden") &&
    complementSection.classList.contains("hidden") &&
    additionalSection.classList.contains("hidden");

  if (noComplements) {
    addToCart(name, price, img, null);
    productModal.style.display = "none";
    showToast(`${name} adicionado ao carrinho`);
    return;
  }

  const complementos = {
    frutas: [],
    complementos: [],
    adicionais: [],
  };

  document.querySelectorAll(".fruta-item").forEach((item) => {
    if (item.checked) {
      complementos.frutas.push({
        name: item.dataset.name,
        price: parseFloat(item.dataset.price || 0),
      });
    }
  });

  document.querySelectorAll(".complemento-item1").forEach((item) => {
    if (item.checked) {
      complementos.complementos.push({
        name: item.dataset.name,
        price: parseFloat(item.dataset.price || 0),
      });
    }
  });

  document.querySelectorAll(".complemento-item").forEach((item) => {
    if (item.checked) {
      complementos.adicionais.push({
        name: item.dataset.name,
        price: parseFloat(item.dataset.price || 0),
      });
    }
  });

  addToCart(name, price, img, complementos);
  productModal.style.display = "none";
  showToast(`${name} adicionado ao carrinho`);
});

document.getElementById("checkout-btnPRODUTO2")?.addEventListener("click", () => {
  const frutasCopo1 = [...document.querySelectorAll('.fruta-combo[data-copo="1"]:checked')];
  const frutasCopo2 = [...document.querySelectorAll('.fruta-combo[data-copo="2"]:checked')];

  const compCopo1 = [...document.querySelectorAll('.complemento-combo[data-copo="1"]:checked')];
  const compCopo2 = [...document.querySelectorAll('.complemento-combo[data-copo="2"]:checked')];

  if (frutasCopo1.length !== 1 || frutasCopo2.length !== 1) {
    alert("Escolha exatamente 1 fruta em cada copo.");
    return;
  }

  if (compCopo1.length > 3 || compCopo2.length > 3) {
    alert("Escolha no máximo 3 complementos por copo.");
    return;
  }

  const name = modalComboName.textContent;
  const price = parsePriceFromText(modalComboPrice.textContent);
  const img = modalComboImg.src;

  const complementos = {
    comboCup1: { frutas: [], complementos: [], adicionais: [] },
    comboCup2: { frutas: [], complementos: [], adicionais: [] },
  };

  document.querySelectorAll(".fruta-combo").forEach((item) => {
    if (item.checked) {
      const cup = item.dataset.copo === "1" ? "comboCup1" : "comboCup2";
      complementos[cup].frutas.push({
        name: item.dataset.name,
        price: parseFloat(item.dataset.price || 0),
      });
    }
  });

  document.querySelectorAll(".complemento-combo").forEach((item) => {
    if (item.checked) {
      const cup = item.dataset.copo === "1" ? "comboCup1" : "comboCup2";
      complementos[cup].complementos.push({
        name: item.dataset.name,
        price: parseFloat(item.dataset.price || 0),
      });
    }
  });

  document.querySelectorAll(".adicional-combo").forEach((item) => {
    if (item.checked) {
      const cup = item.dataset.copo === "1" ? "comboCup1" : "comboCup2";
      complementos[cup].adicionais.push({
        name: item.dataset.name,
        price: parseFloat(item.dataset.price || 0),
      });
    }
  });

  addToCart(name, price, img, complementos);
  comboModal.style.display = "none";
  showToast(`${name} adicionado ao carrinho`);
});

checkoutBtn?.addEventListener("click", () => {
  resetWarnings();

  if (storeSettings && !storeSettings.is_open) {
    alert("A loja está fechada no momento.");
    return;
  }

  if (cart.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }

  let valid = true;

  if (addressInput.value.trim() === "") {
    addressWarn.classList.remove("hidden");
    addressInput.classList.add("border-red-500");
    valid = false;
  }

  if (neighborhoodInput.value.trim() === "") {
    neighborhoodWarn.classList.remove("hidden");
    neighborhoodInput.classList.add("border-red-500");
    valid = false;
  }

  if (numberInput.value.trim() === "") {
    numberWarn.classList.remove("hidden");
    numberInput.classList.add("border-red-500");
    valid = false;
  }

  if (!valid) return;

  cartModal.style.display = "none";
  customerModal.style.display = "flex";
});

goToPaymentBtn?.addEventListener("click", () => {
  resetWarnings();

  const name = customerNameInput.value.trim();
  const phone = customerPhoneInput.value.trim().replace(/\D/g, "");

  let valid = true;

  if (name.length < 5) {
    customerNameWarn.classList.remove("hidden");
    customerNameInput.classList.add("border-red-500");
    valid = false;
  }

  if (phone.length < 10 || phone.length > 11) {
    customerPhoneWarn.classList.remove("hidden");
    customerPhoneInput.classList.add("border-red-500");
    valid = false;
  }

  if (!valid) return;

  paymentTotal.textContent = cartTotalElement.textContent;
  customerModal.style.display = "none";
  paymentModal.style.display = "flex";
});

closeCustomerModalBtn?.addEventListener("click", () => {
  customerModal.style.display = "none";
  cartModal.style.display = "flex";
});

closePaymentBtn?.addEventListener("click", () => {
  paymentModal.style.display = "none";
  pixWarning.classList.add("hidden");
  trocoArea.classList.add("hidden");
  trocoInput.value = "";
});

document.querySelectorAll("input[name='paymethod']").forEach((radio) => {
  radio.addEventListener("change", () => {
    if (!radio.checked) return;

    if (radio.value === "pix") {
      pixWarning.classList.remove("hidden");
      trocoArea.classList.add("hidden");
      trocoInput.value = "";
      return;
    }

    pixWarning.classList.add("hidden");

    if (radio.value === "dinheiro") {
      trocoArea.classList.remove("hidden");
    } else {
      trocoArea.classList.add("hidden");
      trocoInput.value = "";
    }
  });
});

function buildWhatsAppMessage(paymentMethod) {
  const customerName = customerNameInput.value.trim();
  const customerPhone = customerPhoneInput.value.trim();
  const address = addressInput.value.trim();
  const neighborhood = neighborhoodInput.value.trim();
  const number = numberInput.value.trim();
  const cep = cepInput.value.trim();

  const subtotal = getProductsSubtotal();
  const desconto = Math.min(calculateDiscount(subtotal), subtotal + DELIVERY_FEE);
  const total = subtotal + DELIVERY_FEE - desconto;

  let paymentText = "";

  if (paymentMethod === "pix") {
    paymentText = "PIX";
  } else if (paymentMethod === "dinheiro") {
    const troco = trocoInput.value.trim();
    paymentText = troco ? `Dinheiro | Troco para: R$ ${Number(troco).toFixed(2)}` : "Dinheiro";
  } else {
    paymentText = "Cartão";
  }

  const itemsText = cart
    .map((item, index) => {
      let line = `*${index + 1}.* ${item.name}\n`;
      line += `Quantidade: ${item.quantity}\n`;
      line += `Valor unitário: ${formatCurrency(item.price)}\n`;
      line += `Subtotal: ${formatCurrency(item.price * item.quantity)}\n`;

      if (item.complementos) {
        const extras = [];

        if (item.complementos.frutas?.length) {
          extras.push(
            `Frutas: ${item.complementos.frutas
              .map((fruit) => `${fruit.name}${fruit.price > 0 ? ` (+${formatCurrency(fruit.price)})` : ""}`)
              .join(", ")}`
          );
        }

        if (item.complementos.complementos?.length) {
          extras.push(`Complementos: ${item.complementos.complementos.map((comp) => comp.name).join(", ")}`);
        }

        if (item.complementos.adicionais?.length) {
          extras.push(
            `Adicionais: ${item.complementos.adicionais
              .map((add) => `${add.name} (+${formatCurrency(add.price)})`)
              .join(", ")}`
          );
        }

        if (item.complementos.comboCup1) {
          const cup1 = [];

          if (item.complementos.comboCup1.frutas?.length) {
            cup1.push(`Frutas: ${item.complementos.comboCup1.frutas.map((x) => x.name).join(", ")}`);
          }
          if (item.complementos.comboCup1.complementos?.length) {
            cup1.push(`Complementos: ${item.complementos.comboCup1.complementos.map((x) => x.name).join(", ")}`);
          }
          if (item.complementos.comboCup1.adicionais?.length) {
            cup1.push(`Adicionais: ${item.complementos.comboCup1.adicionais.map((x) => x.name).join(", ")}`);
          }

          if (cup1.length) extras.push(`Copo 1 -> ${cup1.join(" | ")}`);
        }

        if (item.complementos.comboCup2) {
          const cup2 = [];

          if (item.complementos.comboCup2.frutas?.length) {
            cup2.push(`Frutas: ${item.complementos.comboCup2.frutas.map((x) => x.name).join(", ")}`);
          }
          if (item.complementos.comboCup2.complementos?.length) {
            cup2.push(`Complementos: ${item.complementos.comboCup2.complementos.map((x) => x.name).join(", ")}`);
          }
          if (item.complementos.comboCup2.adicionais?.length) {
            cup2.push(`Adicionais: ${item.complementos.comboCup2.adicionais.map((x) => x.name).join(", ")}`);
          }

          if (cup2.length) extras.push(`Copo 2 -> ${cup2.join(" | ")}`);
        }

        if (extras.length) line += `${extras.join("\n")}\n`;
      }

      return line;
    })
    .join("\n");

  let pixInfo = "";
  if (paymentMethod === "pix") {
    pixInfo = `\n📌 *Chave PIX da loja:* 64.258.108/0001-61\n📎 Enviar comprovante no WhatsApp após finalizar o pedido.\n`;
  }

  return `
🍧 *NOVO PEDIDO - GELATO'S AÇAÍ*

👤 *Cliente:* ${customerName}
📞 *Telefone:* ${customerPhone}

📍 *Entrega:*
Endereço: ${address}
Número: ${number}
Bairro: ${neighborhood}
CEP: ${cep || "Não informado"}

🛒 *Itens do pedido:*
${itemsText}

🎟️ *Cupom:* ${appliedCoupon ? appliedCoupon.code : "Não informado"}
💳 *Pagamento:* ${paymentText}${pixInfo}

💵 *Resumo do pedido:*
Subtotal: ${formatCurrency(subtotal)}
Taxa de entrega: ${formatCurrency(DELIVERY_FEE)}
Desconto: - ${formatCurrency(desconto)}
💰 Total final: ${formatCurrency(total)}
  `.trim();
}

function sendOrderToWhatsApp(paymentMethod) {
  const message = buildWhatsAppMessage(paymentMethod);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

function finalizeOrder(paymentMethod) {
  sendOrderToWhatsApp(paymentMethod);

  paymentModal.style.display = "none";
  customerModal.style.display = "none";
  cartModal.style.display = "none";

  cart = [];
  updateCartModal();
  clearTextInputs();
  resetPaymentOptions();
   resetCouponState();

  alert("Pedido enviado para o WhatsApp com sucesso!");
}

confirmPaymentBtn?.addEventListener("click", () => {
  const selectedMethod = document.querySelector("input[name='paymethod']:checked");

  if (!selectedMethod) {
    alert("Escolha uma forma de pagamento!");
    return;
  }

  if (selectedMethod.value === "dinheiro" && !trocoInput.value.trim()) {
    alert("Informe o valor do troco!");
    return;
  }

  finalizeOrder(selectedMethod.value);
});

// ------------------------
// INIT
// ------------------------
(async function init() {
  loadDefaultProductOptions();
  updateCartModal();
  await carregarStoreSettingsPublic();
  await carregarCupons();
  await carregarProdutos();
})();