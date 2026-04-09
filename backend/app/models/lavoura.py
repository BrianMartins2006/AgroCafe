from app import db

class Lavoura(db.Model):
    __tablename__ = 'lavoura'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    cultura = db.Column(db.String(50), nullable=False)
    foto_perfil = db.Column(db.String(255), nullable=True)
    id_usuario_fk = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario'), nullable=True)
    
    usuario = db.relationship('Usuario', backref='lavouras')

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'cultura': self.cultura,
            'foto_perfil': self.foto_perfil,
            'id_usuario_fk': self.id_usuario_fk
        }

    def __repr__(self):
        return f'<Lavoura {self.nome}>'
