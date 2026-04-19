const SUPABASE_URL = "https://hfphuyznxobzgfmmvtxj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_9_aK9g8DPrP6cxN1c4L4UA_m95mJWtc";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginArea = document.getElementById("login-area");
const adminArea = document.getElementById("admin-area");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const loginMsg = document.getElementById("login-msg");

const emailInput = document.getElementById("admin-email");
const passwordInput = document.getElementById("admin-password");

const toggleStoreBtn = document.getElementById("toggle-store-btn");
const productsAdminList = document.getElementById("products-admin-list");
const optionsAdminList = document.getElementById("options-admin-list");
const globalOptionsAdminList = document.getElementById("global-options-admin-list");

let currentStoreSettings = null;

// ------------------------
// AUTH
// ------------------------
async function checkAdminAccess() {
  const { data: userData, error: userError } = await supabaseClient.auth.getUser();

  if (userError) {
    console.error("Erro ao buscar usuário:", userError);
    return false;
  }

  const user = userData?.user;

  if (!user) {
    loginArea.classList.remove("hidden");
    adminArea.classList.add("hidden");
    return false;
  }

  const { data: adminRow, error: adminError } = await supabaseClient
    .from("admins")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError) {
    console.error("Erro ao validar admin:", adminError);
    loginMsg.textContent = "Erro ao validar acesso de administrador.";
    loginMsg.className = "text-sm text-red-600 mt-2";
    loginArea.classList.remove("hidden");
    adminArea.classList.add("hidden");
    return false;
  }

  if (!adminRow) {
    loginArea.classList.remove("hidden");
    adminArea.classList.add("hidden");
    loginMsg.textContent = "Você não tem permissão de administrador.";
    loginMsg.className = "text-sm text-red-600 mt-2";
    return false;
  }

  loginArea.classList.add("hidden");
  adminArea.classList.remove("hidden");

  await carregarStoreSettings();
  await carregarProdutosAdmin();
  await carregarOpcoesGlobaisAdmin();
  await carregarOpcoesAdmin();

  return true;
}

async function loginAdmin() {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    loginMsg.textContent = "Preencha email e senha.";
    loginMsg.className = "text-sm text-red-600 mt-2";
    return;
  }

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    loginMsg.textContent = error.message;
    loginMsg.className = "text-sm text-red-600 mt-2";
    return;
  }

  loginMsg.textContent = "";
  await checkAdminAccess();
}

async function logoutAdmin() {
  await supabaseClient.auth.signOut();
  loginArea.classList.remove("hidden");
  adminArea.classList.add("hidden");
}

// ------------------------
// STORE SETTINGS
// ------------------------
async function carregarStoreSettings() {
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

  if (!data) {
    console.error("Nenhum registro encontrado em store_settings");
    return;
  }

  currentStoreSettings = data;
  atualizarBotaoLoja();
}

function atualizarBotaoLoja() {
  if (!currentStoreSettings || !toggleStoreBtn) return;

  if (currentStoreSettings.is_open) {
    toggleStoreBtn.textContent = "Loja Aberta";
    toggleStoreBtn.className = "px-4 py-2 rounded text-white bg-green-600";
  } else {
    toggleStoreBtn.textContent = "Loja Fechada";
    toggleStoreBtn.className = "px-4 py-2 rounded text-white bg-red-600";
  }
}

async function toggleStoreStatus() {
  if (!currentStoreSettings) return;

  const novoStatus = !currentStoreSettings.is_open;

  const { error } = await supabaseClient
    .from("store_settings")
    .update({
      is_open: novoStatus,
      updated_at: new Date().toISOString()
    })
    .eq("id", currentStoreSettings.id);

  if (error) {
    console.error("Erro ao atualizar loja:", error);
    alert("Erro ao atualizar status da loja.");
    return;
  }

  currentStoreSettings.is_open = novoStatus;
  atualizarBotaoLoja();
}

// ------------------------
// PRODUTOS
// ------------------------
async function carregarProdutosAdmin() {
  const { data: categories, error: categoriesError } = await supabaseClient
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (categoriesError) {
    console.error("Erro ao carregar categorias:", categoriesError);
    return;
  }

  const { data: products, error: productsError } = await supabaseClient
    .from("products")
    .select("id, category_id, name, active, price, size_label")
    .order("id", { ascending: true });

  if (productsError) {
    console.error("Erro ao carregar produtos:", productsError);
    return;
  }

  productsAdminList.innerHTML = "";

  categories.forEach((categoria) => {
    const produtosDaCategoria = products.filter((p) => p.category_id === categoria.id);

    if (!produtosDaCategoria.length) return;

    const bloco = document.createElement("div");
    bloco.className = "border rounded p-4";

    const produtosHtml = produtosDaCategoria.map((produto) => `
      <div class="flex justify-between items-center border-b py-2 gap-4">
        <div>
          <p class="font-semibold">${produto.name}</p>
          <p class="text-sm text-gray-600">
            R$ ${Number(produto.price || 0).toFixed(2)} ${produto.size_label ? `- ${produto.size_label}` : ""}
          </p>
        </div>
        <button
          class="toggle-product-btn px-3 py-1 rounded text-white ${produto.active ? "bg-green-600" : "bg-red-600"}"
          data-id="${produto.id}"
          data-active="${produto.active}">
          ${produto.active ? "Ativo" : "Inativo"}
        </button>
      </div>
    `).join("");

    bloco.innerHTML = `
      <h3 class="text-lg font-bold mb-3">${categoria.name}</h3>
      <div>${produtosHtml || "<p class='text-sm text-gray-500'>Sem produtos</p>"}</div>
    `;

    productsAdminList.appendChild(bloco);
  });
}

async function toggleProduto(productId, active) {
  const { error } = await supabaseClient
    .from("products")
    .update({
      active: !active,
      updated_at: new Date().toISOString()
    })
    .eq("id", productId);

  if (error) {
    console.error("Erro ao atualizar produto:", error);
    alert("Erro ao atualizar produto.");
    return;
  }

  await carregarProdutosAdmin();
}

// ------------------------
// CONTROLE GLOBAL DE OPÇÕES
// ------------------------
async function carregarOpcoesGlobaisAdmin() {
  const { data, error } = await supabaseClient
    .from("product_options")
    .select("group_name, option_name, active")
    .order("group_name", { ascending: true })
    .order("option_name", { ascending: true });

  if (error) {
    console.error("Erro ao carregar opções globais:", error);
    return;
  }

  globalOptionsAdminList.innerHTML = "";

  const gruposDesejados = ["Frutas", "Complementos", "Adicionais"];

  gruposDesejados.forEach((grupo) => {
    const itensDoGrupo = (data || []).filter((item) => item.group_name === grupo);

    const mapa = new Map();

    itensDoGrupo.forEach((item) => {
      const chave = item.option_name.trim();

      if (!mapa.has(chave)) {
        mapa.set(chave, {
          option_name: item.option_name,
          active: item.active
        });
      } else {
        const atual = mapa.get(chave);
        atual.active = atual.active && item.active;
        mapa.set(chave, atual);
      }
    });

    const itensUnicos = [...mapa.values()].sort((a, b) =>
      a.option_name.localeCompare(b.option_name, "pt-BR")
    );

    if (!itensUnicos.length) return;

    const bloco = document.createElement("div");
    bloco.className = "border rounded p-4";

    const itensHtml = itensUnicos.map((item) => `
      <div class="flex justify-between items-center border-b py-2 gap-4">
        <div>
          <p class="font-semibold">${item.option_name}</p>
          <p class="text-sm text-gray-600">${grupo}</p>
        </div>
        <button
          class="toggle-global-option-btn px-3 py-1 rounded text-white ${item.active ? "bg-green-600" : "bg-red-600"}"
          data-group="${grupo}"
          data-name="${item.option_name}"
          data-active="${item.active}">
          ${item.active ? "Ativo" : "Inativo"}
        </button>
      </div>
    `).join("");

    bloco.innerHTML = `
      <h3 class="text-lg font-bold mb-3">${grupo}</h3>
      <div>${itensHtml}</div>
    `;

    globalOptionsAdminList.appendChild(bloco);
  });
}

async function toggleGlobalOption(groupName, optionName, active) {
  const { error } = await supabaseClient
    .from("product_options")
    .update({
      active: !active
    })
    .eq("group_name", groupName)
    .eq("option_name", optionName);

  if (error) {
    console.error("Erro ao atualizar opção global:", error);
    alert(`Erro ao atualizar opção global: ${error.message}`);
    return;
  }

  await carregarOpcoesGlobaisAdmin();
  await carregarOpcoesAdmin();
}

// ------------------------
// OPÇÕES POR PRODUTO
// ------------------------
async function carregarOpcoesAdmin() {
  const { data: products, error: productsError } = await supabaseClient
    .from("products")
    .select("id, name")
    .order("id", { ascending: true });

  if (productsError) {
    console.error("Erro ao carregar produtos das opções:", productsError);
    return;
  }

  const { data: options, error: optionsError } = await supabaseClient
    .from("product_options")
    .select("id, product_id, group_name, option_name, active, price, sort_order")
    .order("product_id", { ascending: true })
    .order("group_name", { ascending: true })
    .order("sort_order", { ascending: true });

  if (optionsError) {
    console.error("Erro ao carregar opções:", optionsError);
    return;
  }

  optionsAdminList.innerHTML = "";

  products.forEach((produto) => {
    const opcoesDoProduto = options.filter((op) => op.product_id === produto.id);

    if (!opcoesDoProduto.length) return;

    const bloco = document.createElement("div");
    bloco.className = "border rounded p-4";

    const opcoesHtml = opcoesDoProduto.map((opcao) => `
      <div class="flex justify-between items-center border-b py-2 gap-4">
        <div>
          <p class="font-semibold">${opcao.option_name}</p>
          <p class="text-sm text-gray-600">${opcao.group_name} - R$ ${Number(opcao.price || 0).toFixed(2)}</p>
        </div>
        <button
          class="toggle-option-btn px-3 py-1 rounded text-white ${opcao.active ? "bg-green-600" : "bg-red-600"}"
          data-id="${opcao.id}"
          data-active="${opcao.active}">
          ${opcao.active ? "Ativo" : "Inativo"}
        </button>
      </div>
    `).join("");

    bloco.innerHTML = `
      <h3 class="text-lg font-bold mb-3">${produto.name}</h3>
      <div>${opcoesHtml || "<p class='text-sm text-gray-500'>Sem opções</p>"}</div>
    `;

    optionsAdminList.appendChild(bloco);
  });
}

async function toggleOpcao(optionId, active) {
  const { error } = await supabaseClient
    .from("product_options")
    .update({
      active: !active
    })
    .eq("id", optionId);

  if (error) {
    console.error("Erro ao atualizar opção:", error);
    alert("Erro ao atualizar opção.");
    return;
  }

  await carregarOpcoesAdmin();
  await carregarOpcoesGlobaisAdmin();
}

// ------------------------
// EVENTS
// ------------------------
loginBtn?.addEventListener("click", loginAdmin);
logoutBtn?.addEventListener("click", logoutAdmin);
toggleStoreBtn?.addEventListener("click", toggleStoreStatus);

document.addEventListener("click", async (event) => {
  const productBtn = event.target.closest(".toggle-product-btn");
  if (productBtn) {
    const id = Number(productBtn.dataset.id);
    const active = productBtn.dataset.active === "true";
    await toggleProduto(id, active);
    return;
  }

  const globalOptionBtn = event.target.closest(".toggle-global-option-btn");
  if (globalOptionBtn) {
    const groupName = globalOptionBtn.dataset.group;
    const optionName = globalOptionBtn.dataset.name;
    const active = globalOptionBtn.dataset.active === "true";

    await toggleGlobalOption(groupName, optionName, active);
    return;
  }

  const optionBtn = event.target.closest(".toggle-option-btn");
  if (optionBtn) {
    const id = Number(optionBtn.dataset.id);
    const active = optionBtn.dataset.active === "true";
    await toggleOpcao(id, active);
    return;
  }
});

// ------------------------
// INIT
// ------------------------
checkAdminAccess();