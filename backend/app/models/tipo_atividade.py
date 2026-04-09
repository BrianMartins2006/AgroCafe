from app import db

class TipoAtividade(db.Model):
    __tablename__ = 'tipo_atividade'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(50), nullable=False)
    icone = db.Column(db.String(50), nullable=True) # Lucide icon name
    cor = db.Column(db.String(20), nullable=True)   # Hex or Tailwind color class

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'icone': self.icone,
            'cor': self.cor
        }

    def __repr__(self):
        return f'<TipoAtividade {self.nome}>'
