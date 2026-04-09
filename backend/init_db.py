from app import create_app, db
from app.models import TipoAtividade, Lavoura, Atividade, AtividadeImagem
import os
from dotenv import load_dotenv

load_dotenv()

app = create_app()

with app.app_context():
    print("Iniciando a criação das tabelas no banco de dados...")
    # Usar uma conexão direta para garantir que as verificações de chave estrangeira sejam desabilitadas no MySQL
    with db.engine.connect() as connection:
        transaction = connection.begin()
        try:
            connection.execute(db.text("SET FOREIGN_KEY_CHECKS = 0;"))
            db.metadata.drop_all(bind=connection)
            db.metadata.create_all(bind=connection)
            connection.execute(db.text("SET FOREIGN_KEY_CHECKS = 1;"))
            transaction.commit()
        except Exception as e:
            transaction.rollback()
            print(f"Erro ao resetar o banco: {e}")
            raise
    print("Tabelas criadas com sucesso!")

    print("Semeando dados iniciais...")
    
    # Tipos de Atividade
    adubacao = TipoAtividade(nome="Adubação", icone="Sprouts", cor="bg-green-500")
    colheita = TipoAtividade(nome="Colheita", icone="Truck", cor="bg-orange-500")
    pulverizacao = TipoAtividade(nome="Pulverização", icone="Wind", cor="bg-blue-500")
    monitoramento = TipoAtividade(nome="Monitoramento", icone="Search", cor="bg-yellow-500")
    
    db.session.add_all([adubacao, colheita, pulverizacao, monitoramento])
    
    # Lavouras de exemplo
    l1 = Lavoura(nome="Talhão 01 - Café", cultura="Café", foto_perfil="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=100&q=80")
    l2 = Lavoura(nome="Área Norte - Milho", cultura="Milho", foto_perfil="https://images.unsplash.com/photo-1551733592-220009cad634?auto=format&fit=crop&w=100&q=80")
    
    db.session.add_all([l1, l2])
    db.session.commit()

    # Atividades de exemplo
    a1 = Atividade(
        id_lavoura_fk=l1.id,
        id_tipo_atividade_fk=adubacao.id,
        descricao="Adubação realizada com sucesso. Utilizado adubo NPK 20-10-10.",
        responsavel="João Silva"
    )
    a2 = Atividade(
        id_lavoura_fk=l1.id,
        id_tipo_atividade_fk=monitoramento.id,
        descricao="Monitoramento de pragas. Nível de infestação baixo.",
        responsavel="João Silva"
    )
    
    db.session.add_all([a1, a2])
    db.session.commit()

    # Imagens de exemplo
    img1 = AtividadeImagem(id_atividade_fk=a1.id, foto_url="https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=800&q=80")
    img2 = AtividadeImagem(id_atividade_fk=a1.id, foto_url="https://images.unsplash.com/photo-1592982537447-6f2a6a0c3c1b?auto=format&fit=crop&w=800&q=80")
    
    db.session.add_all([img1, img2])
    db.session.commit()
    
    print("Dados semeados com sucesso!")
