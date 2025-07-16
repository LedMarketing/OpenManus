#!/usr/bin/env python3
"""
Servidor web simples para preview da interface OpenManus
Execute: python server.py
Acesse: http://localhost:8000
"""

import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

# Configurações
PORT = 8000
DIRECTORY = "web_interface"

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Adicionar headers CORS para desenvolvimento
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    # Verificar se o diretório existe
    if not os.path.exists(DIRECTORY):
        print(f"❌ Diretório '{DIRECTORY}' não encontrado!")
        print("Execute este script na raiz do projeto OpenManus.")
        return
    
    # Verificar se index.html existe
    index_path = Path(DIRECTORY) / "index.html"
    if not index_path.exists():
        print(f"❌ Arquivo '{index_path}' não encontrado!")
        return
    
    # Iniciar servidor
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print("🚀 Servidor OpenManus Web Interface iniciado!")
        print(f"📱 Acesse: http://localhost:{PORT}")
        print(f"📁 Servindo arquivos de: {os.path.abspath(DIRECTORY)}")
        print("⏹️  Pressione Ctrl+C para parar")
        
        # Tentar abrir no navegador automaticamente
        try:
            webbrowser.open(f"http://localhost:{PORT}")
            print("🌐 Abrindo navegador automaticamente...")
        except:
            print("💡 Abra manualmente no navegador: http://localhost:8000")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Servidor parado pelo usuário")

if __name__ == "__main__":
    main()