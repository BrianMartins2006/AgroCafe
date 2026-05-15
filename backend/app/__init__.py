from flask import Flask, render_template_string, Blueprint
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS
from config import Config

db = SQLAlchemy()
login_manager = LoginManager()

login_manager.login_view = 'auth.index'
login_manager.login_message = "Por favor, faça login para acessar esta página."
login_manager.login_message_category = "info"


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": ["http://localhost:5173", "https://agro-cafe.vercel.app"]}})

    db.init_app(app)
    login_manager.init_app(app)

    from app.models.user_model import Usuario

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(Usuario, int(user_id))

    from app.routes.auth import routes as auth_routes
    app.register_blueprint(auth_routes.auth_bp)

    from app.routes.api import routes as api_routes
    app.register_blueprint(api_routes.api, url_prefix='/api/v1')

    main_bp = Blueprint('main', __name__)
    app.register_blueprint(main_bp)

    with app.app_context():
        db.create_all()
        # Garantir que existam categorias de atividade
        from app.models import TipoAtividade
        if not TipoAtividade.query.first():
            tipos = [
                TipoAtividade(nome="Adubação", icone="Sprouts", cor="bg-green-500"),
                TipoAtividade(nome="Colheita", icone="Truck", cor="bg-orange-500"),
                TipoAtividade(nome="Pulverização", icone="Wind", cor="bg-blue-500"),
                TipoAtividade(nome="Monitoramento", icone="Search", cor="bg-yellow-500"),
                TipoAtividade(nome="Outros", icone="Info", cor="bg-gray-500")
            ]
            db.session.add_all(tipos)
            db.session.commit()
            print("Categorias de atividade padrão criadas!")

        # Garantir que exista pelo menos um usuário
        from app.models import Usuario
        if not Usuario.query.first():
            admin = Usuario(nome="Administrador", email="admin@agrocafe.com")
            admin.set_password("admin123")
            db.session.add(admin)
            db.session.commit()
            print("Usuário administrador padrão criado!")

        # Migração: Definir resposta de segurança padrão para usuários antigos
        users_without_answer = Usuario.query.filter(Usuario.resposta_hash.is_(None)).all()
        for u in users_without_answer:
            u.pergunta_seguranca = "Qual a palavra-chave padrão de recuperação?"
            u.set_security_answer("agrocafe")
        if users_without_answer:
            db.session.commit()
            print(f"Resposta de segurança padrão configurada para {len(users_without_answer)} usuários antigos!")

    @app.errorhandler(500)
    def handle_500_error(e):
        import traceback
        return {
            "error": "Internal Server Error",
            "message": str(e),
            "traceback": traceback.format_exc()
        }, 500

    @app.errorhandler(Exception)
    def handle_exception(e):
        import traceback
        return {
            "error": "Unhandled Exception",
            "message": str(e),
            "traceback": traceback.format_exc()
        }, 500

    return app
