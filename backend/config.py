import os
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv() 

# Configuração da sua aplicação Flask
class Config:
    # A chave secreta que você gerou
    SECRET_KEY = os.getenv('SECRET_KEY', 'chave_secreta_fallback_para_dev')
    
    # Configuração da URI de conexão. Tenta buscar uma URL pronta inteira primeiro, se não achar, monta a do MySQL
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}")
    
    # Define como False para não ocupar recursos desnecessariamente em projetos novos
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configuração para upload de arquivos
    import os
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app', 'static', 'uploads', 'atividades')
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # Limite máximo de 5MB