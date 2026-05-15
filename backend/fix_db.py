import os
from sqlalchemy import text
from app import create_app, db

def fix_database_sqlalchemy():
    print("Iniciando correção do banco de dados via SQLAlchemy...")
    app = create_app()
    with app.app_context():
        engine = db.engine
        
        # Check se é PostgreSQL ou MySQL/SQLite
        is_postgres = engine.name == 'postgresql'
        
        updates = [
            ("usuario", "pergunta_seguranca", "VARCHAR(255)"),
            ("usuario", "resposta_hash", "VARCHAR(255)"),
            ("lavoura", "id_usuario_fk", "INTEGER"),
            ("lavoura", "is_pinned", "BOOLEAN DEFAULT FALSE"),
            ("funcionario", "id_usuario_fk", "INTEGER"),
            ("maquinario", "id_usuario_fk", "INTEGER")
        ]
        
        with engine.connect() as conn:
            for table, column, col_type in updates:
                try:
                    # Verificar se a coluna já existe
                    if is_postgres:
                        check_sql = text(f"SELECT column_name FROM information_schema.columns WHERE table_name='{table}' AND column_name='{column}'")
                    elif engine.name == 'mysql':
                        check_sql = text(f"SELECT column_name FROM information_schema.columns WHERE table_name='{table}' AND column_name='{column}' AND table_schema=DATABASE()")
                    else:
                        # Fallback for SQLite (usually we don't alter in SQLite this way, but PRAGMA works)
                        check_sql = text(f"SELECT name FROM pragma_table_info('{table}') WHERE name='{column}'")
                        
                    result = conn.execute(check_sql).fetchone()
                    
                    if not result:
                        print(f"Adicionando coluna: {table}.{column}...")
                        sql = text(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}")
                        conn.execute(sql)
                        print(f"Sucesso: {table}.{column} adicionada.")
                    else:
                        print(f"Já existe: {table}.{column}")
                except Exception as e:
                    print(f"Aviso em {table}.{column}: Pode não ser suportado ou já existir ({e})")
                    
            conn.commit()
            
            # Tentar vincular dados órfãos ao primeiro usuário
            try:
                user_result = conn.execute(text("SELECT id_usuario FROM usuario LIMIT 1")).fetchone()
                if user_result:
                    user_id = user_result[0]
                    print(f"Vinculando dados órfãos ao usuário ID {user_id}...")
                    
                    conn.execute(text(f"UPDATE lavoura SET id_usuario_fk = {user_id} WHERE id_usuario_fk IS NULL"))
                    conn.execute(text(f"UPDATE funcionario SET id_usuario_fk = {user_id} WHERE id_usuario_fk IS NULL"))
                    conn.execute(text(f"UPDATE maquinario SET id_usuario_fk = {user_id} WHERE id_usuario_fk IS NULL"))
                    
                    conn.commit()
                    print("Vínculos atualizados!")
            except Exception as e:
                print(f"Aviso ao vincular dados: {e}")
                
        print("Correção concluída com sucesso!")

if __name__ == "__main__":
    fix_database_sqlalchemy()
