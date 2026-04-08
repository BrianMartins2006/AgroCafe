from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required
from sqlalchemy import select
from app import db
from app.models.cultura_model import Cultura
from app.models.funcionario_model import Funcionario


funcionario_bp = Blueprint('funcionario', __name__)


@funcionario_bp.route('/funcionarios', methods=['GET'])
@login_required
def listar_funcionarios():
    """Lista todos os funcionários e carrega o template principal."""
    try:
        funcionarios = db.session.scalars(select(Funcionario).order_by(Funcionario.nome)).all()
        culturas = db.session.scalars(select(Cultura).order_by(Cultura.nome)).all()
        
        return render_template('funcionario/listar.html', 
                               funcionarios=funcionarios, 
                               culturas=culturas)
    except Exception as e:
        flash(f'Erro ao carregar dados: {e}', 'danger')
        return render_template('funcionario/listar.html', funcionarios=[], culturas=[])


@funcionario_bp.route('/funcionarios/novo', methods=['GET', 'POST'])
@funcionario_bp.route('/funcionarios/editar/<int:id_funcionario>', methods=['GET', 'POST'])
@login_required
def criar_ou_editar_funcionario(id_funcionario=None):
    """
    Trata a criação de um novo funcionário (sem id_funcionario) 
    ou a edição de um funcionário existente (com id_funcionario).
    """
    funcionario = None
    
    if id_funcionario:
        funcionario = db.session.get(Funcionario, id_funcionario)
        if not funcionario:
            flash('Funcionário não encontrado.', 'danger')
            return redirect(url_for('funcionario.listar_funcionarios'))

    culturas = db.session.scalars(select(Cultura).order_by(Cultura.nome)).all()

    if request.method == 'POST':
        nome = request.form.get('nome')
        cargo = request.form.get('cargo')
        salario_hora_str = request.form.get('salario_hora')
        contato = request.form.get('contato')
        id_cultura_fk = request.form.get('id_cultura_fk')
        
        salario_hora = float(salario_hora_str) if salario_hora_str else None
        
        try:
            if id_funcionario:
                funcionario.nome = nome
                funcionario.cargo = cargo
                funcionario.salario_hora = salario_hora
                funcionario.contato = contato
                funcionario.id_cultura_fk = int(id_cultura_fk) if id_cultura_fk else None
                
                db.session.commit()
                flash(f'Funcionário \"{nome}\" atualizado com sucesso!', 'success')
            else:
                
                novo_funcionario = Funcionario(
                    nome=nome, 
                    cargo=cargo, 
                    salario_hora=salario_hora, 
                    contato=contato,
                    id_cultura_fk=int(id_cultura_fk) if id_cultura_fk else None
                )
                db.session.add(novo_funcionario)
                db.session.commit()
                flash(f'Funcionário \"{nome}\" cadastrado com sucesso!', 'success')

            return redirect(url_for('funcionario.listar_funcionarios'))

        except Exception as e:
            db.session.rollback()
            flash(f'Erro ao salvar funcionário: {e}', 'danger')
            
    return render_template('funcionario/formulario.html', 
                           funcionario=funcionario, 
                           culturas=culturas, 
                           titulo=('Editar Funcionário' if funcionario else 'Novo Funcionário'))


@funcionario_bp.route('/funcionarios/excluir/<int:id_funcionario>', methods=['POST'])
@login_required
def excluir_funcionario(id_funcionario):
    """Exclui um funcionário do banco de dados."""
    
    funcionario = db.session.get(Funcionario, id_funcionario)

    if not funcionario:
        flash('Funcionário não encontrado.', 'danger')
        return redirect(url_for('funcionario.listar_funcionarios'))

    try:
        nome_funcionario = funcionario.nome
        db.session.delete(funcionario)
        db.session.commit()
        flash(f'Funcionário \"{nome_funcionario}\" excluído com sucesso.', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Erro ao excluir funcionário: {e}', 'danger')

    return redirect(url_for('funcionario.listar_funcionarios'))