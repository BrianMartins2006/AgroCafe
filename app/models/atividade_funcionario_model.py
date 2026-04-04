from app import db 
from .funcionario_model import Funcionario


class AtividadeFuncionario(db.Model):
    """
    Define a tabela 'atividade_funcionario' para registrar as tarefas
    e horas trabalhadas dos funcionários.
    """
    __tablename__ = 'atividade_funcionario'
    
    id_atividade = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_funcionario = db.Column(db.Integer, db.ForeignKey('funcionario.id_funcionario'), nullable=False)
    data = db.Column(db.Date, nullable=False)
    descricao = db.Column(db.String(255))
    horas_trabalhadas = db.Column(db.Numeric(5, 2))
    foto_url = db.Column(db.Text, nullable=True)
    funcionario = db.relationship('Funcionario', backref='atividades')

    def __repr__(self):
        return f"<AtividadeFuncionario {self.id_atividade}: Funcionario ID {self.id_funcionario} em {self.data}>"