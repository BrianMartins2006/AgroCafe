from app import create_app, db
from app.models import Atividade
import json

app = create_app()
with app.app_context():
    atividades = [a.to_dict() for a in Atividade.query.all()]
    print(json.dumps(atividades, indent=2))
