# OpenManus Web Interface

Interface web moderna para interagir com o assistente OpenManus de criação de código e extração de dados.

## 🚀 Características

- **Interface Moderna**: Design responsivo e intuitivo
- **Chat Interativo**: Conversação natural com o assistente
- **Templates Prontos**: Modelos para tarefas comuns
- **Extração de URLs**: Interface específica para extração de dados de sites
- **Histórico**: Acompanhe suas conversas anteriores
- **Ferramentas Visuais**: Status das ferramentas disponíveis
- **Código Copiável**: Copie facilmente o código gerado

## 📋 Pré-requisitos

- Python 3.8+
- OpenManus instalado e configurado
- Navegador web moderno

## 🛠️ Instalação

1. **Clone ou copie os arquivos da interface web**
   ```bash
   cd web_interface
   ```

2. **Instale as dependências**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure o OpenManus**
   - Certifique-se de que o OpenManus está configurado corretamente
   - Verifique o arquivo `config/config.toml` no diretório principal

## 🚀 Execução

1. **Inicie o servidor backend**
   ```bash
   python backend.py
   ```

2. **Acesse a interface**
   - Abra seu navegador
   - Vá para: `http://localhost:5000`

## 📱 Como Usar

### 1. Interface Principal
- **Ações Rápidas**: Clique nos botões para templates prontos
- **Chat**: Digite suas solicitações na área de texto
- **URL**: Use o botão de link para adicionar URLs para extração

### 2. Tipos de Solicitações Suportadas

#### 🕷️ Extração de Dados
```
Extraia dados do site: https://example.com
```

#### 🔧 Criação de APIs
```
Crie uma API REST com FastAPI para gerenciar produtos
```

#### 🤖 Automação
```
Automatize o download de arquivos de um site
```

#### 📊 Análise de Dados
```
Analise os dados do arquivo vendas.csv
```

### 3. Recursos Avançados

#### Templates Personalizados
- Clique em qualquer template na barra lateral
- Modifique conforme necessário
- Execute sua solicitação

#### Histórico
- Visualize conversas anteriores
- Clique para recarregar uma conversa
- Histórico salvo localmente

#### Cópia de Código
- Todo código gerado tem botão "Copiar"
- Suporte a múltiplas linguagens
- Formatação preservada

## 🔧 API Endpoints

### POST /api/chat
Processar mensagens do chat
```json
{
  "message": "Sua solicitação aqui",
  "session_id": "opcional"
}
```

### GET /api/status
Verificar status do sistema
```json
{
  "status": "online",
  "agent_name": "Manus",
  "tools_available": 5
}
```

### POST /api/extract-url
Extração específica de URL
```json
{
  "url": "https://example.com"
}
```

### GET /api/tools
Listar ferramentas disponíveis
```json
{
  "tools": [
    {
      "name": "python_execute",
      "description": "Executar código Python"
    }
  ]
}
```

## 🎨 Personalização

### Modificar Estilos
Edite `styles.css` para personalizar:
- Cores e temas
- Layout e espaçamento
- Animações
- Responsividade

### Adicionar Templates
Em `script.js`, modifique o objeto `templates`:
```javascript
const templates = {
  meu_template: "Meu prompt personalizado para ",
  // ...
};
```

### Configurar Backend
Em `backend.py`, você pode:
- Adicionar novos endpoints
- Modificar processamento de mensagens
- Integrar com banco de dados
- Adicionar autenticação

## 🔒 Segurança

- **CORS**: Configurado para desenvolvimento
- **Validação**: Entrada de usuário validada
- **Sanitização**: HTML escapado automaticamente
- **Rate Limiting**: Implemente conforme necessário

## 🐛 Solução de Problemas

### Erro de Conexão
```bash
# Verifique se o OpenManus está configurado
python -c "from app.agent.manus import Manus; print('OK')"
```

### Porta em Uso
```bash
# Use uma porta diferente
python backend.py --port 5001
```

### Dependências
```bash
# Reinstale as dependências
pip install -r requirements.txt --force-reinstall
```

## 📈 Monitoramento

### Logs
- Backend: Console do Python
- Frontend: Console do navegador (F12)
- OpenManus: Arquivo de log configurado

### Performance
- Tempo de resposta mostrado na interface
- Status das ferramentas em tempo real
- Indicadores visuais de processamento

## 🚀 Deploy em Produção

### Usando Gunicorn
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 backend:app
```

### Usando Docker
```dockerfile
FROM python:3.9
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
CMD ["python", "backend.py"]
```

### Nginx (Proxy Reverso)
```nginx
server {
    listen 80;
    location / {
        proxy_pass http://localhost:5000;
    }
}
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.

## 🆘 Suporte

- **Issues**: Reporte bugs no GitHub
- **Documentação**: Consulte a documentação do OpenManus
- **Comunidade**: Participe das discussões

---

**Desenvolvido com ❤️ para a comunidade OpenManus**