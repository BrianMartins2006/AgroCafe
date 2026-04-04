from flask import Blueprint, render_template, request, redirect, url_for, flash, current_app
from flask_login import login_required
from sqlalchemy import select
from app import db
from app.models.cultura_model import Cultura
from app.models.cultivo_model import Cultivo
from datetime import datetime
import os
import time
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

cultivo_bp = Blueprint('cultivo', __name__)

@cultivo_bp.route('/cultivos', methods=['GET'])
@login_required
def listar_cultivos():
    """Lista todos os registros de cultivo."""
    try:
        cultivos = db.session.scalars(select(Cultivo).order_by(Cultivo.data_plantio.desc())).all()
        
        return render_template('cultivo/listar.html', 
                               cultivos=cultivos)
    except Exception as e:
        flash(f'Erro ao carregar dados de cultivo: {e}', 'danger')
        return render_template('cultivo/listar.html', cultivos=[])

@cultivo_bp.route('/cultivos/novo', methods=['GET', 'POST'])
@cultivo_bp.route('/cultivos/editar/<int:id_cultivo>', methods=['GET', 'POST'])
@login_required
def criar_ou_editar_cultivo(id_cultivo=None):
    """
    Trata a criação de um novo cultivo ou a edição de um existente.
    """
    cultivo = None
    
    if id_cultivo:
        cultivo = db.session.get(Cultivo, id_cultivo)
        if not cultivo:
            flash('Registro de Cultivo não encontrado.', 'danger')
            return redirect(url_for('cultivo.listar_cultivos'))

    culturas = db.session.scalars(select(Cultura).order_by(Cultura.nome)).all()

    if request.method == 'POST':
        id_cultura_fk = request.form.get('id_cultura_fk')
        data_plantio_str = request.form.get('data_plantio')
        data_colheita_str = request.form.get('data_colheita')
        producao_str = request.form.get('producao')
        data_plantio = datetime.strptime(data_plantio_str, '%Y-%m-%d').date() if data_plantio_str else None
        data_colheita = datetime.strptime(data_colheita_str, '%Y-%m-%d').date() if data_colheita_str else None
        producao = float(producao_str) if producao_str else None
        
        # Lidar com o upload das fotos
        fotos = request.files.getlist('fotos')
        urls_adicionais = []
        for foto in fotos:
            if foto and foto.filename != '' and allowed_file(foto.filename):
                filename = secure_filename(foto.filename)
                timestamp = str(int(time.time()))
                filename = f"{timestamp}_{filename}"
                
                config_folder = current_app.config.get('UPLOAD_FOLDER', '')
                if config_folder and 'atividades' in config_folder:
                    upload_folder = config_folder.replace('atividades', 'cultivos')
                else:
                    upload_folder = os.path.join(current_app.root_path, 'static', 'uploads', 'cultivos')
                    
                os.makedirs(upload_folder, exist_ok=True)
                filepath = os.path.join(upload_folder, filename)
                foto.save(filepath)
                urls_adicionais.append(f"uploads/cultivos/{filename}")

        if not id_cultura_fk:
            flash('A Cultura deve ser selecionada.', 'warning')
            return redirect(request.url)

        try:
            if id_cultivo:
                cultivo.id_cultura_fk = int(id_cultura_fk)
                cultivo.data_plantio = data_plantio
                cultivo.data_colheita = data_colheita
                cultivo.producao = producao
                
                urls_atuais = [u for u in (cultivo.foto_url.split(',') if cultivo.foto_url else []) if u.strip()]
                urls_totais = urls_atuais + urls_adicionais
                if urls_totais:
                    cultivo.foto_url = ",".join(urls_totais)
                
                db.session.commit()
                flash(f'Cultivo de {cultivo.cultura.nome} (ID: {cultivo.id_cultivo}) atualizado com sucesso!', 'success')
            else:
                url_final = ",".join(urls_adicionais) if urls_adicionais else None
                novo_cultivo = Cultivo(
                    id_cultura_fk=int(id_cultura_fk), 
                    data_plantio=data_plantio, 
                    data_colheita=data_colheita, 
                    producao=producao,
                    foto_url=url_final
                )
                db.session.add(novo_cultivo)
                db.session.commit()
                flash(f'Novo Cultivo cadastrado com sucesso!', 'success')

            return redirect(url_for('cultivo.listar_cultivos'))

        except Exception as e:
            db.session.rollback()
            flash(f'Erro ao salvar cultivo: {e}', 'danger')
            
    return render_template('cultivo/formulario.html', 
                           cultivo=cultivo, 
                           culturas=culturas, 
                           titulo=('Editar Cultivo' if cultivo else 'Novo Registro de Cultivo'))


@cultivo_bp.route('/cultivos/excluir/<int:id_cultivo>', methods=['POST'])
@login_required
def excluir_cultivo(id_cultivo):
    """Exclui um registro de cultivo do banco de dados."""
    
    cultivo = db.session.get(Cultivo, id_cultivo)

    if not cultivo:
        flash('Registro de Cultivo não encontrado.', 'danger')
        return redirect(url_for('cultivo.listar_cultivos'))

    try:
        nome_cultura = cultivo.cultura.nome if cultivo.cultura else 'ID sem Cultura'
        db.session.delete(cultivo)
        db.session.commit()
        flash(f'Cultivo de {nome_cultura} (ID: {cultivo.id_cultivo}) excluído com sucesso.', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Erro ao excluir cultivo: {e}', 'danger')

    return redirect(url_for('cultivo.listar_cultivos'))

@cultivo_bp.route('/cultivos/excluir_foto/<int:id_cultivo>', methods=['POST'])
@login_required
def excluir_foto(id_cultivo):
    cultivo = db.session.get(Cultivo, id_cultivo)
    if not cultivo:
        flash('Cultivo não encontrado.', 'danger')
        return redirect(url_for('cultivo.listar_cultivos'))
        
    foto_path = request.form.get('foto_path', '').strip()
    urls_atuais = [u.strip() for u in (cultivo.foto_url.split(',') if cultivo.foto_url else []) if u.strip()]
    
    if foto_path in urls_atuais:
        urls_atuais.remove(foto_path)
        cultivo.foto_url = ",".join(urls_atuais) if urls_atuais else None
        db.session.commit()
        
        try:
            full_path = os.path.join(current_app.root_path, 'static', foto_path)
            if os.path.exists(full_path):
                os.remove(full_path)
        except Exception as e:
            print(f"Erro ao deletar arquivo: {e}")
            
        flash('Foto excluída com sucesso!', 'success')
    else:
        flash('A foto não estava vinculada a este registro.', 'warning')
        
    return redirect(url_for('cultivo.criar_ou_editar_cultivo', id_cultivo=id_cultivo))