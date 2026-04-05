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

const DELIVERY_FEE = 4.50;
const WHATSAPP_NUMBER = "5511944842614";

const VALID_COUPONS = {
    GELATO10: { type: "percent", value: 10 },
    DESCONTO5: { type: "fixed", value: 5 },
    ENTREGAZERO: { type: "delivery", value: 4.50 }
};

let cart = [];
let appliedCoupon = null;
let discountAmount = 0;

// ------------------------
// UTILITÁRIOS
// ------------------------
function formatCurrency(value) {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function parsePriceFromText(text) {
    return parseFloat(
        text
            .replace("R$", "")
            .replace(/\s/g, "")
            .replace(/\./g, "")
            .replace(",", ".")
    );
}

function getProductsSubtotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function calculateDiscount(subtotal) {
    if (!appliedCoupon) return 0;

    if (appliedCoupon.type === "percent") {
        return subtotal * (appliedCoupon.value / 100);
    }

    if (appliedCoupon.type === "fixed") {
        return appliedCoupon.value;
    }

    if (appliedCoupon.type === "delivery") {
        return DELIVERY_FEE;
    }

    return 0;
}

function updateCouponMessage(message, type = "success") {
    couponMessage.textContent = message;
    couponMessage.classList.remove("hidden", "text-green-600", "text-red-500");

    if (type === "success") {
        couponMessage.classList.add("text-green-600");
    } else {
        couponMessage.classList.add("text-red-500");
    }
}

function resetWarnings() {
    addressWarn.classList.add("hidden");
    neighborhoodWarn.classList.add("hidden");
    numberWarn.classList.add("hidden");

    addressInput.classList.remove("border-red-500");
    neighborhoodInput.classList.remove("border-red-500");
    numberInput.classList.remove("border-red-500");

    customerNameWarn.classList.add("hidden");
    customerPhoneWarn.classList.add("hidden");

    customerNameInput.classList.remove("border-red-500");
    customerPhoneInput.classList.remove("border-red-500");
}

function clearTextInputs() {
    addressInput.value = "";
    neighborhoodInput.value = "";
    numberInput.value = "";
    cepInput.value = "";
    customerNameInput.value = "";
    customerPhoneInput.value = "";
    trocoInput.value = "";
    couponCodeInput.value = "";
}

function resetPaymentOptions() {
    document.querySelectorAll("input[name='paymethod']").forEach((radio) => {
        radio.checked = false;
    });

    trocoArea.classList.add("hidden");
    pixWarning.classList.add("hidden");
}

function resetCouponState() {
    appliedCoupon = null;
    discountAmount = 0;
    couponMessage.textContent = "";
    couponMessage.classList.add("hidden");
    couponMessage.classList.remove("text-green-600", "text-red-500");
}

function resetComboSelections() {
    document.querySelectorAll(".fruta-combo, .complemento-combo").forEach((item) => {
        item.checked = false;
    });
}

// ------------------------
// OPÇÕES DINÂMICAS DOS PRODUTOS
// ------------------------
function loadDefaultProductOptions() {
    fruitsContent.innerHTML = `
        <label class="flex justify-between">
            <span><input type="checkbox" class="fruta-item" data-name="Banana" data-price="0" /> Banana</span>
            <span>( + R$ 0,00 )</span>
        </label>

        <label class="flex justify-between">
            <span><input type="checkbox" class="fruta-item" data-name="Uva" data-price="0" /> Uva</span>
            <span>( + R$ 0,00 )</span>
        </label>

        <label class="flex justify-between">
            <span><input type="checkbox" class="fruta-item" data-name="Manga" data-price="0" /> Manga</span>
            <span>( + R$ 0,00 )</span>
        </label>

        <label class="flex justify-between">
            <span><input type="checkbox" class="fruta-item" data-name="Não quero fruta" data-price="0" /> Não quero fruta</span>
        </label>
    `;

    complementsContent.innerHTML = `
        <label class="flex justify-between">
            <span><input type="checkbox" class="complemento-item1" data-name="Leite em Pó" data-price="0" /> Leite em Pó</span>
            <span>( + R$ 0,00 )</span>
        </label>

        <label class="flex justify-between">
            <span><input type="checkbox" class="complemento-item1" data-name="Granola" data-price="0" /> Granola</span>
            <span>( + R$ 0,00 )</span>
        </label>

        <label class="flex justify-between">
            <span><input type="checkbox" class="complemento-item1" data-name="Leite Condensado" data-price="0" /> Leite Condensado</span>
            <span>( + R$ 0,00 )</span>
        </label>

        <label class="flex justify-between">
            <span><input type="checkbox" class="complemento-item1" data-name="Sucrilhos" data-price="0" /> Sucrilhos</span>
            <span>( + R$ 0,00 )</span>
        </label>

        <label class="flex justify-between">
            <span><input type="checkbox" class="complemento-item1" data-name="Paçoca" data-price="0" /> Paçoca</span>
            <span>( + R$ 0,00 )</span>
        </label>
    `;

    additionalsContent.innerHTML = `
        <label class="flex justify-between">
            <span><input type="checkbox" class="complemento-item" data-name="Farinha Láctea" data-price="3" /> Farinha Láctea</span>
            <span>( + R$ 3,00 )</span>
        </label>

        <label class="flex justify-between">
            <span><input type="checkbox" class="complemento-item" data-name="Ovomaltine" data-price="3" /> Ovomaltine</span>
            <span>( + R$ 3,00 )</span>
        </label>

        <label class="flex justify-between">
            <span><input type="checkbox" class="complemento-item" data-name="Confete" data-price="3" /> Confete</span>
            <span>( + R$ 3,00 )</span>
        </label>

        <label class="flex justify-between">
            <span><input type="checkbox" class="complemento-item" data-name="Ouro Branco" data-price="3" /> Ouro Branco</span>
            <span>( + R$ 3,00 )</span>
        </label>

        <label class="flex justify-between">
            <span><input type="checkbox" class="complemento-item" data-name="Bis Branco" data-price="3" /> Bis Branco</span>
            <span>( + R$ 3,00 )</span>
        </label>

        <label class="flex justify-between">
            <span><input type="checkbox" class="complemento-item" data-name="Bis Preto" data-price="3" /> Bis Preto</span>
            <span>( + R$ 3,00 )</span>
        </label>

        <label class="flex justify-between">
            <span><input type="checkbox" class="complemento-item" data-name="Creme de Leitinho" data-price="6.50" /> Creme de Leitinho</span>
            <span>( + R$ 6,50 )</span>
        </label>

        <label class="flex justify-between">
            <span><input type="checkbox" class="complemento-item" data-name="Creme de Avelã" data-price="6.50" /> Creme de Avelã</span>
            <span>( + R$ 6,50 )</span>
        </label>

        <label class="flex justify-between">
            <span><input type="checkbox" class="complemento-item" data-name="Morango" data-price="2.50" /> Morango</span>
            <span>( + R$ 2,50 )</span>
        </label>
    `;
}

function loadVitaminaOptions() {
    fruitsContent.innerHTML = `
        <label class="flex justify-between">
            <span><input type="checkbox" class="fruta-item" data-name="Banana" data-price="0" /> Banana</span>
            <span>( + R$ 0,00 )</span>
        </label>

        <label class="flex justify-between">
            <span><input type="checkbox" class="fruta-item" data-name="Morango" data-price="2.99" /> Morango</span>
            <span>( + R$ 2,99 )</span>
        </label>

        <label class="flex justify-between">
            <span><input type="checkbox" class="fruta-item" data-name="Uva" data-price="0" /> Uva</span>
            <span>( + R$ 0,00 )</span>
        </label>
    `;

    complementsContent.innerHTML = `
        <label class="flex justify-between">
            <span><input type="checkbox" class="complemento-item1" data-name="Amendoim granulado" data-price="0" /> Amendoim granulado</span>
            <span>( + R$ 0,00 )</span>
        </label>

        <label class="flex justify-between">
            <span><input type="checkbox" class="complemento-item1" data-name="Granola" data-price="0" /> Granola</span>
            <span>( + R$ 0,00 )</span>
        </label>

        <label class="flex justify-between">
            <span><input type="checkbox" class="complemento-item1" data-name="Paçoca" data-price="0" /> Paçoca</span>
            <span>( + R$ 0,00 )</span>
        </label>
    `;

    additionalsContent.innerHTML = `
        <label class="flex justify-between">
            <span><input type="checkbox" class="complemento-item" data-name="Creme de Paçoca" data-price="6.99" /> Creme de Paçoca</span>
            <span>( + R$ 6,99 )</span>
        </label>

        <label class="flex justify-between">
            <span><input type="checkbox" class="complemento-item" data-name="Creme de Leitinho" data-price="6.99" /> Creme de Leitinho</span>
            <span>( + R$ 6,99 )</span>
        </label>

        <label class="flex justify-between">
            <span><input type="checkbox" class="complemento-item" data-name="Ovomaltine" data-price="3.99" /> Ovomaltine</span>
            <span>( + R$ 3,99 )</span>
        </label>
    `;
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
        });
    });
}

// ------------------------
// MODAL DE IMAGEM
// ------------------------
document.querySelectorAll(".produto-img").forEach((img) => {
    img.addEventListener("click", () => {
        imageModalImg.src = img.src;
        imageModal.style.display = "flex";
    });
});

imageModal.addEventListener("click", (event) => {
    if (event.target === imageModal) {
        imageModal.style.display = "none";
    }
});

// ------------------------
// CARRINHO
// ------------------------
function addToCart(name, price, img, complementos = null) {
    cart.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        name,
        price,
        img,
        complementos,
        quantity: 1
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
    cartItemsContainer.innerHTML = "";

    cart.forEach((item) => {
        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col");

        cartItemElement.innerHTML = `
            <div class="flex gap-3 items-start">
                <img src="${item.img}" class="w-20 h-20 rounded object-cover" alt="${item.name}">
                <div class="flex-1">
                    <div class="flex justify-between items-start">
                        <p class="font-bold">${item.name}</p>
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

    cartSubtotalElement.textContent = formatCurrency(subtotal);
    deliveryFeeElement.textContent = formatCurrency(DELIVERY_FEE);
    cartDiscountElement.textContent = `- ${formatCurrency(discountAmount)}`;
    cartTotalElement.textContent = formatCurrency(total);
    cartCounter.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);
}

cartBtn.addEventListener("click", () => {
    cartModal.style.display = "flex";
    updateCartModal();
});

closeModalBtn.addEventListener("click", () => {
    cartModal.style.display = "none";
});

cartModal.addEventListener("click", (event) => {
    if (event.target === cartModal) {
        cartModal.style.display = "none";
    }
});

cartItemsContainer.addEventListener("click", (event) => {
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

// ------------------------
// CUPOM
// ------------------------
applyCouponBtn.addEventListener("click", () => {
    const coupon = couponCodeInput.value.trim().toUpperCase();
    const subtotal = getProductsSubtotal();

    if (subtotal <= 0) {
        updateCouponMessage("Adicione produtos ao carrinho antes de aplicar um cupom.", "error");
        return;
    }

    if (!coupon) {
        appliedCoupon = null;
        discountAmount = 0;
        updateCouponMessage("Digite um cupom para aplicar.", "error");
        updateCartModal();
        return;
    }

    if (!VALID_COUPONS[coupon]) {
        appliedCoupon = null;
        discountAmount = 0;
        updateCouponMessage("Cupom inválido.", "error");
        updateCartModal();
        return;
    }

    appliedCoupon = {
        code: coupon,
        ...VALID_COUPONS[coupon]
    };

    discountAmount = calculateDiscount(subtotal);
    updateCouponMessage(`Cupom ${coupon} aplicado com sucesso!`);
    updateCartModal();
});

// ------------------------
// PRODUTO NORMAL
// ------------------------
function updateProductTotal() {
    const basePrice = parseFloat(modalProductPrice.dataset.basePrice);
    let extras = 0;

    document.querySelectorAll(".complemento-item").forEach((item) => {
        if (item.checked) {
            extras += parseFloat(item.dataset.price || 0);
        }
    });

    document.querySelectorAll(".fruta-item").forEach((item) => {
        if (item.checked) {
            extras += parseFloat(item.dataset.price || 0);
        }
    });

    modalProductPrice.textContent = formatCurrency(basePrice + extras);
}

closeProductModalBtn.addEventListener("click", () => {
    productModal.style.display = "none";
});

productModal.addEventListener("click", (event) => {
    if (event.target === productModal) {
        productModal.style.display = "none";
    }
});

document.querySelectorAll(".ver-produto-btn").forEach((button) => {
    button.addEventListener("click", () => {
        const name = button.getAttribute("data-name");
        const price = parseFloat(button.getAttribute("data-price"));
        const desc = button.getAttribute("data-desc");
        const img = button.getAttribute("data-img");
        const noComplements = button.dataset.semComplemento === "true";
        const productType = button.dataset.productType || "";

        modalProductName.textContent = name;
        modalProductDesc.textContent = desc;
        modalProductImg.src = img;
        modalProductPrice.dataset.basePrice = price;
        modalProductPrice.textContent = formatCurrency(price);

        if (noComplements) {
            fruitSection.classList.add("hidden");
            complementSection.classList.add("hidden");
            additionalSection.classList.add("hidden");
            limitWarning.classList.add("hidden");
        } else {
            fruitSection.classList.remove("hidden");
            complementSection.classList.remove("hidden");
            additionalSection.classList.remove("hidden");
            limitWarning.classList.remove("hidden");

            if (productType === "vitamina") {
                loadVitaminaOptions();
                limitWarning.textContent = "ESCOLHA 1 FRUTA E 1 COMPLEMENTO";
                bindProductOptionEvents(1, 1);
            } else {
                loadDefaultProductOptions();
                limitWarning.textContent = "ESCOLHA 3 COMPLEMENTOS E 1 FRUTA";
                bindProductOptionEvents(3, 1);
            }
        }

        productModal.style.display = "flex";
    });
});

document.getElementById("checkout-btnPRODUTO").addEventListener("click", () => {
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
        return;
    }

    const complementos = {
        frutas: [],
        complementos: [],
        adicionais: []
    };

    document.querySelectorAll(".fruta-item").forEach((item) => {
        if (item.checked) {
            complementos.frutas.push({
                name: item.dataset.name,
                price: parseFloat(item.dataset.price || 0)
            });
        }
    });

    document.querySelectorAll(".complemento-item1").forEach((item) => {
        if (item.checked) {
            complementos.complementos.push({
                name: item.dataset.name,
                price: 0
            });
        }
    });

    document.querySelectorAll(".complemento-item").forEach((item) => {
        if (item.checked) {
            complementos.adicionais.push({
                name: item.dataset.name,
                price: parseFloat(item.dataset.price || 0)
            });
        }
    });

    addToCart(name, price, img, complementos);
    productModal.style.display = "none";
});

// ------------------------
// PRODUTO COMBO
// ------------------------
function updateComboTotal() {
    const basePrice = parseFloat(modalComboPrice.dataset.basePrice);
    let extras = 0;

    document.querySelectorAll(".complemento-combo").forEach((item) => {
        if (item.checked) {
            extras += parseFloat(item.dataset.price || 0);
        }
    });

    modalComboPrice.textContent = formatCurrency(basePrice + extras);
}

closeComboModalBtn.addEventListener("click", () => {
    comboModal.style.display = "none";
});

comboModal.addEventListener("click", (event) => {
    if (event.target === comboModal) {
        comboModal.style.display = "none";
    }
});

document.querySelectorAll(".ver-produto-btn-combos").forEach((button) => {
    button.addEventListener("click", () => {
        resetComboSelections();

        const name = button.getAttribute("data-name");
        const price = parseFloat(button.getAttribute("data-price"));
        const desc = button.getAttribute("data-desc");
        const img = button.getAttribute("data-img");

        modalComboName.textContent = name;
        modalComboDesc.textContent = desc;
        modalComboImg.src = img;
        modalComboPrice.dataset.basePrice = price;
        modalComboPrice.textContent = formatCurrency(price);

        comboModal.style.display = "flex";
    });
});

document.querySelectorAll(".complemento-combo").forEach((item) => {
    item.addEventListener("change", updateComboTotal);
});

document.getElementById("checkout-btnPRODUTO2").addEventListener("click", () => {
    const name = modalComboName.textContent;
    const price = parsePriceFromText(modalComboPrice.textContent);
    const img = modalComboImg.src;

    const complementos = {
        comboCup1: { frutas: [], complementos: [], adicionais: [] },
        comboCup2: { frutas: [], complementos: [], adicionais: [] }
    };

    document.querySelectorAll(".fruta-combo").forEach((item) => {
        if (item.checked) {
            const cup = item.dataset.copo === "1" ? "comboCup1" : "comboCup2";
            complementos[cup].frutas.push({
                name: item.dataset.name,
                price: parseFloat(item.dataset.price || 0)
            });
        }
    });

    document.querySelectorAll(".complemento-combo").forEach((item) => {
        if (item.checked) {
            const cup = item.dataset.copo === "1" ? "comboCup1" : "comboCup2";
            const priceItem = parseFloat(item.dataset.price || 0);

            if (priceItem > 0) {
                complementos[cup].adicionais.push({
                    name: item.dataset.name,
                    price: priceItem
                });
            } else {
                complementos[cup].complementos.push({
                    name: item.dataset.name,
                    price: priceItem
                });
            }
        }
    });

    addToCart(name, price, img, complementos);
    comboModal.style.display = "none";
});

// ------------------------
// ACCORDION
// ------------------------
document.querySelectorAll(".accordion-btn").forEach((button) => {
    button.addEventListener("click", () => {
        const targetId = button.dataset.target;
        const content = document.getElementById(targetId);
        const arrow = button.querySelector(".arrow");

        if (!content) return;

        content.classList.toggle("hidden");

        if (arrow) {
            arrow.textContent = content.classList.contains("hidden") ? "▼" : "▲";
        }
    });
});

// ------------------------
// CHECKOUT
// ------------------------
checkoutBtn.addEventListener("click", () => {
    resetWarnings();

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

goToPaymentBtn.addEventListener("click", () => {
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

closeCustomerModalBtn.addEventListener("click", () => {
    customerModal.style.display = "none";
    cartModal.style.display = "flex";
});

closePaymentBtn.addEventListener("click", () => {
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

// ------------------------
// WHATSAPP
// ------------------------
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
        paymentText = troco
            ? `Dinheiro | Troco para: R$ ${Number(troco).toFixed(2)}`
            : "Dinheiro";
    } else {
        paymentText = "Cartão";
    }

    const itemsText = cart.map((item, index) => {
        let line = `*${index + 1}.* ${item.name}\n`;
        line += `Quantidade: ${item.quantity}\n`;
        line += `Valor unitário: ${formatCurrency(item.price)}\n`;
        line += `Subtotal: ${formatCurrency(item.price * item.quantity)}\n`;

        if (item.complementos) {
            const extras = [];

            if (item.complementos.frutas?.length) {
                extras.push(`Frutas: ${item.complementos.frutas.map((fruit) => `${fruit.name}${fruit.price > 0 ? ` (+${formatCurrency(fruit.price)})` : ""}`).join(", ")}`);
            }

            if (item.complementos.complementos?.length) {
                extras.push(`Complementos: ${item.complementos.complementos.map((comp) => comp.name).join(", ")}`);
            }

            if (item.complementos.adicionais?.length) {
                extras.push(`Adicionais: ${item.complementos.adicionais.map((add) => `${add.name} (+${formatCurrency(add.price)})`).join(", ")}`);
            }

            if (item.complementos.comboCup1) {
                const cup1 = [];

                if (item.complementos.comboCup1.frutas?.length) {
                    cup1.push(`Frutas: ${item.complementos.comboCup1.frutas.map((item) => item.name).join(", ")}`);
                }

                if (item.complementos.comboCup1.complementos?.length) {
                    cup1.push(`Complementos: ${item.complementos.comboCup1.complementos.map((item) => item.name).join(", ")}`);
                }

                if (item.complementos.comboCup1.adicionais?.length) {
                    cup1.push(`Adicionais: ${item.complementos.comboCup1.adicionais.map((item) => item.name).join(", ")}`);
                }

                if (cup1.length) {
                    extras.push(`Copo 1 -> ${cup1.join(" | ")}`);
                }
            }

            if (item.complementos.comboCup2) {
                const cup2 = [];

                if (item.complementos.comboCup2.frutas?.length) {
                    cup2.push(`Frutas: ${item.complementos.comboCup2.frutas.map((item) => item.name).join(", ")}`);
                }

                if (item.complementos.comboCup2.complementos?.length) {
                    cup2.push(`Complementos: ${item.complementos.comboCup2.complementos.map((item) => item.name).join(", ")}`);
                }

                if (item.complementos.comboCup2.adicionais?.length) {
                    cup2.push(`Adicionais: ${item.complementos.comboCup2.adicionais.map((item) => item.name).join(", ")}`);
                }

                if (cup2.length) {
                    extras.push(`Copo 2 -> ${cup2.join(" | ")}`);
                }
            }

            if (extras.length) {
                line += `${extras.join("\n")}\n`;
            }
        }

        return line;
    }).join("\n");

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

// ------------------------
// FINALIZAR PEDIDO
// ------------------------
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

confirmPaymentBtn.addEventListener("click", () => {
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
// INICIALIZAÇÃO
// ------------------------
loadDefaultProductOptions();
updateCartModal();