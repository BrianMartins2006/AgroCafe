from app import create_app, db
from app.models import Funcionario
from flask import jsonify

app = create_app()
with app.app_context():
    try:
        funcionarios = Funcionario.query.all()
        data = [f.to_dict() for f in funcionarios]
        print(data)
    except Exception as e:
        import traceback
        traceback.print_exc()
