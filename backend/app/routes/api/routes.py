import os
from flask import Blueprint, jsonify, request, current_app
from werkzeug.utils import secure_filename
from app import db
from app.models import Lavoura, Atividade, TipoAtividade, AtividadeImagem

# O Blueprint para a nossa API
api = Blueprint('api', __name__)

# --- Rotas de Lavouras ---

@api.route('/lavouras', methods=['GET'])
def get_lavouras():
    lavouras = Lavoura.query.all()
    return jsonify([l.to_dict() for l in lavouras])

@api.route('/lavouras', methods=['POST'])
def create_lavoura():
    data = request.json
    nova_lavoura = Lavoura(
        nome=data.get('nome'),
        cultura=data.get('cultura'),
        foto_perfil=data.get('foto_perfil') or "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=100&q=80",
        id_usuario_fk=data.get('id_usuario_fk')
    )
    db.session.add(nova_lavoura)
    db.session.commit()
    return jsonify(nova_lavoura.to_dict()), 201

@api.route('/lavouras/<int:id>', methods=['PUT', 'DELETE'])
def handle_lavoura_id(id):
    lavoura = Lavoura.query.get_or_404(id)
    
    if request.method == 'PUT':
        data = request.json
        lavoura.nome = data.get('nome', lavoura.nome)
        lavoura.cultura = data.get('cultura', lavoura.cultura)
        lavoura.foto_perfil = data.get('foto_perfil', lavoura.foto_perfil)
        db.session.commit()
        return jsonify(lavoura.to_dict())
    
    if request.method == 'DELETE':
        db.session.delete(lavoura)
        db.session.commit()
        return jsonify({"message": "Lavoura excluída com sucesso"}), 200

@api.route('/lavouras/<int:id>/pin', methods=['PATCH'])
def toggle_lavoura_pin(id):
    lavoura = Lavoura.query.get_or_404(id)
    lavoura.is_pinned = not getattr(lavoura, 'is_pinned', False)
    db.session.commit()
    return jsonify(lavoura.to_dict())

@api.route('/lavouras/<int:id>/atividades', methods=['GET'])
def get_atividades_lavoura(id):
    atividades = Atividade.query.filter_by(id_lavoura_fk=id).order_by(Atividade.data.asc()).all()
    return jsonify([a.to_dict() for a in atividades])

from datetime import datetime

# --- Rotas de Atividades ---

@api.route('/atividades', methods=['POST'])
def create_atividade():
    data = request.json
    
    # Converter string ISO para objeto datetime se fornecido
    dt_atividade = datetime.now()
    if data.get('data'):
        try:
            # Lida com formatos ISO comuns
            dt_str = data.get('data').replace('Z', '')
            dt_atividade = datetime.fromisoformat(dt_str)
        except Exception as e:
            print(f"Erro ao converter data: {e}")

    nova_atividade = Atividade(
        id_lavoura_fk=data.get('id_lavoura'),
        id_tipo_atividade_fk=data.get('id_tipo_atividade'),
        descricao=data.get('descricao'),
        responsavel=data.get('responsavel') or "Produtor",
        data=dt_atividade
    )
    db.session.add(nova_atividade)
    db.session.flush()
    
    fotos = data.get('fotos', [])
    for foto_url in fotos:
        nova_imagem = AtividadeImagem(id_atividade_fk=nova_atividade.id, foto_url=foto_url)
        db.session.add(nova_imagem)
    
    db.session.commit()
    return jsonify(nova_atividade.to_dict()), 201

@api.route('/atividades/<int:id>', methods=['PUT'])
def update_atividade(id):
    atividade = db.session.get(Atividade, id)
    if not atividade:
        return jsonify({"erro": "Atividade não encontrada"}), 404
    
    data = request.json
    
    # Campos básicos
    atividade.descricao = data.get('descricao', atividade.descricao)
    atividade.id_tipo_atividade_fk = data.get('id_tipo_atividade', atividade.id_tipo_atividade_fk)
    atividade.responsavel = data.get('responsavel', atividade.responsavel)
    
    if data.get('data'):
        try:
            dt_str = data.get('data').replace('Z', '')
            atividade.data = datetime.fromisoformat(dt_str)
        except Exception as e:
            print(f"Erro ao converter data na atualização: {e}")

    # Sincronização de Imagens (Add/Remove)
    if 'fotos' in data:
        novas_urls = data.get('fotos', [])
        imagens_atuais = AtividadeImagem.query.filter_by(id_atividade_fk=id).all()
        urls_atuais = [img.foto_url for img in imagens_atuais]
        
        # Deletar as que não estão na nova lista
        for img in imagens_atuais:
            if img.foto_url not in novas_urls:
                db.session.delete(img)
        
        # Adicionar as novas que não estão na lista atual
        for url in novas_urls:
            if url not in urls_atuais:
                nova_img = AtividadeImagem(id_atividade_fk=id, foto_url=url)
                db.session.add(nova_img)
    
    db.session.commit()
    return jsonify(atividade.to_dict())

@api.route('/atividades/<int:id>', methods=['DELETE'])
def delete_atividade(id):
    atividade = db.session.get(Atividade, id)
    if not atividade:
        return jsonify({"erro": "Atividade não encontrada"}), 404
    
    # Imagens associadas serão deletadas se configurado cascade, 
    # se não, deletamos manualmente
    AtividadeImagem.query.filter_by(id_atividade_fk=id).delete()
    db.session.delete(atividade)
    db.session.commit()
    return '', 204

@api.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"erro": "Nenhum arquivo enviado"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"erro": "Nome do arquivo vazio"}), 400
    
    if file:
        filename = secure_filename(file.filename)
        # Adicionar timestamp para evitar conflitos de nomes
        import time
        filename = f"{int(time.time())}_{filename}"
        
        upload_path = current_app.config['UPLOAD_FOLDER']
        if not os.path.exists(upload_path):
            os.makedirs(upload_path)
            
        file.save(os.path.join(upload_path, filename))
        
        # URL pública para o frontend
        file_url = f"/static/uploads/atividades/{filename}"
        return jsonify({"url": file_url}), 201

@api.route('/tipos-atividade', methods=['GET'])
def get_tipos_atividade():
    tipos = TipoAtividade.query.all()
    return jsonify([t.to_dict() for t in tipos])