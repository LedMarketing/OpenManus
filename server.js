const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const helmet = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração da API Mistral
const MISTRAL_API_KEY = 'S1VlGPjrSMIIQ3IIKYIw2LhNhlurxQmC';
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 10, // 10 requests
  duration: 60, // per 60 seconds
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Desabilitar para desenvolvimento
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Rate limiting middleware
app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({
      error: 'Muitas requisições. Tente novamente em alguns segundos.',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000)
    });
  }
});

// Classe para gerenciar interações com Mistral AI
class MistralAI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = MISTRAL_API_URL;
  }

  async generateResponse(messages, options = {}) {
    try {
      const response = await axios.post(this.baseURL, {
        model: options.model || 'mistral-large-latest',
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4000,
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Erro na API Mistral:', error.response?.data || error.message);
      throw new Error('Erro ao processar solicitação com IA');
    }
  }

  async generateCode(prompt, language = 'javascript') {
    const systemPrompt = `Você é um assistente especializado em criação de código. 
    Gere código limpo, bem comentado e funcional em ${language}.
    Sempre inclua explicações sobre como usar o código.
    Formate a resposta com blocos de código markdown.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ];

    return await this.generateResponse(messages);
  }

  async generateScraper(url, requirements) {
    const systemPrompt = `Você é um especialista em web scraping. 
    Crie scripts de extração de dados seguros e eficientes.
    Use bibliotecas como Puppeteer, Cheerio ou Playwright.
    Inclua tratamento de erros e respeite robots.txt.
    Formate a resposta com código JavaScript completo.`;

    const prompt = `Crie um script para extrair dados da URL: ${url}
    Requisitos específicos: ${requirements}
    
    O script deve:
    1. Ser robusto com tratamento de erros
    2. Respeitar rate limits
    3. Salvar dados em formato JSON
    4. Incluir logs informativos`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ];

    return await this.generateResponse(messages);
  }
}

// Classe para Web Scraping
class WebScraper {
  constructor() {
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    return this.browser;
  }

  async scrapeBasicInfo(url) {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      return {
        title: $('title').text().trim(),
        description: $('meta[name="description"]').attr('content') || '',
        keywords: $('meta[name="keywords"]').attr('content') || '',
        headings: {
          h1: $('h1').map((i, el) => $(el).text().trim()).get(),
          h2: $('h2').map((i, el) => $(el).text().trim()).get(),
          h3: $('h3').map((i, el) => $(el).text().trim()).get()
        },
        links: $('a[href]').map((i, el) => ({
          text: $(el).text().trim(),
          href: $(el).attr('href')
        })).get().slice(0, 20),
        images: $('img[src]').map((i, el) => ({
          alt: $(el).attr('alt') || '',
          src: $(el).attr('src')
        })).get().slice(0, 10)
      };
    } catch (error) {
      throw new Error(`Erro ao fazer scraping básico: ${error.message}`);
    }
  }

  async scrapeAdvanced(url, selectors = {}) {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    
    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      const data = await page.evaluate((selectors) => {
        const result = {};
        
        // Extrair dados baseado nos seletores fornecidos
        for (const [key, selector] of Object.entries(selectors)) {
          const elements = document.querySelectorAll(selector);
          result[key] = Array.from(elements).map(el => ({
            text: el.textContent.trim(),
            html: el.innerHTML,
            attributes: Array.from(el.attributes).reduce((acc, attr) => {
              acc[attr.name] = attr.value;
              return acc;
            }, {})
          }));
        }

        // Dados gerais se não houver seletores específicos
        if (Object.keys(selectors).length === 0) {
          result.title = document.title;
          result.url = window.location.href;
          result.text = document.body.textContent.trim().substring(0, 5000);
        }

        return result;
      }, selectors);

      return data;
    } finally {
      await page.close();
    }
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// Instâncias globais
const mistralAI = new MistralAI(MISTRAL_API_KEY);
const webScraper = new WebScraper();

// Rotas da API

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Chat com IA
app.post('/api/chat', async (req, res) => {
  try {
    const { message, context = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    const messages = [
      {
        role: 'system',
        content: `Você é um assistente especializado em:
        1. Criação de código (JavaScript, Python, HTML, CSS, etc.)
        2. Web scraping e extração de dados
        3. Automação de tarefas
        4. APIs e integrações
        
        Sempre forneça respostas práticas com código funcional.
        Use markdown para formatar código.
        Seja claro e didático nas explicações.`
      },
      ...context,
      { role: 'user', content: message }
    ];

    const response = await mistralAI.generateResponse(messages);

    res.json({
      success: true,
      response: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro no chat:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Geração de código
app.post('/api/generate-code', async (req, res) => {
  try {
    const { prompt, language = 'javascript', requirements = '' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt é obrigatório' });
    }

    const fullPrompt = `${prompt}\n\nRequisitos adicionais: ${requirements}`;
    const code = await mistralAI.generateCode(fullPrompt, language);

    res.json({
      success: true,
      code: code,
      language: language,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro na geração de código:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao gerar código'
    });
  }
});

// Extração de dados básica
app.post('/api/scrape-basic', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL é obrigatória' });
    }

    // Validar URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'URL inválida' });
    }

    const data = await webScraper.scrapeBasicInfo(url);

    res.json({
      success: true,
      data: data,
      url: url,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro no scraping básico:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Extração de dados avançada
app.post('/api/scrape-advanced', async (req, res) => {
  try {
    const { url, selectors = {} } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL é obrigatória' });
    }

    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'URL inválida' });
    }

    const data = await webScraper.scrapeAdvanced(url, selectors);

    res.json({
      success: true,
      data: data,
      url: url,
      selectors: selectors,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro no scraping avançado:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Gerar script de scraping personalizado
app.post('/api/generate-scraper', async (req, res) => {
  try {
    const { url, requirements } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL é obrigatória' });
    }

    const script = await mistralAI.generateScraper(url, requirements || 'Extrair dados gerais da página');

    res.json({
      success: true,
      script: script,
      url: url,
      requirements: requirements,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro na geração de scraper:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao gerar script de scraping'
    });
  }
});

// Status da API
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    services: {
      mistralAI: 'connected',
      webScraper: 'ready'
    }
  });
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada'
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Encerrando servidor...');
  await webScraper.closeBrowser();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Encerrando servidor...');
  await webScraper.closeBrowser();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Interface: http://localhost:${PORT}`);
  console.log(`🔧 API: http://localhost:${PORT}/api/status`);
});