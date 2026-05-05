from app import create_app, db
from app.models import Funcionario

app = create_app()
with app.app_context():
    try:
        funcs = Funcionario.query.all()
        print(f"Total Funcionarios: {len(funcs)}")
        for f in funcs:
            print(f.to_dict())
    except Exception as e:
        print(f"ERROR: {e}")
