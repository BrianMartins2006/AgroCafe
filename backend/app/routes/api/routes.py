from flask import Blueprint, jsonify

# O Blueprint para a nossa API
api = Blueprint('api', __name__)

# Rota de teste simples para verificar se o Blueprint está funcionando
@api.route('/status', methods=['GET'])
def api_status():
    return jsonify({
        "status": "API está no ar!",
        "versao": "v1.0"
    })