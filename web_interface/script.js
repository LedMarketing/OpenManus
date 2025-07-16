// Global variables
let isProcessing = false;
let currentSessionId = generateSessionId();

// Templates for different types of requests
const templates = {
    code: "Crie um script Python para ",
    extract: "Extraia dados do site: ",
    analyze: "Analise os dados de ",
    automate: "Automatize a tarefa de ",
    webscraping: "Crie um web scraper para extrair dados de ",
    api: "Desenvolva uma API REST com FastAPI para ",
    automation: "Crie um script de automação para ",
    dataanalysis: "Analise e processe os dados de "
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadHistory();
});

function initializeApp() {
    // Focus on input
    document.getElementById('userInput').focus();
    
    // Set initial status
    updateStatus('Online', 'Pronto para processar solicitações');
    
    // Load saved preferences
    loadUserPreferences();
}

function setupEventListeners() {
    const userInput = document.getElementById('userInput');
    
    // Enter key to send message
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-resize textarea
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });
}

function setTemplate(type) {
    const userInput = document.getElementById('userInput');
    const template = templates[type];
    
    if (template) {
        userInput.value = template;
        userInput.focus();
        
        // Position cursor at the end
        userInput.setSelectionRange(template.length, template.length);
        
        // Trigger input event to resize textarea
        userInput.dispatchEvent(new Event('input'));
    }
}

function setPrompt(prompt) {
    const userInput = document.getElementById('userInput');
    userInput.value = prompt;
    userInput.focus();
    userInput.dispatchEvent(new Event('input'));
}

function toggleUrlInput() {
    const urlInput = document.getElementById('urlInput');
    const isVisible = urlInput.style.display !== 'none';
    
    urlInput.style.display = isVisible ? 'none' : 'flex';
    
    if (!isVisible) {
        document.getElementById('urlField').focus();
    }
}

function addUrl() {
    const urlField = document.getElementById('urlField');
    const userInput = document.getElementById('userInput');
    const url = urlField.value.trim();
    
    if (url && isValidUrl(url)) {
        const currentText = userInput.value.trim();
        const newText = currentText ? `${currentText}\n\nURL: ${url}` : `Extraia dados da URL: ${url}`;
        
        userInput.value = newText;
        urlField.value = '';
        toggleUrlInput();
        userInput.focus();
        userInput.dispatchEvent(new Event('input'));
    } else {
        alert('Por favor, insira uma URL válida.');
    }
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

async function sendMessage() {
    if (isProcessing) return;
    
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    
    if (!message) {
        alert('Por favor, digite uma mensagem.');
        return;
    }
    
    // Add user message to chat
    addMessageToChat('user', message);
    
    // Clear input
    userInput.value = '';
    userInput.style.height = 'auto';
    
    // Show loading
    showLoading();
    isProcessing = true;
    
    const startTime = Date.now();
    
    try {
        // Simulate API call to OpenManus backend
        const response = await callOpenManusAPI(message);
        
        // Calculate response time
        const responseTime = Date.now() - startTime;
        updateResponseTime(responseTime);
        
        // Add assistant response to chat
        addMessageToChat('assistant', response);
        
        // Save to history
        saveToHistory(message, response);
        
    } catch (error) {
        console.error('Error:', error);
        addMessageToChat('assistant', 'Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.');
    } finally {
        hideLoading();
        isProcessing = false;
        userInput.focus();
    }
}

async function callOpenManusAPI(message) {
    // This would be replaced with actual API call to your OpenManus backend
    // For now, we'll simulate the response based on the message content
    
    return new Promise((resolve) => {
        setTimeout(() => {
            let response = generateMockResponse(message);
            resolve(response);
        }, 2000 + Math.random() * 3000); // Simulate 2-5 second response time
    });
}

function generateMockResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('extrair') || lowerMessage.includes('url') || lowerMessage.includes('site')) {
        return `
Vou ajudá-lo a extrair dados do site. Aqui está um script Python completo:

\`\`\`python
import requests
from bs4 import BeautifulSoup
import pandas as pd
import json

def extrair_dados_site(url):
    """
    Extrai dados de um site web
    """
    try:
        # Fazer requisição HTTP
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # Parsear HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extrair dados (exemplo genérico)
        dados = {
            'titulo': soup.find('title').text if soup.find('title') else 'N/A',
            'descricao': soup.find('meta', {'name': 'description'})['content'] if soup.find('meta', {'name': 'description'}) else 'N/A',
            'links': [a.get('href') for a in soup.find_all('a', href=True)[:10]],
            'imagens': [img.get('src') for img in soup.find_all('img', src=True)[:5]]
        }
        
        return dados
        
    except Exception as e:
        print(f"Erro ao extrair dados: {e}")
        return None

# Exemplo de uso
if __name__ == "__main__":
    url = "https://example.com"  # Substitua pela URL desejada
    dados = extrair_dados_site(url)
    
    if dados:
        print(json.dumps(dados, indent=2, ensure_ascii=False))
        
        # Salvar em CSV
        df = pd.DataFrame([dados])
        df.to_csv('dados_extraidos.csv', index=False)
        print("Dados salvos em 'dados_extraidos.csv'")
\`\`\`

**Instruções de uso:**
1. Instale as dependências: \`pip install requests beautifulsoup4 pandas\`
2. Substitua a URL no código pela URL desejada
3. Execute o script
4. Os dados serão extraídos e salvos em um arquivo CSV

**Recursos incluídos:**
- ✅ Extração de título e descrição
- ✅ Lista de links encontrados
- ✅ Lista de imagens
- ✅ Tratamento de erros
- ✅ Salvamento em CSV
- ✅ Headers para evitar bloqueios

Precisa de alguma modificação específica no código?`;
    }
    
    if (lowerMessage.includes('api') || lowerMessage.includes('fastapi') || lowerMessage.includes('rest')) {
        return `
Vou criar uma API REST completa com FastAPI para você:

\`\`\`python
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from datetime import datetime

# Inicializar FastAPI
app = FastAPI(
    title="Minha API",
    description="API criada com OpenManus",
    version="1.0.0"
)

# Modelos Pydantic
class Item(BaseModel):
    id: Optional[int] = None
    nome: str
    descricao: Optional[str] = None
    preco: float
    categoria: str
    criado_em: Optional[datetime] = None

class ItemCreate(BaseModel):
    nome: str
    descricao: Optional[str] = None
    preco: float
    categoria: str

# Banco de dados simulado
items_db = []
next_id = 1

# Endpoints
@app.get("/")
async def root():
    return {"message": "API funcionando!", "docs": "/docs"}

@app.get("/items", response_model=List[Item])
async def listar_items():
    """Listar todos os itens"""
    return items_db

@app.get("/items/{item_id}", response_model=Item)
async def obter_item(item_id: int):
    """Obter item por ID"""
    item = next((item for item in items_db if item.id == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    return item

@app.post("/items", response_model=Item)
async def criar_item(item: ItemCreate):
    """Criar novo item"""
    global next_id
    
    novo_item = Item(
        id=next_id,
        nome=item.nome,
        descricao=item.descricao,
        preco=item.preco,
        categoria=item.categoria,
        criado_em=datetime.now()
    )
    
    items_db.append(novo_item)
    next_id += 1
    
    return novo_item

@app.put("/items/{item_id}", response_model=Item)
async def atualizar_item(item_id: int, item: ItemCreate):
    """Atualizar item existente"""
    item_existente = next((item for item in items_db if item.id == item_id), None)
    if not item_existente:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    
    item_existente.nome = item.nome
    item_existente.descricao = item.descricao
    item_existente.preco = item.preco
    item_existente.categoria = item.categoria
    
    return item_existente

@app.delete("/items/{item_id}")
async def deletar_item(item_id: int):
    """Deletar item"""
    global items_db
    items_db = [item for item in items_db if item.id != item_id]
    return {"message": "Item deletado com sucesso"}

@app.get("/items/categoria/{categoria}", response_model=List[Item])
async def listar_por_categoria(categoria: str):
    """Listar itens por categoria"""
    items_categoria = [item for item in items_db if item.categoria.lower() == categoria.lower()]
    return items_categoria

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
\`\`\`

**Para executar a API:**
1. Instale as dependências: \`pip install fastapi uvicorn\`
2. Execute: \`python main.py\`
3. Acesse: \`http://localhost:8000/docs\` para ver a documentação interativa

**Recursos incluídos:**
- ✅ CRUD completo (Create, Read, Update, Delete)
- ✅ Validação de dados com Pydantic
- ✅ Documentação automática
- ✅ Tratamento de erros
- ✅ Filtros por categoria
- ✅ Timestamps automáticos

A API está pronta para uso! Quer que eu adicione alguma funcionalidade específica?`;
    }
    
    if (lowerMessage.includes('automatizar') || lowerMessage.includes('automação')) {
        return `
Vou criar um script de automação completo para você:

\`\`\`python
import os
import time
import schedule
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class AutomacaoWeb:
    def __init__(self):
        self.setup_driver()
    
    def setup_driver(self):
        """Configurar driver do Chrome"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # Executar sem interface gráfica
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        
        self.driver = webdriver.Chrome(options=chrome_options)
    
    def monitorar_preco(self, url, seletor_preco, preco_alvo):
        """Monitorar preço de produto"""
        try:
            self.driver.get(url)
            time.sleep(3)
            
            elemento_preco = self.driver.find_element(By.CSS_SELECTOR, seletor_preco)
            preco_atual = float(elemento_preco.text.replace('R$', '').replace(',', '.').strip())
            
            print(f"Preço atual: R$ {preco_atual}")
            
            if preco_atual <= preco_alvo:
                self.enviar_alerta(f"Preço baixou para R$ {preco_atual}!", url)
                
        except Exception as e:
            print(f"Erro ao monitorar preço: {e}")
    
    def baixar_arquivos_automatico(self, urls_download, pasta_destino):
        """Baixar arquivos automaticamente"""
        if not os.path.exists(pasta_destino):
            os.makedirs(pasta_destino)
        
        for url in urls_download:
            try:
                self.driver.get(url)
                time.sleep(2)
                
                # Procurar link de download
                link_download = self.driver.find_element(By.PARTIAL_LINK_TEXT, "Download")
                link_download.click()
                
                print(f"Download iniciado: {url}")
                time.sleep(5)  # Aguardar download
                
            except Exception as e:
                print(f"Erro no download de {url}: {e}")
    
    def preencher_formulario(self, url, dados_formulario):
        """Preencher formulário automaticamente"""
        try:
            self.driver.get(url)
            time.sleep(3)
            
            for campo, valor in dados_formulario.items():
                elemento = self.driver.find_element(By.NAME, campo)
                elemento.clear()
                elemento.send_keys(valor)
            
            # Submeter formulário
            botao_submit = self.driver.find_element(By.TYPE, "submit")
            botao_submit.click()
            
            print("Formulário preenchido e enviado com sucesso!")
            
        except Exception as e:
            print(f"Erro ao preencher formulário: {e}")
    
    def enviar_alerta(self, mensagem, url):
        """Enviar alerta por email"""
        try:
            # Configurações do email
            smtp_server = "smtp.gmail.com"
            smtp_port = 587
            email_usuario = "seu_email@gmail.com"
            email_senha = "sua_senha"
            email_destino = "destino@gmail.com"
            
            msg = MIMEMultipart()
            msg['From'] = email_usuario
            msg['To'] = email_destino
            msg['Subject'] = "Alerta de Automação"
            
            corpo = f"""
            {mensagem}
            
            URL: {url}
            
            Enviado automaticamente pelo sistema de automação.
            """
            
            msg.attach(MIMEText(corpo, 'plain'))
            
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(email_usuario, email_senha)
            server.send_message(msg)
            server.quit()
            
            print("Alerta enviado por email!")
            
        except Exception as e:
            print(f"Erro ao enviar email: {e}")
    
    def fechar(self):
        """Fechar driver"""
        self.driver.quit()

# Exemplo de uso
def executar_automacao():
    automacao = AutomacaoWeb()
    
    # Exemplo 1: Monitorar preço
    automacao.monitorar_preco(
        url="https://exemplo-loja.com/produto",
        seletor_preco=".preco",
        preco_alvo=100.00
    )
    
    # Exemplo 2: Baixar arquivos
    urls_download = [
        "https://site1.com/arquivo1",
        "https://site2.com/arquivo2"
    ]
    automacao.baixar_arquivos_automatico(urls_download, "./downloads")
    
    # Exemplo 3: Preencher formulário
    dados = {
        "nome": "João Silva",
        "email": "joao@email.com",
        "telefone": "(11) 99999-9999"
    }
    automacao.preencher_formulario("https://site.com/formulario", dados)
    
    automacao.fechar()

# Agendar execução automática
schedule.every(30).minutes.do(executar_automacao)  # A cada 30 minutos
schedule.every().day.at("09:00").do(executar_automacao)  # Todo dia às 9h

if __name__ == "__main__":
    print("Sistema de automação iniciado...")
    
    while True:
        schedule.run_pending()
        time.sleep(60)  # Verificar a cada minuto
\`\`\`

**Instalação das dependências:**
\`\`\`bash
pip install selenium schedule
\`\`\`

**Recursos incluídos:**
- ✅ Monitoramento de preços
- ✅ Download automático de arquivos
- ✅ Preenchimento de formulários
- ✅ Alertas por email
- ✅ Agendamento de tarefas
- ✅ Execução em background

**Para usar:**
1. Instale o ChromeDriver
2. Configure suas credenciais de email
3. Adapte os seletores CSS para seus sites
4. Execute o script

Quer que eu customize alguma funcionalidade específica?`;
    }
    
    // Default response for other types of messages
    return `
Entendi sua solicitação! Vou processar isso para você usando as ferramentas do OpenManus.

**Análise da solicitação:**
- Tipo: ${detectRequestType(message)}
- Complexidade: Média
- Ferramentas necessárias: Python Execute, Browser Tool, File Saver

**Próximos passos:**
1. Analisando os requisitos específicos
2. Selecionando as melhores ferramentas
3. Gerando código otimizado
4. Testando a solução

Posso ajudá-lo com:
- 🐍 **Criação de scripts Python**
- 🌐 **Extração de dados de sites**
- 🤖 **Automação de tarefas**
- 📊 **Análise de dados**
- 🔧 **APIs e integrações**

Por favor, forneça mais detalhes sobre o que você gostaria que eu faça especificamente, ou escolha uma das opções acima para que eu possa criar uma solução mais direcionada.`;
}

function detectRequestType(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('extrair') || lowerMessage.includes('scraping')) return 'Extração de Dados';
    if (lowerMessage.includes('api') || lowerMessage.includes('rest')) return 'Desenvolvimento de API';
    if (lowerMessage.includes('automatizar') || lowerMessage.includes('automação')) return 'Automação';
    if (lowerMessage.includes('analisar') || lowerMessage.includes('análise')) return 'Análise de Dados';
    if (lowerMessage.includes('código') || lowerMessage.includes('script')) return 'Desenvolvimento';
    
    return 'Solicitação Geral';
}

function addMessageToChat(sender, content) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Process content for code blocks and formatting
    const processedContent = processMessageContent(content);
    contentDiv.innerHTML = processedContent;
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add copy buttons to code blocks
    addCopyButtonsToCodeBlocks();
}

function processMessageContent(content) {
    // Convert markdown-style code blocks to HTML
    content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, language, code) {
        const lang = language || 'text';
        return `
            <div class="code-block">
                <div class="code-header">
                    <span class="code-language">${lang.toUpperCase()}</span>
                    <button class="copy-btn" onclick="copyCode(this)">
                        <i class="fas fa-copy"></i> Copiar
                    </button>
                </div>
                <pre><code>${escapeHtml(code.trim())}</code></pre>
            </div>
        `;
    });
    
    // Convert inline code
    content = content.replace(/`([^`]+)`/g, '<code style="background: #f1f1f1; padding: 2px 4px; border-radius: 3px;">$1</code>');
    
    // Convert line breaks
    content = content.replace(/\n/g, '<br>');
    
    // Convert **bold** text
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert URLs to links
    content = content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    
    return content;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function addCopyButtonsToCodeBlocks() {
    // This function is called after adding messages to ensure copy buttons work
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(button => {
        if (!button.hasAttribute('data-listener')) {
            button.setAttribute('data-listener', 'true');
        }
    });
}

function copyCode(button) {
    const codeBlock = button.closest('.code-block');
    const code = codeBlock.querySelector('code').textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        button.style.background = '#2ecc71';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '#3498db';
        }, 2000);
    }).catch(err => {
        console.error('Erro ao copiar código:', err);
        alert('Erro ao copiar código. Tente selecionar manualmente.');
    });
}

function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
    updateStatus('Processando', 'OpenManus está trabalhando...');
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
    updateStatus('Online', 'Pronto para processar solicitações');
}

function updateStatus(status, message) {
    const statusItems = document.querySelectorAll('.status-item span');
    if (statusItems.length > 0) {
        statusItems[0].textContent = status;
    }
}

function updateResponseTime(milliseconds) {
    const responseTimeElement = document.getElementById('responseTime');
    const seconds = (milliseconds / 1000).toFixed(1);
    responseTimeElement.textContent = `Tempo de resposta: ${seconds}s`;
}

function saveToHistory(userMessage, assistantResponse) {
    const historyList = document.getElementById('historyList');
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    
    const title = userMessage.length > 50 ? userMessage.substring(0, 50) + '...' : userMessage;
    const time = new Date().toLocaleString('pt-BR');
    
    historyItem.innerHTML = `
        <div class="history-title">${title}</div>
        <div class="history-time">${time}</div>
    `;
    
    historyItem.addEventListener('click', () => {
        addMessageToChat('user', userMessage);
        addMessageToChat('assistant', assistantResponse);
    });
    
    historyList.insertBefore(historyItem, historyList.firstChild);
    
    // Keep only last 10 items
    while (historyList.children.length > 10) {
        historyList.removeChild(historyList.lastChild);
    }
    
    // Save to localStorage
    saveHistoryToStorage();
}

function loadHistory() {
    const savedHistory = localStorage.getItem('openManusHistory');
    if (savedHistory) {
        const history = JSON.parse(savedHistory);
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';
        
        history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-title">${item.title}</div>
                <div class="history-time">${item.time}</div>
            `;
            
            historyItem.addEventListener('click', () => {
                addMessageToChat('user', item.userMessage);
                addMessageToChat('assistant', item.assistantResponse);
            });
            
            historyList.appendChild(historyItem);
        });
    }
}

function saveHistoryToStorage() {
    const historyItems = document.querySelectorAll('.history-item');
    const history = Array.from(historyItems).map(item => ({
        title: item.querySelector('.history-title').textContent,
        time: item.querySelector('.history-time').textContent,
        userMessage: '', // Would need to store these separately
        assistantResponse: ''
    }));
    
    localStorage.setItem('openManusHistory', JSON.stringify(history));
}

function loadUserPreferences() {
    // Load any saved user preferences
    const savedPrefs = localStorage.getItem('openManusPreferences');
    if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        // Apply preferences here
    }
}

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Export functions for global access
window.setTemplate = setTemplate;
window.setPrompt = setPrompt;
window.toggleUrlInput = toggleUrlInput;
window.addUrl = addUrl;
window.sendMessage = sendMessage;
window.copyCode = copyCode;