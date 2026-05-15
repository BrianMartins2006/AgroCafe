from app import db

class Lavoura(db.Model):
    __tablename__ = 'lavoura'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    cultura = db.Column(db.String(50), nullable=False)
    foto_perfil = db.Column(db.String(255), nullable=True)
    area_hectares = db.Column(db.Float, nullable=True)
    localizacao = db.Column(db.String(255), nullable=True)
    data_inicio = db.Column(db.Date, nullable=True)
    is_pinned = db.Column(db.Boolean, default=False)
    id_usuario_fk = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario'), nullable=True)
    
    usuario = db.relationship('Usuario', backref='lavouras')
    atividades = db.relationship('Atividade', back_populates='lavoura', cascade='all, delete-orphan')

    @property
    def ultima_atividade_date(self):
        # Se as atividades já estiverem carregadas (joinedload), usamos o cache local
        if 'atividades' in self.__dict__:
            if not self.atividades:
                return None
            return max((a.data for a in self.atividades), default=None)
        
        # Caso contrário, fazemos uma query rápida focada apenas no último valor
        from app.models import Atividade
        last_act = Atividade.query.filter_by(id_lavoura_fk=self.id).order_by(Atividade.data.desc()).first()
        return last_act.data if last_act else None

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'cultura': self.cultura,
            'foto_perfil': self.foto_perfil,
            'area_hectares': self.area_hectares,
            'localizacao': self.localizacao,
            'data_inicio': self.data_inicio.isoformat() if self.data_inicio else None,
            'is_pinned': self.is_pinned,
            'ultima_atividade_date': self.ultima_atividade_date.isoformat() + 'Z' if self.ultima_atividade_date else None,
            'id_usuario_fk': self.id_usuario_fk
        }

    def __repr__(self):
        return f'<Lavoura {self.nome}>'
