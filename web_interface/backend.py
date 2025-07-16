"""
Backend Flask para integração com OpenManus
Este arquivo conecta a interface web com o sistema OpenManus
"""

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import asyncio
import json
import logging
from datetime import datetime
import sys
import os

# Adicionar o diretório pai ao path para importar o OpenManus
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.agent.manus import Manus
from app.logger import logger

app = Flask(__name__)
CORS(app)

# Configurar logging
logging.basicConfig(level=logging.INFO)

# Instância global do agente Manus
manus_agent = None

def get_manus_agent():
    """Obter ou criar instância do agente Manus"""
    global manus_agent
    if manus_agent is None:
        manus_agent = Manus()
    return manus_agent

@app.route('/')
def index():
    """Servir a página principal"""
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    """Endpoint principal para processar mensagens do chat"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                'error': 'Mensagem não fornecida',
                'success': False
            }), 400
        
        user_message = data['message']
        session_id = data.get('session_id', 'default')
        
        logger.info(f"Processando mensagem do usuário: {user_message[:100]}...")
        
        # Executar o agente Manus de forma assíncrona
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            agent = get_manus_agent()
            response = loop.run_until_complete(agent.run(user_message))
            
            return jsonify({
                'response': response,
                'success': True,
                'session_id': session_id,
                'timestamp': datetime.now().isoformat()
            })
            
        finally:
            loop.close()
            
    except Exception as e:
        logger.error(f"Erro ao processar mensagem: {str(e)}")
        return jsonify({
            'error': f'Erro interno do servidor: {str(e)}',
            'success': False
        }), 500

@app.route('/api/status', methods=['GET'])
def status():
    """Verificar status do sistema"""
    try:
        agent = get_manus_agent()
        return jsonify({
            'status': 'online',
            'agent_name': agent.name,
            'tools_available': len(agent.available_tools.tools),
            'max_steps': agent.max_steps,
            'success': True
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'success': False
        }), 500

@app.route('/api/tools', methods=['GET'])
def get_tools():
    """Listar ferramentas disponíveis"""
    try:
        agent = get_manus_agent()
        tools_info = []
        
        for tool in agent.available_tools.tools:
            tools_info.append({
                'name': tool.name,
                'description': tool.description,
                'parameters': tool.parameters
            })
        
        return jsonify({
            'tools': tools_info,
            'success': True
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/api/templates', methods=['GET'])
def get_templates():
    """Obter templates de prompts"""
    templates = {
        'webscraping': {
            'title': 'Web Scraping',
            'description': 'Extrair dados de sites web',
            'prompt': 'Crie um script Python para extrair dados do site: {url}',
            'example': 'https://example.com'
        },
        'api': {
            'title': 'Criar API',
            'description': 'Desenvolver API REST',
            'prompt': 'Desenvolva uma API REST com FastAPI para {purpose}',
            'example': 'gerenciar usuários'
        },
        'automation': {
            'title': 'Automação',
            'description': 'Automatizar tarefas repetitivas',
            'prompt': 'Crie um script de automação para {task}',
            'example': 'enviar emails automaticamente'
        },
        'dataanalysis': {
            'title': 'Análise de Dados',
            'description': 'Analisar e processar dados',
            'prompt': 'Analise e processe os dados de {source}',
            'example': 'arquivo CSV com vendas'
        }
    }
    
    return jsonify({
        'templates': templates,
        'success': True
    })

@app.route('/api/history', methods=['GET'])
def get_history():
    """Obter histórico de conversas (simulado)"""
    # Em uma implementação real, isso viria de um banco de dados
    history = [
        {
            'id': 1,
            'title': 'Extração de dados - E-commerce',
            'timestamp': '2024-01-15T10:30:00',
            'preview': 'Extrair produtos de loja online...'
        },
        {
            'id': 2,
            'title': 'API de usuários - FastAPI',
            'timestamp': '2024-01-14T15:45:00',
            'preview': 'Criar API REST para gerenciar usuários...'
        }
    ]
    
    return jsonify({
        'history': history,
        'success': True
    })

@app.route('/api/extract-url', methods=['POST'])
def extract_url():
    """Endpoint específico para extração de dados de URL"""
    try:
        data = request.get_json()
        url = data.get('url')
        
        if not url:
            return jsonify({
                'error': 'URL não fornecida',
                'success': False
            }), 400
        
        # Criar prompt específico para extração de URL
        prompt = f"Extraia dados estruturados da URL: {url}. Crie um script Python completo que faça web scraping desta página e salve os dados em formato JSON e CSV."
        
        # Processar com o agente Manus
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            agent = get_manus_agent()
            response = loop.run_until_complete(agent.run(prompt))
            
            return jsonify({
                'response': response,
                'url': url,
                'success': True,
                'timestamp': datetime.now().isoformat()
            })
            
        finally:
            loop.close()
            
    except Exception as e:
        logger.error(f"Erro ao extrair dados da URL: {str(e)}")
        return jsonify({
            'error': f'Erro ao processar URL: {str(e)}',
            'success': False
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint não encontrado',
        'success': False
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Erro interno do servidor',
        'success': False
    }), 500

if __name__ == '__main__':
    print("🚀 Iniciando servidor OpenManus Web Interface...")
    print("📱 Interface disponível em: http://localhost:5000")
    print("🔧 API disponível em: http://localhost:5000/api/")
    
    # Inicializar o agente na inicialização
    try:
        get_manus_agent()
        print("✅ Agente OpenManus inicializado com sucesso!")
    except Exception as e:
        print(f"❌ Erro ao inicializar agente: {e}")
    
    app.run(debug=True, host='0.0.0.0', port=5000)