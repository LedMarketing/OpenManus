// Variáveis globais
let currentTab = 'chat';
let chatHistory = [];
let isProcessing = false;

// Templates para diferentes tipos de solicitações
const templates = {
    code: "Crie um script em JavaScript para ",
    scrape: "Extraia dados do site: ",
    api: "Desenvolva uma API REST com Node.js para ",
    automation: "Crie um script de automação para "
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAPIStatus();
});

function initializeApp() {
    // Configurar tabs
    setupTabs();
    
    // Configurar auto-resize para textareas
    setupAutoResize();
    
    // Carregar histórico do localStorage
    loadHistory();
    
    // Focar no input do chat
    document.getElementById('chatInput').focus();
}

function setupEventListeners() {
    // Enter para enviar mensagem no chat
    document.getElementById('chatInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });

    // Mudança no tipo de scraping
    document.getElementById('scrapeType').addEventListener('change', function() {
        const type = this.value;
        const selectorsGroup = document.getElementById('selectorsGroup');
        const requirementsGroup = document.getElementById('requirementsGroup');
        
        selectorsGroup.style.display = type === 'advanced' ? 'block' : 'none';
        requirementsGroup.style.display = type === 'generate' ? 'block' : 'none';
    });
}

function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // Remover classe active de todos os botões e conteúdos
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Adicionar classe active ao botão e conteúdo clicado
            this.classList.add('active');
            document.getElementById(tabName + 'Tab').classList.add('active');
            
            currentTab = tabName;
        });
    });
}

function setupAutoResize() {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    });
}

// Funções de template
function setTemplate(type) {
    const template = templates[type];
    if (template) {
        document.getElementById('chatInput').value = template;
        document.getElementById('chatInput').focus();
        
        // Mudar para a aba de chat
        document.querySelector('[data-tab="chat"]').click();
    }
}

function setPrompt(prompt) {
    document.getElementById('chatInput').value = prompt;
    document.getElementById('chatInput').focus();
    document.querySelector('[data-tab="chat"]').click();
}

function clearInput() {
    if (currentTab === 'chat') {
        document.getElementById('chatInput').value = '';
        document.getElementById('chatInput').focus();
    }
}

// Funções de chat
async function sendChatMessage() {
    if (isProcessing) return;
    
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) {
        showToast('Por favor, digite uma mensagem.', 'warning');
        return;
    }
    
    // Adicionar mensagem do usuário ao chat
    addMessageToChat('user', message);
    
    // Limpar input
    input.value = '';
    input.style.height = 'auto';
    
    // Mostrar loading
    showLoading();
    isProcessing = true;
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                context: chatHistory.slice(-5) // Últimas 5 mensagens para contexto
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            addMessageToChat('assistant', data.response);
            saveToHistory(message, data.response);
        } else {
            throw new Error(data.error || 'Erro desconhecido');
        }
        
    } catch (error) {
        console.error('Erro no chat:', error);
        addMessageToChat('assistant', 'Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.');
        showToast('Erro ao enviar mensagem: ' + error.message, 'error');
    } finally {
        hideLoading();
        isProcessing = false;
        input.focus();
    }
}

// Funções de scraping
async function performScraping() {
    if (isProcessing) return;
    
    const url = document.getElementById('scrapeUrl').value.trim();
    const type = document.getElementById('scrapeType').value;
    
    if (!url) {
        showToast('Por favor, insira uma URL.', 'warning');
        return;
    }
    
    if (!isValidUrl(url)) {
        showToast('Por favor, insira uma URL válida.', 'error');
        return;
    }
    
    showLoading();
    isProcessing = true;
    
    try {
        let response;
        
        if (type === 'basic') {
            response = await fetch('/api/scrape-basic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
        } else if (type === 'advanced') {
            const selectorsText = document.getElementById('selectors').value.trim();
            let selectors = {};
            
            if (selectorsText) {
                try {
                    selectors = JSON.parse(selectorsText);
                } catch (e) {
                    throw new Error('Formato JSON inválido nos seletores');
                }
            }
            
            response = await fetch('/api/scrape-advanced', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, selectors })
            });
        } else if (type === 'generate') {
            const requirements = document.getElementById('requirements').value.trim();
            
            response = await fetch('/api/generate-scraper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, requirements })
            });
        }
        
        const data = await response.json();
        
        if (data.success) {
            if (type === 'generate') {
                addMessageToChat('assistant', `Script de scraping gerado para ${url}:\n\n${data.script}`);
            } else {
                const formattedData = formatScrapingResults(data.data, url);
                addMessageToChat('assistant', formattedData);
            }
            showToast('Extração concluída com sucesso!', 'success');
        } else {
            throw new Error(data.error || 'Erro na extração');
        }
        
    } catch (error) {
        console.error('Erro no scraping:', error);
        addMessageToChat('assistant', `Erro ao extrair dados de ${url}: ${error.message}`);
        showToast('Erro na extração: ' + error.message, 'error');
    } finally {
        hideLoading();
        isProcessing = false;
    }
}

// Função para gerar código
async function generateCode() {
    if (isProcessing) return;
    
    const prompt = document.getElementById('codePrompt').value.trim();
    const language = document.getElementById('codeLanguage').value;
    const requirements = document.getElementById('codeRequirements').value.trim();
    
    if (!prompt) {
        showToast('Por favor, descreva o código que você quer gerar.', 'warning');
        return;
    }
    
    showLoading();
    isProcessing = true;
    
    try {
        const response = await fetch('/api/generate-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, language, requirements })
        });
        
        const data = await response.json();
        
        if (data.success) {
            addMessageToChat('assistant', `Código ${language} gerado:\n\n${data.code}`);
            showToast('Código gerado com sucesso!', 'success');
        } else {
            throw new Error(data.error || 'Erro na geração de código');
        }
        
    } catch (error) {
        console.error('Erro na geração de código:', error);
        addMessageToChat('assistant', `Erro ao gerar código: ${error.message}`);
        showToast('Erro na geração: ' + error.message, 'error');
    } finally {
        hideLoading();
        isProcessing = false;
    }
}

// Funções de interface
function addMessageToChat(sender, content) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.innerHTML = processMessageContent(content);
    
    contentDiv.appendChild(textDiv);
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Adicionar botões de cópia aos blocos de código
    addCopyButtonsToCodeBlocks();
    
    // Aplicar syntax highlighting
    if (typeof Prism !== 'undefined') {
        Prism.highlightAllUnder(messageDiv);
    }
}

function processMessageContent(content) {
    // Converter blocos de código markdown para HTML
    content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, language, code) {
        const lang = language || 'text';
        const escapedCode = escapeHtml(code.trim());
        return `
            <div class="code-block">
                <div class="code-header">
                    <span class="code-language">${lang.toUpperCase()}</span>
                    <button class="copy-btn" onclick="copyCode(this)">
                        <i class="fas fa-copy"></i> Copiar
                    </button>
                </div>
                <pre><code class="language-${lang}">${escapedCode}</code></pre>
            </div>
        `;
    });
    
    // Converter código inline
    content = content.replace(/`([^`]+)`/g, '<code style="background: #f1f1f1; padding: 2px 4px; border-radius: 3px;">$1</code>');
    
    // Converter quebras de linha
    content = content.replace(/\n/g, '<br>');
    
    // Converter texto em negrito
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Converter URLs para links
    content = content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    
    return content;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function addCopyButtonsToCodeBlocks() {
    const copyButtons = document.querySelectorAll('.copy-btn:not([data-listener])');
    copyButtons.forEach(button => {
        button.setAttribute('data-listener', 'true');
    });
}

function copyCode(button) {
    const codeBlock = button.closest('.code-block');
    const code = codeBlock.querySelector('code').textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('copied');
        }, 2000);
        
        showToast('Código copiado para a área de transferência!', 'success');
    }).catch(err => {
        console.error('Erro ao copiar código:', err);
        showToast('Erro ao copiar código. Tente selecionar manualmente.', 'error');
    });
}

function formatScrapingResults(data, url) {
    let result = `**Dados extraídos de:** ${url}\n\n`;
    
    if (data.title) {
        result += `**Título:** ${data.title}\n\n`;
    }
    
    if (data.description) {
        result += `**Descrição:** ${data.description}\n\n`;
    }
    
    if (data.headings) {
        result += `**Cabeçalhos:**\n`;
        if (data.headings.h1 && data.headings.h1.length > 0) {
            result += `- H1: ${data.headings.h1.join(', ')}\n`;
        }
        if (data.headings.h2 && data.headings.h2.length > 0) {
            result += `- H2: ${data.headings.h2.slice(0, 5).join(', ')}\n`;
        }
        result += '\n';
    }
    
    if (data.links && data.links.length > 0) {
        result += `**Links encontrados (${data.links.length}):**\n`;
        data.links.slice(0, 10).forEach(link => {
            if (link.text && link.href) {
                result += `- [${link.text}](${link.href})\n`;
            }
        });
        result += '\n';
    }
    
    if (data.images && data.images.length > 0) {
        result += `**Imagens encontradas (${data.images.length}):**\n`;
        data.images.slice(0, 5).forEach(img => {
            result += `- ${img.alt || 'Sem alt'}: ${img.src}\n`;
        });
        result += '\n';
    }
    
    // Dados customizados para scraping avançado
    for (const [key, value] of Object.entries(data)) {
        if (!['title', 'description', 'headings', 'links', 'images', 'url', 'text'].includes(key)) {
            result += `**${key}:**\n`;
            if (Array.isArray(value)) {
                value.forEach(item => {
                    if (typeof item === 'object' && item.text) {
                        result += `- ${item.text}\n`;
                    } else {
                        result += `- ${JSON.stringify(item)}\n`;
                    }
                });
            } else {
                result += `${JSON.stringify(value, null, 2)}\n`;
            }
            result += '\n';
        }
    }
    
    return result;
}

// Funções de utilidade
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
    updateStatus('Processando...', false);
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
    updateStatus('Online', true);
}

function updateStatus(text, isOnline) {
    const statusIndicator = document.getElementById('statusIndicator');
    const icon = statusIndicator.querySelector('i');
    const span = statusIndicator.querySelector('span');
    
    span.textContent = text;
    icon.style.color = isOnline ? '#2ecc71' : '#f39c12';
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 
                 type === 'warning' ? 'exclamation-triangle' : 'info-circle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Remover toast após 5 segundos
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Funções de histórico
function saveToHistory(userMessage, assistantResponse) {
    const historyItem = {
        id: Date.now(),
        userMessage,
        assistantResponse,
        timestamp: new Date().toISOString()
    };
    
    chatHistory.push(historyItem);
    
    // Manter apenas os últimos 50 itens
    if (chatHistory.length > 50) {
        chatHistory = chatHistory.slice(-50);
    }
    
    // Salvar no localStorage
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    
    // Atualizar interface do histórico
    updateHistoryUI();
}

function loadHistory() {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
        try {
            chatHistory = JSON.parse(saved);
            updateHistoryUI();
        } catch (e) {
            console.error('Erro ao carregar histórico:', e);
            chatHistory = [];
        }
    }
}

function updateHistoryUI() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    // Mostrar apenas os últimos 10 itens
    const recentHistory = chatHistory.slice(-10).reverse();
    
    recentHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const title = item.userMessage.length > 50 ? 
                     item.userMessage.substring(0, 50) + '...' : 
                     item.userMessage;
        
        const time = new Date(item.timestamp).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        historyItem.innerHTML = `
            <div style="font-weight: 500; margin-bottom: 5px;">${title}</div>
            <div style="font-size: 0.8rem; color: #666;">${time}</div>
        `;
        
        historyItem.addEventListener('click', () => {
            addMessageToChat('user', item.userMessage);
            addMessageToChat('assistant', item.assistantResponse);
        });
        
        historyList.appendChild(historyItem);
    });
}

// Verificar status da API
async function checkAPIStatus() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        
        if (data.status === 'online') {
            updateStatus('Online', true);
        } else {
            updateStatus('Offline', false);
        }
    } catch (error) {
        console.error('Erro ao verificar status da API:', error);
        updateStatus('Erro de conexão', false);
    }
}

// Verificar status periodicamente
setInterval(checkAPIStatus, 30000); // A cada 30 segundos

// Exportar funções para uso global
window.setTemplate = setTemplate;
window.setPrompt = setPrompt;
window.clearInput = clearInput;
window.sendChatMessage = sendChatMessage;
window.performScraping = performScraping;
window.generateCode = generateCode;
window.copyCode = copyCode;