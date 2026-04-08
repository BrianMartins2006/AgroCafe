from app import db 

class Permissao(db.Model):
    __tablename__ = 'permissao'

    id_permissao = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), unique=True, nullable=False)

    def to_dict(self):
        return {
            'id_permissao': self.id_permissao,
            'nome': self.nome,
        }
        
    def __repr__(self):
        return f'<Permissao {self.nome}>'