from app import db 

class Cultura(db.Model):
    __tablename__ = 'cultura'

    id_cultura = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    classificacao_mercado = db.Column(db.String(50))
    
    def to_dict(self):
        return {
            'id_cultura': self.id_cultura,
            'nome': self.nome,
            'classificacao_mercado': self.classificacao_mercado,
        }
        
    def __repr__(self):
        return f'<Cultura {self.nome}>'