from flask import Blueprint, render_template, url_for
from flask_login import login_required
from app import db
from app.models.cultura_model import Cultura
from app.models.cultivo_model import Cultivo
from app.models.funcionario_model import Funcionario
from app.models.atividade_funcionario_model import AtividadeFuncionario
from app.models.maquinario_model import Maquinario
from sqlalchemy import func, select
import random

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard')
@login_required
def index():
    # 1. Produção por Cultura (Gráfico de Barras)
    # Soma a produção de todos os cultivos agrupados por cultura
    producao_por_cultura = db.session.query(
        Cultura.nome,
        func.sum(Cultivo.producao).label('total_producao')
    ).join(Cultivo).group_by(Cultura.nome).all()
    
    # Formata para o Chart.js
    chart_producao = {
        'labels': [item[0] for item in producao_por_cultura],
        'data': [float(item[1]) if item[1] else 0 for item in producao_por_cultura]
    }

    # 2. Horas Trabalhadas por Funcionário (Gráfico de Pizza)
    # Soma as horas de todas as atividades agrupadas por funcionário
    horas_por_funcionario = db.session.query(
        Funcionario.nome,
        func.sum(AtividadeFuncionario.horas_trabalhadas).label('total_horas')
    ).join(AtividadeFuncionario).group_by(Funcionario.nome).all()
    
    chart_horas = {
        'labels': [item[0] for item in horas_por_funcionario],
        'data': [float(item[1]) if item[1] else 0 for item in horas_por_funcionario]
    }

    # 3. Custo por Hora de Maquinário (Gráfico de Barras)
    # Compara o valor_hora dos maquinários cadastrados
    maquinarios = Maquinario.query.all()
    
    chart_maquinario = {
        'labels': [f"{m.tipo} ({m.modelo})" for m in maquinarios],
        'data': [float(m.valor_hora) if m.valor_hora else 0 for m in maquinarios]
    }

    # 4. Galeria de Fotos Recentes
    cultivos_recentes = db.session.scalars(
        select(Cultivo)
        .filter(Cultivo.foto_url.isnot(None), Cultivo.foto_url != '')
        .order_by(Cultivo.data_plantio.desc())
        .limit(5)
    ).all()
    
    atividades_recentes = db.session.scalars(
        select(AtividadeFuncionario)
        .filter(AtividadeFuncionario.foto_url.isnot(None), AtividadeFuncionario.foto_url != '')
        .order_by(AtividadeFuncionario.data.desc())
        .limit(5)
    ).all()
    
    recent_photos = []
    
    for c in cultivos_recentes:
        if c.foto_url:
            urls = [u.strip() for u in c.foto_url.split(',') if u.strip()]
            for u in urls:
                recent_photos.append({
                    'url': u,
                    'title': f'Cultivo: {c.cultura.nome}',
                    'date': c.data_plantio.strftime('%d/%m/%Y') if c.data_plantio else '',
                    'link': url_for('cultivo.criar_ou_editar_cultivo', id_cultivo=c.id_cultivo)
                })
                
    for a in atividades_recentes:
        if a.foto_url:
            urls = [u.strip() for u in a.foto_url.split(',') if u.strip()]
            for u in urls:
                recent_photos.append({
                    'url': u,
                    'title': f'Ativi: {a.funcionario.nome if a.funcionario else "N/A"}',
                    'date': a.data.strftime('%d/%m/%Y') if a.data else '',
                    'link': url_for('atividade_funcionario.criar_ou_editar_atividade', id_atividade=a.id_atividade)
                })
                
    random.shuffle(recent_photos)
    recent_photos = recent_photos[:6]

    return render_template('dashboard.html', 
                           chart_producao=chart_producao,
                           chart_horas=chart_horas,
                           recent_photos=recent_photos,
                           chart_maquinario=chart_maquinario)
