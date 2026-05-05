from app import db

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

    def to_dict(self):
        return {
            'id_funcionario': self.id_funcionario,
            'nome': self.nome,
            'cargo': self.cargo,
            'salario_hora': float(self.salario_hora) if self.salario_hora else 0,
            'contato': self.contato
        }

    def __repr__(self):
        return f"<Funcionario {self.id_funcionario}: {self.nome} - Cargo: {self.cargo}>"