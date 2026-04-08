from app import db 
from .cultura_model import Cultura

class Cultivo(db.Model):
    """
    Define a tabela 'cultivo' para registrar o ciclo de plantio e colheita
    de uma cultura específica.
    """
    __tablename__ = 'cultivo'
    
    id_cultivo = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_cultura_fk = db.Column(db.Integer, db.ForeignKey('cultura.id_cultura'), nullable=False)
    data_plantio = db.Column(db.Date)
    data_colheita = db.Column(db.Date)
    producao = db.Column(db.Numeric(10, 2))
    foto_url = db.Column(db.Text, nullable=True)
    cultura = db.relationship('Cultura', backref='cultivos') 

    def __repr__(self):
        return f"<Cultivo {self.id_cultivo}: Cultura ID {self.id_cultura_fk}>"