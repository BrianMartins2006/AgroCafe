from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required
from sqlalchemy import select
from app import db
from app.models.cultura_model import Cultura
from app.models.maquinario_model import Maquinario
from datetime import datetime


maquinario_bp = Blueprint('maquinario', __name__)


@maquinario_bp.route('/maquinarios', methods=['GET'])
@login_required
def listar_maquinarios():
    """Lista todos os maquinários e carrega o template principal."""
    try:
        maquinarios = db.session.scalars(select(Maquinario).order_by(Maquinario.tipo, Maquinario.modelo)).all()
        
        culturas = db.session.scalars(select(Cultura).order_by(Cultura.nome)).all()
        
        return render_template('maquinario/listar.html', 
                               maquinarios=maquinarios, 
                               culturas=culturas)
    except Exception as e:
        flash(f'Erro ao carregar dados: {e}', 'danger')
        return render_template('maquinario/listar.html', maquinarios=[], culturas=[])


@maquinario_bp.route('/maquinarios/novo', methods=['GET', 'POST'])
@maquinario_bp.route('/maquinarios/editar/<int:id_maquina>', methods=['GET', 'POST'])
@login_required
def criar_ou_editar_maquinario(id_maquina=None):
    """
    Trata a criação de um novo maquinário ou a edição de um existente.
    """
    maquinario = None
    
    if id_maquina:
        maquinario = db.session.get(Maquinario, id_maquina)
        if not maquinario:
            flash('Maquinário não encontrado.', 'danger')
            return redirect(url_for('maquinario.listar_maquinarios'))

    culturas = db.session.scalars(select(Cultura).order_by(Cultura.nome)).all()

    if request.method == 'POST':
        tipo = request.form.get('tipo')
        modelo = request.form.get('modelo')
        data_aquisicao_str = request.form.get('data_aquisicao')
        valor_hora_str = request.form.get('valor_hora')
        consumo_medio_str = request.form.get('consumo_medio')
        id_cultura_fk = request.form.get('id_cultura_fk')

        data_aquisicao = datetime.strptime(data_aquisicao_str, '%Y-%m-%d').date() if data_aquisicao_str else None
        valor_hora = float(valor_hora_str) if valor_hora_str else None
        consumo_medio = float(consumo_medio_str) if consumo_medio_str else None
        
        try:
            if id_maquina:
                maquinario.tipo = tipo
                maquinario.modelo = modelo
                maquinario.data_aquisicao = data_aquisicao
                maquinario.valor_hora = valor_hora
                maquinario.consumo_medio = consumo_medio
                maquinario.id_cultura_fk = int(id_cultura_fk) if id_cultura_fk else None
                
                db.session.commit()
                flash(f'Maquinário \"{modelo}\" atualizado com sucesso!', 'success')
            else:
                novo_maquinario = Maquinario(
                    tipo=tipo, 
                    modelo=modelo, 
                    data_aquisicao=data_aquisicao, 
                    valor_hora=valor_hora, 
                    consumo_medio=consumo_medio,
                    id_cultura_fk=int(id_cultura_fk) if id_cultura_fk else None
                )
                db.session.add(novo_maquinario)
                db.session.commit()
                flash(f'Maquinário \"{modelo}\" cadastrado com sucesso!', 'success')

            return redirect(url_for('maquinario.listar_maquinarios'))

        except Exception as e:
            db.session.rollback()
            flash(f'Erro ao salvar maquinário: {e}', 'danger')
            
    return render_template('maquinario/formulario.html', 
                           maquinario=maquinario, 
                           culturas=culturas, 
                           titulo=('Editar Maquinário' if maquinario else 'Novo Maquinário'))

@maquinario_bp.route('/maquinarios/excluir/<int:id_maquina>', methods=['POST'])
@login_required
def excluir_maquinario(id_maquina):
    """Exclui um maquinário do banco de dados."""
    
    maquinario = db.session.get(Maquinario, id_maquina)

    if not maquinario:
        flash('Maquinário não encontrado.', 'danger')
        return redirect(url_for('maquinario.listar_maquinarios'))

    try:
        modelo_maquinario = maquinario.modelo
        db.session.delete(maquinario)
        db.session.commit()
        flash(f'Maquinário \"{modelo_maquinario}\" excluído com sucesso.', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Erro ao excluir maquinário: {e}', 'danger')

    return redirect(url_for('maquinario.listar_maquinarios'))