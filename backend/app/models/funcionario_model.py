from app import db 
from .cultura_model import Cultura

class Funcionario(db.Model):
    """
    Define a tabela 'funcionario' com os campos especificados.
    """
    __tablename__ = 'funcionario'
    
    id_funcionario = db.Column(db.Integer, primary_key=True, autoincrement=True)
    
    nome = db.Column(db.String(100), nullable=False)
    cargo = db.Column(db.String(50))
    salario_hora = db.Column(db.Numeric(10, 2))
    contato = db.Column(db.String(100))
    id_cultura_fk = db.Column(db.Integer, db.ForeignKey('cultura.id_cultura'))
    cultura = db.relationship('Cultura', backref='funcionarios') 

    def __repr__(self):
        return f"<Funcionario {self.id_funcionario}: {self.nome} - Cargo: {self.cargo}>"