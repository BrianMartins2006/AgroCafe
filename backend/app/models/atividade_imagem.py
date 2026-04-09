from app import db

class AtividadeImagem(db.Model):
    __tablename__ = 'atividade_imagem'
    
    id = db.Column(db.Integer, primary_key=True)
    id_atividade_fk = db.Column(db.Integer, db.ForeignKey('atividade.id'), nullable=False)
    foto_url = db.Column(db.String(255), nullable=False)
    
    atividade = db.relationship('Atividade', backref='imagens')

    def to_dict(self):
        return {
            'id': self.id,
            'foto_url': self.foto_url
        }

    def __repr__(self):
        return f'<AtividadeImagem {self.id}>'
