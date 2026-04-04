from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_user, logout_user, current_user
from app import db 
from app.models.user_model import Usuario 

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/', methods=['GET'])
def index():
    # Se o usuário já estiver logado, redireciona para o dashboard
    if current_user.is_authenticated:
        return redirect(url_for('dashboard.index'))
    return render_template('login.html')

@auth_bp.route('/cadastro', methods=['GET'])
def cadastro():
    return render_template('cadastro.html')

@auth_bp.route('/login', methods=['POST'])
def fazer_login():
    email = request.form.get('email', '').strip().lower()
    password = request.form.get('password')

    # 1. Busca o usuário pelo e-mail
    usuario = db.session.execute(
        db.select(Usuario).filter_by(email=email)
    ).scalar_one_or_none()
    
    # 2. Verifica se o usuário existe E se a senha confere
    if usuario and usuario.check_password(password):
        # Loga o usuário usando Flask-Login e o mantém logado (remember=True)
        login_user(usuario, remember=False)
        flash(f'Bem-vindo(a), {usuario.nome}!', 'success')
        # Redireciona para o dashboard
        return redirect(url_for('dashboard.index'))
    else:
        # Mensagem de erro e volta para a tela de login
        flash('E-mail ou senha incorretos.', 'danger')
        return redirect(url_for('auth.index'))


@auth_bp.route('/cadastro', methods=['POST'])
def fazer_cadastro():
    nome = request.form.get('nome')
    email = request.form.get('email', '').strip().lower()
    password = request.form.get('password')

    usuario_existente = db.session.execute(
        db.select(Usuario).filter_by(email=email)
    ).scalar_one_or_none()
    
    if usuario_existente:
        flash('Este e-mail já está cadastrado. Tente fazer login.', 'danger')
        return redirect(url_for('auth.cadastro'))

    novo_usuario = Usuario(nome=nome, email=email)
    
    novo_usuario.set_password(password)

    try:
        db.session.add(novo_usuario)
        db.session.commit()
        flash('Cadastro realizado com sucesso! Faça login.', 'success')
        return redirect(url_for('auth.index'))
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao cadastrar usuário: {e}")
        flash('Ocorreu um erro inesperado ao cadastrar. Tente novamente.', 'danger')
        return redirect(url_for('auth.cadastro'))

@auth_bp.route('/logout')
def logout():
    # Finaliza a sessão do usuário
    logout_user()
    flash('Você saiu da sua conta.', 'info')
    return redirect(url_for('auth.index'))

from itsdangerous import URLSafeTimedSerializer
from flask import current_app

def generate_reset_token(email):
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    return serializer.dumps(email, salt='password-reset-salt')

def confirm_reset_token(token, expiration=3600):
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        email = serializer.loads(token, salt='password-reset-salt', max_age=expiration)
        return email
    except Exception:
        return None

@auth_bp.route('/esqueci-senha', methods=['GET', 'POST'])
def esqueci_senha():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard.index'))
        
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        usuario = db.session.execute(db.select(Usuario).filter_by(email=email)).scalar_one_or_none()
        
        if usuario:
            token = generate_reset_token(usuario.email)
            link = url_for('auth.redefinir_senha', token=token, _external=True)
            flash(f'Simulação de E-mail: <a href="{link}" class="alert-link">Clique aqui para redefinir sua senha</a>', 'success')
        else:
            flash('Se o e-mail estiver cadastrado, um link de redefinição foi mostrado.', 'info')
            
        return redirect(url_for('auth.index'))
        
    return render_template('recuperar_senha.html')

@auth_bp.route('/redefinir-senha/<token>', methods=['GET', 'POST'])
def redefinir_senha(token):
    if current_user.is_authenticated:
        return redirect(url_for('dashboard.index'))
        
    email = confirm_reset_token(token)
    if not email:
        flash('O link de redefinição expirou ou é inválido.', 'danger')
        return redirect(url_for('auth.index'))
        
    if request.method == 'POST':
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        if password != confirm_password:
            flash('As senhas não coincidem.', 'danger')
            return redirect(request.url)
            
        usuario = db.session.execute(db.select(Usuario).filter_by(email=email)).scalar_one_or_none()
        if usuario:
            usuario.set_password(password)
            db.session.commit()
            flash('Sua senha foi atualizada com sucesso! Você já pode fazer login.', 'success')
            return redirect(url_for('auth.index'))
            
    return render_template('redefinir_senha.html')