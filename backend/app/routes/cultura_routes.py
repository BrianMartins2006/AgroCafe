from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required
from app import db
from app.models.cultura_model import Cultura

cultura_bp = Blueprint('cultura', __name__)

@cultura_bp.route('/culturas', methods=['GET'])
@login_required
def listar_culturas():
    try:
        culturas = db.session.execute(db.select(Cultura).order_by(Cultura.nome)).scalars().all()
        return render_template('culturas/listar.html', culturas=culturas)
    except Exception as e:
        flash(f'Erro ao carregar culturas: {e}', 'danger')
        return render_template('culturas/formulario.html', culturas=[])


@cultura_bp.route('/culturas/nova', methods=['GET', 'POST'])
@cultura_bp.route('/culturas/editar/<int:id_cultura>', methods=['GET', 'POST'])
@login_required
def criar_ou_editar_cultura(id_cultura=None):
    cultura = None
    if id_cultura:
        cultura = db.session.get(Cultura, id_cultura)
        if not cultura:
            flash('Cultura não encontrada.', 'danger')
            return redirect(url_for('cultura.listar_culturas'))

    if request.method == 'POST':
        nome = request.form.get('nome')
        classificacao = request.form.get('classificacao_mercado')

        if id_cultura:
            cultura.nome = nome
            cultura.classificacao_mercado = classificacao
            try:
                db.session.commit()
                flash(f'Cultura \"{nome}\" atualizada com sucesso!', 'success')
            except Exception as e:
                db.session.rollback()
                flash(f'Erro ao atualizar cultura: {e}', 'danger')
        else:
            nova_cultura = Cultura(nome=nome, classificacao_mercado=classificacao)
            try:
                db.session.add(nova_cultura)
                db.session.commit()
                flash(f'Cultura \"{nome}\" cadastrada com sucesso!', 'success')
            except Exception as e:
                db.session.rollback()
                flash(f'Erro ao cadastrar cultura: {e}', 'danger')

        return redirect(url_for('cultura.listar_culturas'))

    return render_template('culturas/formulario.html', cultura=cultura, titulo=('Editar Cultura' if cultura else 'Nova Cultura'))


@cultura_bp.route('/culturas/excluir/<int:id_cultura>', methods=['POST'])
@login_required
def excluir_cultura(id_cultura):
    cultura = db.session.get(Cultura, id_cultura)

    if not cultura:
        flash('Cultura não encontrada.', 'danger')
        return redirect(url_for('cultura.listar_culturas'))

    try:
        nome_cultura = cultura.nome
        db.session.delete(cultura)
        db.session.commit()
        flash(f'Cultura \"{nome_cultura}\" excluída com sucesso.', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Erro ao excluir cultura: {e}', 'danger')

    return redirect(url_for('cultura.listar_culturas'))
