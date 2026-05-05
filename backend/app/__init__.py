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
    CORS(app)

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

    return app
