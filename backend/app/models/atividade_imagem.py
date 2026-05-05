from app import db

class AtividadeImagem(db.Model):
    __tablename__ = 'atividade_imagem'
    
    id = db.Column(db.Integer, primary_key=True)
    id_atividade_fk = db.Column(db.Integer, db.ForeignKey('atividade.id'), nullable=False)
    foto_url = db.Column(db.String(255), nullable=False)
    
    # Relationship is defined in Atividade with back_populates='imagens'
    atividade = db.relationship('Atividade', back_populates='imagens')

    def to_dict(self):
        return {
            'id': self.id,
            'foto_url': self.foto_url
        }

    def __repr__(self):
        return f'<AtividadeImagem {self.id}>'

from sqlalchemy import event
import os

@event.listens_for(AtividadeImagem, 'after_delete')
def receive_after_delete(mapper, connection, target):
    # foto_url is like "/static/uploads/atividades/filename.jpg"
    if target.foto_url:
        # Get filename
        filename = target.foto_url.split('/')[-1]
        
        # Build absolute path
        from flask import current_app
        if current_app:
            file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception as e:
                    print(f"Erro ao deletar imagem física: {e}")
