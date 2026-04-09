from flask import Blueprint, jsonify, request
from app import db
from app.models import Lavoura, Atividade, TipoAtividade, AtividadeImagem

# O Blueprint para a nossa API
api = Blueprint('api', __name__)

# Rota de teste simples para verificar se o Blueprint está funcionando
@api.route('/status', methods=['GET'])
def api_status():
    return jsonify({
        "status": "API está no ar!",
        "versao": "v1.0"
    })

# --- Rotas de Lavouras ---

@api.route('/lavouras', methods=['GET'])
def get_lavouras():
    lavouras = Lavoura.query.all()
    # Adicionar lógica para pegar a última atividade de cada lavoura para o layout de cards
    return jsonify([l.to_dict() for l in lavouras])

@api.route('/lavouras', methods=['POST'])
def create_lavoura():
    data = request.json
    nova_lavoura = Lavoura(
        nome=data.get('nome'),
        cultura=data.get('cultura'),
        foto_perfil=data.get('foto_perfil'),
        id_usuario_fk=data.get('id_usuario_fk')
    )
    db.session.add(nova_lavoura)
    db.session.commit()
    return jsonify(nova_lavoura.to_dict()), 201

@api.route('/lavouras/<int:id>/atividades', methods=['GET'])
def get_atividades_lavoura(id):
    atividades = Atividade.query.filter_by(id_lavoura_fk=id).order_by(Atividade.data.desc()).all()
    return jsonify([a.to_dict() for a in atividades])

# --- Rotas de Atividades ---

@api.route('/atividades', methods=['POST'])
def create_atividade():
    data = request.json
    nova_atividade = Atividade(
        id_lavoura_fk=data.get('id_lavoura'),
        id_tipo_atividade_fk=data.get('id_tipo_atividade'),
        descricao=data.get('descricao'),
        responsavel=data.get('responsavel')
    )
    db.session.add(nova_atividade)
    db.session.flush() # Para pegar o ID da atividade
    
    # Adicionar imagens se houver
    fotos = data.get('fotos', [])
    for foto_url in fotos:
        nova_imagem = AtividadeImagem(id_atividade_fk=nova_atividade.id, foto_url=foto_url)
        db.session.add(nova_imagem)
    
    db.session.commit()
    return jsonify(nova_atividade.to_dict()), 201

@api.route('/tipos-atividade', methods=['GET'])
def get_tipos_atividade():
    tipos = TipoAtividade.query.all()
    return jsonify([t.to_dict() for t in tipos])