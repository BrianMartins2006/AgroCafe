from app import create_app, db
from app.models import Atividade

app = create_app()
with app.app_context():
    atv_count = Atividade.query.count()
    print(f"Total Atividades: {atv_count}")
    for a in Atividade.query.all():
        print(f"- {a.id}: {a.descricao}")
