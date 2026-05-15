from app import create_app, db
from app.models import Usuario, Lavoura

app = create_app()
with app.app_context():
    print("--- USUÁRIOS ---")
    users = Usuario.query.all()
    for u in users:
        print(f"ID: {u.id}, Email: {u.email}")
    
    print("\n--- LAVOURAS ---")
    lavouras = Lavoura.query.all()
    for l in lavouras:
        print(f"ID: {l.id}, Nome: {l.nome}, UserID: {l.id_usuario_fk}")
