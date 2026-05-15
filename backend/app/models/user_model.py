from app import db 
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from datetime import datetime


usuario_permissao = db.Table('usuario_permissao',
    db.Column('id_usuario', db.Integer, db.ForeignKey('usuario.id_usuario', ondelete='CASCADE'), primary_key=True),
    db.Column('id_permissao', db.Integer, db.ForeignKey('permissao.id_permissao', ondelete='CASCADE'), primary_key=True)
)

class Usuario(db.Model, UserMixin):
    __tablename__ = 'usuario'

    id = db.Column('id_usuario', db.Integer, primary_key=True) 
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    senha_hash = db.Column(db.String(255), nullable=False)
    ativo = db.Column(db.Boolean, default=True)
    foto_url = db.Column(db.String(255))
    pergunta_seguranca = db.Column(db.String(255))
    resposta_hash = db.Column(db.String(255))
    
    permissoes = db.relationship(
        'Permissao', secondary=usuario_permissao, 
        lazy='select',
        backref=db.backref('usuarios', lazy='dynamic')
    )

    def set_password(self, password):
        """Define a senha criptografada."""
        self.senha_hash = generate_password_hash(password)

    def check_password(self, password):
        """Verifica se a senha fornecida corresponde ao hash."""
        return check_password_hash(self.senha_hash, password)

    def set_security_answer(self, answer):
        """Define a resposta da pergunta de segurança criptografada."""
        self.resposta_hash = generate_password_hash(answer.lower().strip())

    def check_security_answer(self, answer):
        """Verifica se a resposta fornecida corresponde ao hash."""
        if not self.resposta_hash:
            return False
        return check_password_hash(self.resposta_hash, answer.lower().strip())

    def get_id(self):
        return str(self.id)
    
    def to_dict(self, include_permissoes=False):
        data = {
            'id_usuario': self.id,
            'nome': self.nome,
            'email': self.email,
            'ativo': self.ativo,
            'foto_url': self.foto_url,
            'pergunta_seguranca': self.pergunta_seguranca
        }
        if include_permissoes:
            data['permissoes'] = [p.nome for p in self.permissoes]
            
        return data
    
    def __repr__(self):
        return f'<Usuario {self.email}>'