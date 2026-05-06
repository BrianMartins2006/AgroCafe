import os
from dotenv import load_dotenv

# Define o diretório base (onde este arquivo está)
basedir = os.path.abspath(os.path.dirname(__file__))

# Carrega as variáveis de ambiente do arquivo .env usando o caminho absoluto
load_dotenv(os.path.join(basedir, '.env')) 

# Configuração da sua aplicação Flask
class Config:
    # A chave secreta que você gerou
    SECRET_KEY = os.getenv('SECRET_KEY', 'chave_secreta_fallback_para_dev')
    
    # Configuração da URI de conexão. Tenta buscar uma URL pronta inteira primeiro, se não achar, monta a do MySQL
    _db_user = os.getenv('DB_USER', 'root')
    _db_pass = os.getenv('DB_PASSWORD', '')
    _db_host = os.getenv('DB_HOST', 'localhost')
    _db_port = os.getenv('DB_PORT', '3306')
    _db_name = os.getenv('DB_NAME', 'agricultura')
    
    _db_url = os.getenv('DATABASE_URL', f"mysql+pymysql://{_db_user}:{_db_pass}@{_db_host}:{_db_port}/{_db_name}")
    if _db_url.startswith("postgres://"):
        _db_url = _db_url.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_DATABASE_URI = _db_url
    
    # Define como False para não ocupar recursos desnecessariamente em projetos novos
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configuração para upload de arquivos
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app', 'static', 'uploads', 'atividades')
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # Aumentando para 10MB para Cloudinary lidar
    
    # Cloudinary Integration
    CLOUDINARY_URL = os.getenv('CLOUDINARY_URL')