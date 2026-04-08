from flask import Flask, render_template_string, Blueprint
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from config import Config

db = SQLAlchemy()
login_manager = LoginManager()

login_manager.login_view = 'auth.index'
login_manager.login_message = "Por favor, faça login para acessar esta página."
login_manager.login_message_category = "info"


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

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

    from app.routes.cultura_routes import cultura_bp
    app.register_blueprint(cultura_bp)
    
    from app.routes.funcionario_routes import funcionario_bp
    app.register_blueprint(funcionario_bp)
    
    from app.routes.maquinario_routes import maquinario_bp
    app.register_blueprint(maquinario_bp)
    
    from app.routes.cultivo_routes import cultivo_bp
    app.register_blueprint(cultivo_bp)
    
    from app.routes.atividade_funcionario_routes import atividade_funcionario_bp
    app.register_blueprint(atividade_funcionario_bp)

   
    main_bp = Blueprint('main', __name__)

    from app.routes.dashboard_routes import dashboard_bp
    app.register_blueprint(dashboard_bp)

    app.register_blueprint(main_bp)

    return app
