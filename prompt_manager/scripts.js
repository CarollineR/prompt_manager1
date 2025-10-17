//Chave para identificar os dados salvos pela aplicação
const STORAGE_KEY = "prompt_storage"

// Seletores dos elementos HTML por ID
const elements = {
  promptTitle: document.getElementById("prompt-title"),
  promptContent: document.getElementById("prompt-content"),
  titleWrapper: document.getElementById("title-wrapper"),
  contentWrapper: document.getElementById("content-wrapper"),
  btnOpen: document.getElementById("btn-open"),
  btnCollapse: document.getElementById("btn-collapse"),
  sidebar: document.getElementById("sidebar"),
  btnSave: document.getElementById("btn-save"),
  list: document.getElementById("prompt-list"),
  search: document.getElementById("search-input"),
  btnNew: document.getElementById("btn-new"),
  btnCopy: document.getElementById("btn-copy"),
}

//Estado para carregar os prompts e exibir
const state = {
  prompts: [],
  selectedId: null,
}

// Atualiza o estado de um campo editável e seu wrapper
function updateEditableWrapperState(element, wrapper) {
  const hasText = element.textContent.trim().length > 0
  wrapper.classList.toggle("is-empty", !hasText)
}

//Funções para abrir e fechar a sidebar
function openSidebar() {
  elements.sidebar.style.display = "flex";
  elements.btnOpen.style.display = "none";
}

function closeSidebar() {
  elements.sidebar.style.display = "none";
  elements.btnOpen.style.display = "block";
}

// Atualiza todos os estados dos campos editáveis
function updateAllEditableStates() {
  updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
  updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
}

// Adiciona ouvintes de input para atualizar wrappers em tempo real
function attachAllEditableHandlers() {
  elements.promptTitle.addEventListener("input", function () {
    updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
  })

  elements.promptContent.addEventListener("input", function () {
    updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
  })
}
updateAllEditableStates()

function save() {
  const title = elements.promptTitle.textContent.trim()
  const content = elements.promptContent.innerHTML.trim()
  const hasContent = elements.promptContent.textContent.trim()

  if (!title && !hasContent) {
    alert("Por favor, preencha ao menos o título ou o conteúdo do prompt.")
    return
  }

  if(state.selectedId) {
    //Editando um prompt existente
    const existing = state.prompts.find((p) => p.id === state.selectedId)
    if (existing) {
      existing.title = title || "sem título"
      existing.content = content || "sem conteúdo"
    }
} else {
    //Criando um novo prompt
    const newPrompt = {
      id: Date.now().toString(),
      title: title || "sem título",
      content: content || "sem conteúdo",
    }

state.prompts.unshift(newPrompt)
state.selectedId = newPrompt.id
}

//Atualiza a lista de prompts exibida
  persist()
  load ()
  renderList(elements.search.value)

//Limpa campos e atualiza estados
elements.promptTitle.textContent = ""
elements.promptContent.textContent = ""
state.selectedId = null
updateAllEditableStates()

alert("Prompt salvo com sucesso!")
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prompts))
  } catch (error) {
    console.error("Erro ao salvar os prompts no localStorage:", error)
  }
}

function load() {
  try {
    const storedPrompts = localStorage.getItem(STORAGE_KEY)

    if (storedPrompts) {
    state.prompts = JSON.parse(storedPrompts)
    }else {
    state.prompts = []
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    }

    state.selectedId = null
  } catch (error) {
    console.log("Erro ao carregar os prompts do localStorage:", error)
  }
}

function createPromptItem(prompt) {
  return `
    <li class="prompt-item" data-id="${prompt.id}" data-action="select">
      <div class="prompt-item-content">
        <span class="prompt-item-title">${prompt.title}</span>
        <span class="prompt-item-description">${prompt.content}</span>
      </div>
    <button class="btn-icon" title="Remover" data-action="remove">
      <img src="assets/remove.svg" alt="Remover" class="icon icon-trash" />
    </button>
    </li>
  `
}

function renderList(filterText = "") {
  const filteredPrompts = state.prompts.filter((prompt) =>
    prompt.title.toLowerCase().includes(filterText.toLowerCase().trim())
).map((p) => createPromptItem(p)).join("")

elements.list.innerHTML = filteredPrompts
}

function newPrompt() {
  state.selectedId = null
  elements.promptTitle.textContent = ""
  elements.promptContent.textContent = ""
  updateAllEditableStates()
  
  if(!elements.promptTitle.hasAttribute("tabindex")) {
    elements.promptTitle.setAttribute("tabindex", "0");
  }

  elements.promptTitle.focus({preventScroll: true})
}

function copySelected() {
  try {
    const content = elements.promptContent
    navigator.clipboard.writeText(content.innerHTML)

    alert("Prompt copiado para a área de transferência!")

  } catch (error) {
    console.log("Erro ao copiar o prompt para a área de transferência:", error)
  }
}

//Eventos dos botões
elements.btnSave.addEventListener("click", save) 
elements.btnNew.addEventListener("click", newPrompt)
elements.btnCopy.addEventListener("click", copySelected)

elements.search.addEventListener("input", function (event) {
  renderList(event.target.value)
})

elements.list.addEventListener("click", function(event) {
  const removeBtn = event.target.closest("[data-action='remove']")
  const item = event.target.closest("[data-id]")

  if (!item) return

  const id = item.getAttribute("data-id")
  state.selectedId = id

  //Remover prompt
  if (removeBtn) {
    state.prompts = state.prompts.filter((p) => p.id !== id)
    renderList(elements.search.value)
    persist()
    return
  }

  if (event.target.closest("[data-action='select']")) {
    const prompt = state.prompts.find((p) => p.id === id)

    if (prompt) {
      elements.promptTitle.textContent = prompt.title
      elements.promptContent.innerHTML = prompt.content
      updateAllEditableStates()
    }
  }
})

// Inicialização
function init() {
  load()
  renderList("")
  attachAllEditableHandlers()
  updateAllEditableStates()
}

//Estado inicial sidebar aberta, botão de abrir escondido
elements.sidebar.style.display = "";
elements.btnOpen.style.display = "none";

//Eventos para abrir/fechar sidebar
elements.btnOpen.addEventListener("click", openSidebar);
elements.btnCollapse.addEventListener("click", closeSidebar);

// Executa a inicialização ao carregar o script
init()

