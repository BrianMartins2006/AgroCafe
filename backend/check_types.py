from app import create_app, db
from app.models import TipoAtividade

app = create_app()
with app.app_context():
    for t in TipoAtividade.query.all():
        print(t.to_dict())
