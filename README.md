# Assistente Web de Código e Extração de Dados

Uma aplicação web moderna em JavaScript que utiliza a API da Mistral AI para criar códigos e extrair dados de sites web.

## 🚀 Características

- **Interface Web Moderna**: Design responsivo e intuitivo
- **Integração com Mistral AI**: Powered by Mistral AI para geração inteligente de código
- **Web Scraping Avançado**: Extração de dados básica e avançada com Puppeteer e Cheerio
- **Geração de Código**: Suporte para JavaScript, Python, HTML, CSS, Node.js e React
- **Chat Interativo**: Conversação natural com o assistente IA
- **Histórico**: Acompanhe suas conversas e extrações anteriores
- **Templates Prontos**: Modelos para tarefas comuns

## 📋 Pré-requisitos

- Node.js 16+ 
- NPM ou Yarn
- Chave da API Mistral AI

## 🛠️ Instalação

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd web-code-assistant
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   ```
   
   Edite o arquivo `.env` com suas configurações:
   ```env
   PORT=3000
   MISTRAL_API_KEY=S1VlGPjrSMIIQ3IIKYIw2LhNhlurxQmC
   NODE_ENV=development
   ```

4. **Inicie o servidor**
   ```bash
   npm start
   ```
   
   Para desenvolvimento com auto-reload:
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação**
   - Interface Web: `http://localhost:3000`
   - API Status: `http://localhost:3000/api/status`

## 📱 Como Usar

### 1. Chat com IA
- Digite suas solicitações na aba "Chat"
- Peça para criar códigos, explicar conceitos ou gerar scripts
- Use linguagem natural: "Crie um script para extrair dados de um e-commerce"

### 2. Web Scraping
- **Básico**: Extrai título, links, imagens e metadados
- **Avançado**: Use seletores CSS personalizados em formato JSON
- **Gerar Script**: Crie um script personalizado de scraping

### 3. Geração de Código
- Descreva o código que você quer
- Escolha a linguagem (JavaScript, Python, HTML, CSS, etc.)
- Adicione requisitos específicos

## 🔧 API Endpoints

### POST /api/chat
Conversa com a IA
```json
{
  "message": "Crie um script para extrair dados",
  "context": []
}
```

### POST /api/scrape-basic
Extração básica de dados
```json
{
  "url": "https://example.com"
}
```

### POST /api/scrape-advanced
Extração avançada com seletores
```json
{
  "url": "https://example.com",
  "selectors": {
    "titles": "h1, h2",
    "prices": ".price"
  }
}
```

### POST /api/generate-code
Geração de código
```json
{
  "prompt": "Criar uma API REST",
  "language": "javascript",
  "requirements": "Com Express e MongoDB"
}
```

### POST /api/generate-scraper
Gerar script de scraping personalizado
```json
{
  "url": "https://example.com",
  "requirements": "Extrair produtos e preços"
}
```

## 🎨 Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Puppeteer** - Automação de browser
- **Cheerio** - Parser HTML server-side
- **Axios** - Cliente HTTP
- **Mistral AI API** - Inteligência artificial

### Frontend
- **HTML5/CSS3** - Interface moderna
- **JavaScript ES6+** - Funcionalidades interativas
- **Prism.js** - Syntax highlighting
- **Font Awesome** - Ícones

### Segurança
- **Helmet** - Headers de segurança
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Proteção contra spam

## 🔒 Segurança

- Rate limiting: 10 requests por minuto por IP
- Validação de URLs
- Sanitização de inputs
- Headers de segurança com Helmet
- Timeout em requisições

## 📊 Exemplos de Uso

### Extrair dados de e-commerce
```javascript
// Chat: "Extraia produtos e preços de https://loja.com"
// Resultado: Script completo de scraping
```

### Criar API REST
```javascript
// Chat: "Crie uma API para gerenciar usuários com Node.js"
// Resultado: Código completo com Express, rotas CRUD
```

### Automatizar tarefas
```javascript
// Chat: "Automatize o download de PDFs de um site"
// Resultado: Script com Puppeteer para automação
```

## 🚀 Deploy

### Usando PM2
```bash
npm install -g pm2
pm2 start server.js --name "web-assistant"
```

### Usando Docker
```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Variáveis de Ambiente para Produção
```env
NODE_ENV=production
PORT=3000
MISTRAL_API_KEY=sua_chave_aqui
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

## 🆘 Suporte

- **Issues**: Reporte bugs no GitHub
- **Documentação**: Consulte este README
- **API Mistral**: [Documentação oficial](https://docs.mistral.ai/)

## 🔄 Atualizações

### v1.0.0
- ✅ Interface web completa
- ✅ Integração com Mistral AI
- ✅ Web scraping básico e avançado
- ✅ Geração de código multi-linguagem
- ✅ Sistema de histórico
- ✅ Rate limiting e segurança

---

**Desenvolvido com ❤️ usando Mistral AI**