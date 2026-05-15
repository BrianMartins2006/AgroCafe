import pymysql
import os
from dotenv import load_dotenv

# Carrega as variáveis de ambiente
load_dotenv()

def fix_database_direct():
    db_user = os.getenv('DB_USER', 'root')
    db_pass = os.getenv('DB_PASSWORD', '')
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = int(os.getenv('DB_PORT', '3306'))
    db_name = os.getenv('DB_NAME', 'agricultura')

    print(f"Conectando ao banco {db_name} em {db_host}...")
    
    try:
        connection = pymysql.connect(
            host=db_host,
            user=db_user,
            password=db_pass,
            database=db_name,
            port=db_port
        )
        
        with connection.cursor() as cursor:
            # Lista de colunas para adicionar
            updates = [
                ("usuario", "pergunta_seguranca", "VARCHAR(255)"),
                ("usuario", "resposta_hash", "VARCHAR(255)"),
                ("lavoura", "id_usuario_fk", "INT"),
                ("lavoura", "is_pinned", "BOOLEAN DEFAULT FALSE"),
                ("funcionario", "id_usuario_fk", "INT"),
                ("maquinario", "id_usuario_fk", "INT")
            ]
            
            for table, column, col_type in updates:
                try:
                    sql = f"ALTER TABLE {table} ADD COLUMN {column} {col_type}"
                    cursor.execute(sql)
                    print(f"Adicionado: {table}.{column}")
                except pymysql.err.OperationalError as e:
                    if e.args[0] == 1060: # Duplicate column name
                        print(f"Já existe: {table}.{column}")
                    else:
                        print(f"Erro em {table}.{column}: {e}")
            
            connection.commit()
            
            # Tentar vincular dados ao primeiro usuário
            cursor.execute("SELECT id_usuario FROM usuario LIMIT 1")
            row = cursor.fetchone()
            if row:
                user_id = row[0]
                print(f"Vinculando dados órfãos ao usuário ID {user_id}...")
                
                cursor.execute(f"UPDATE lavoura SET id_usuario_fk = {user_id} WHERE id_usuario_fk IS NULL")
                cursor.execute(f"UPDATE funcionario SET id_usuario_fk = {user_id} WHERE id_usuario_fk IS NULL")
                cursor.execute(f"UPDATE maquinario SET id_usuario_fk = {user_id} WHERE id_usuario_fk IS NULL")
                
                connection.commit()
                print("Vínculos atualizados!")

        print("Concluído com sucesso!")
        
    except Exception as e:
        print(f"Erro fatal: {e}")
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

if __name__ == "__main__":
    fix_database_direct()
