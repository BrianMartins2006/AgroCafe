from app import create_app, db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        # Tenta adicionar a coluna foto_url na tabela usuario
        db.session.execute(text("ALTER TABLE usuario ADD COLUMN foto_url VARCHAR(255)"))
        db.session.commit()
        print("Coluna foto_url adicionada com sucesso!")
    except Exception as e:
        db.session.rollback()
        if "Duplicate column name" in str(e):
            print("A coluna foto_url já existe.")
        else:
            print(f"Erro ao adicionar coluna: {e}")
