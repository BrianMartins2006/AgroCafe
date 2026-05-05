# Importa o objeto 'db' que foi inicializado em app/__init__.py
from app import db 

from .cultura_model import Cultura

class Maquinario(db.Model):
    """
    Define a tabela 'maquinario' com os campos especificados.
    """
    __tablename__ = 'maquinario'
    
    id_maquina = db.Column(db.Integer, primary_key=True, autoincrement=True)
    
    tipo = db.Column(db.String(50))
    modelo = db.Column(db.String(100))
    data_aquisicao = db.Column(db.Date)
    valor_hora = db.Column(db.Numeric(10, 2))
    consumo_medio = db.Column(db.Numeric(10, 2))
    
    id_cultura_fk = db.Column(db.Integer, db.ForeignKey('cultura.id_cultura'))
    cultura = db.relationship('Cultura', backref='maquinarios') 

    def to_dict(self):
        return {
            'id_maquina': self.id_maquina,
            'tipo': self.tipo,
            'modelo': self.modelo,
            'valor_hora': float(self.valor_hora) if self.valor_hora else 0,
            'consumo_medio': float(self.consumo_medio) if self.consumo_medio else 0,
            'id_cultura_fk': self.id_cultura_fk
        }

    def __repr__(self):
        return f"<Maquinario {self.id_maquina}: {self.tipo} ({self.modelo})>"