import os
from flask import Blueprint, jsonify, request, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from app import db
from app.models import Lavoura, Atividade, TipoAtividade, AtividadeImagem, Funcionario, Maquinario, Usuario

# O Blueprint para a nossa API
api = Blueprint('api', __name__)

# --- Rotas de Perfil ---

@api.route('/perfil', methods=['GET'])
def get_perfil():
    # Se não estiver logado (e para facilitar testes enquanto o front não envia cookies/auth)
    # vamos pegar o primeiro usuário se o current_user não estiver autenticado.
    # TODO: Remover fallback para produção
    user = current_user
    if not user.is_authenticated:
        user = Usuario.query.first()
        if not user:
            return jsonify({"erro": "Nenhum usuário encontrado"}), 404
            
    return jsonify(user.to_dict())

@api.route('/perfil', methods=['PUT'])
def update_perfil():
    user = current_user
    if not user.is_authenticated:
        user = Usuario.query.first()
        if not user:
            return jsonify({"erro": "Nenhum usuário encontrado"}), 404

    data = request.json
    user.nome = data.get('nome', user.nome)
    user.email = data.get('email', user.email)
    user.foto_url = data.get('foto_url', user.foto_url)
    
    if data.get('senha'):
        user.set_password(data.get('senha'))
        
    db.session.commit()
    return jsonify(user.to_dict())

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
        area_hectares=data.get('area_hectares'),
        localizacao=data.get('localizacao'),
        data_inicio=data.get('data_inicio'),
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
        if 'area_hectares' in data:
            lavoura.area_hectares = data.get('area_hectares')
        if 'localizacao' in data:
            lavoura.localizacao = data.get('localizacao')
        if 'data_inicio' in data:
            lavoura.data_inicio = data.get('data_inicio')
        db.session.commit()
        return jsonify(lavoura.to_dict())
    
    if request.method == 'DELETE':
        db.session.delete(lavoura)
        db.session.commit()
        return jsonify({"message": "Lavoura excluída com sucesso"}), 200

@api.route('/lavouras/<int:id>', methods=['GET'])
def get_lavoura(id):
    lavoura = Lavoura.query.get_or_404(id)
    return jsonify(lavoura.to_dict())

@api.route('/lavouras/<int:id>/media', methods=['GET'])
def get_lavoura_media(id):
    atividades = Atividade.query.filter_by(id_lavoura_fk=id).all()
    imagens = []
    for atv in atividades:
        for img in atv.imagens:
            imagens.append({
                "id": img.id,
                "foto_url": img.foto_url,
                "data": atv.data.isoformat(),
                "atividade_id": atv.id
            })
    # Ordenar por data mais recente
    imagens.sort(key=lambda x: x['data'], reverse=True)
    return jsonify(imagens)

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

@api.route('/feed', methods=['GET'])
def get_global_feed():
    atividades = Atividade.query.order_by(Atividade.data.desc()).all()
    return jsonify([a.to_dict() for a in atividades])

@api.route('/atividades', methods=['POST'])
def create_atividade():
    try:
        data = request.json
        if not data:
            return jsonify({"erro": "Nenhum dado recebido"}), 400
            
        # Lógica de Data e Hora Inteligente
        dt_atividade = datetime.now()
        if data.get('data'):
            try:
                if len(data.get('data')) <= 10:
                    data_fornecida = datetime.fromisoformat(data.get('data')).date()
                    if data_fornecida == datetime.now().date():
                        dt_atividade = datetime.now()
                    else:
                        dt_atividade = datetime.combine(data_fornecida, datetime.min.time().replace(hour=12))
                else:
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
    except Exception as e:
        db.session.rollback()
        print(f"ERRO CRÍTICO NO BACKEND: {str(e)}")
        return jsonify({"erro": str(e)}), 500

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
            # Lógica de Data e Hora Inteligente para Update
            if len(data.get('data')) <= 10:
                data_fornecida = datetime.fromisoformat(data.get('data')).date()
                if data_fornecida == datetime.now().date():
                    atividade.data = datetime.now()
                else:
                    atividade.data = datetime.combine(data_fornecida, datetime.min.time().replace(hour=12))
            else:
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

@api.route('/tipos-atividade', methods=['POST'])
def create_tipo_atividade():
    data = request.json
    novo_tipo = TipoAtividade(
        nome=data.get('nome'),
        icone=data.get('icone') or "Search",
        cor=data.get('cor') or "bg-gray-500"
    )
    db.session.add(novo_tipo)
    db.session.commit()
    return jsonify(novo_tipo.to_dict()), 201

@api.route('/tipos-atividade/<int:id>', methods=['PUT', 'DELETE'])
def handle_tipo_atividade(id):
    tipo = TipoAtividade.query.get_or_404(id)
    
    if request.method == 'PUT':
        data = request.json
        tipo.nome = data.get('nome', tipo.nome)
        tipo.icone = data.get('icone', tipo.icone)
        tipo.cor = data.get('cor', tipo.cor)
        db.session.commit()
        return jsonify(tipo.to_dict())
    
    if request.method == 'DELETE':
        # Check if any activities are using this type
        from app.models.atividade import Atividade
        if Atividade.query.filter_by(id_tipo_atividade_fk=tipo.id).first():
            return jsonify({"erro": "Não é possível excluir esta categoria pois ela possui atividades vinculadas."}), 400
            
        db.session.delete(tipo)
        db.session.commit()
        return jsonify({"message": "Tipo de atividade excluído"}), 200

@api.route('/tipos-atividade', methods=['GET'])
def get_tipos_atividade():
    tipos = TipoAtividade.query.all()
    return jsonify([t.to_dict() for t in tipos])
# --- Rotas de Funcionários ---

@api.route('/funcionarios', methods=['GET'])
def get_funcionarios():
    funcionarios = Funcionario.query.all()
    return jsonify([f.to_dict() for f in funcionarios])

@api.route('/funcionarios', methods=['POST'])
def create_funcionario():
    data = request.json
    novo = Funcionario(
        nome=data.get('nome'),
        cargo=data.get('cargo'),
        salario_hora=data.get('salario_hora'),
        contato=data.get('contato')
    )
    db.session.add(novo)
    db.session.commit()
    return jsonify(novo.to_dict()), 201

@api.route('/funcionarios/<int:id>', methods=['PUT', 'DELETE'])
def handle_funcionario(id):
    func = Funcionario.query.get_or_404(id)
    if request.method == 'PUT':
        data = request.json
        func.nome = data.get('nome', func.nome)
        func.cargo = data.get('cargo', func.cargo)
        func.salario_hora = data.get('salario_hora', func.salario_hora)
        func.contato = data.get('contato', func.contato)
        db.session.commit()
        return jsonify(func.to_dict())
    if request.method == 'DELETE':
        db.session.delete(func)
        db.session.commit()
        return jsonify({"message": "Funcionário excluído"}), 200

# --- Rotas de Maquinário ---

@api.route('/maquinarios', methods=['GET'])
def get_maquinarios():
    maquinas = Maquinario.query.all()
    return jsonify([m.to_dict() for m in maquinas])

@api.route('/maquinarios', methods=['POST'])
def create_maquinario():
    data = request.json
    novo = Maquinario(
        tipo=data.get('tipo'),
        modelo=data.get('modelo'),
        valor_hora=data.get('valor_hora'),
        consumo_medio=data.get('consumo_medio')
    )
    db.session.add(novo)
    db.session.commit()
    return jsonify(novo.to_dict()), 201

@api.route('/maquinarios/<int:id>', methods=['PUT', 'DELETE'])
def handle_maquinario(id):
    maquina = Maquinario.query.get_or_404(id)
    if request.method == 'PUT':
        data = request.json
        maquina.tipo = data.get('tipo', maquina.tipo)
        maquina.modelo = data.get('modelo', maquina.modelo)
        maquina.valor_hora = data.get('valor_hora', maquina.valor_hora)
        maquina.consumo_medio = data.get('consumo_medio', maquina.consumo_medio)
        db.session.commit()
        return jsonify(maquina.to_dict())
    if request.method == 'DELETE':
        db.session.delete(maquina)
        db.session.commit()
        return jsonify({"message": "Maquinário excluído"}), 200
