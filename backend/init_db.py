from app import create_app, db
import os
from dotenv import load_dotenv

load_dotenv()

app = create_app()

with app.app_context():
    print("Iniciando a criação das tabelas no banco de dados...")
    db.create_all()
    print("Tabelas criadas com sucesso!")
