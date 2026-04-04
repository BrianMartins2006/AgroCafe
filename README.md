# 🌾 BlueGateFarm

## 🌳 Visão Geral do Projeto

O **BlueGateFarm** é uma aplicação de **gestão agrícola** desenvolvida em **Python** utilizando o micro-framework **Flask**.
O objetivo é gerenciar **recursos humanos, maquinário, estoque, cultivos** e **controlar o acesso de usuários** por meio de uma **API RESTful (CRUD)** e uma **interface web** construída com **Bootstrap**.

---

## ⚙️ Arquitetura e Tecnologias

| Componente         | Tecnologia       | Versão    | Função                                              |
| :----------------- | :--------------- | :-------- | :-------------------------------------------------- |
| **Backend**        | Python           | 3.12.3    | Linguagem de programação principal (**requerida**). |
| **Framework**      | Flask            | 2.3.3     | Micro-framework para desenvolvimento web e API.     |
| **Banco de Dados** | MySQL            | (Externo) | Armazenamento de dados persistente.                 |
| **ORM**            | Flask-SQLAlchemy | 3.1.1     | Mapeamento Objeto-Relacional.                       |
| **Driver DB**      | PyMySQL          | 1.1.0     | Conector Python para MySQL.                         |
| **Frontend**       | Bootstrap        | 3.3.7.1   | Framework CSS para layout responsivo.               |
| **API**            | Flask-RESTful    | 0.3.10    | Extensão para simplificar a criação da API CRUD.    |

---

## 🚀 Guia de Instalação e Configuração

### 1. Requisitos Prévios

Antes de começar, certifique-se de que sua máquina possui:

* **Python 3.12.3** instalado.
* **MySQL** instalado e rodando.
* **Git** instalado.
* **Acesso** ao repositório remoto.

---

### 2. Configuração do Banco de Dados MySQL

Crie o banco de dados no seu servidor MySQL e um usuário com as permissões adequadas.

1. No repositório, na **branch do José**, estão os scripts do banco de dados e tabelas para popular o banco.
2. (Opcional) Crie um usuário de baixo privilégio para uso pela aplicação.

---

### 3. Clonar o Repositório

Clone o código-fonte do projeto e entre no diretório:

```bash
git clone https://github.com/jose1souza/BlueGateFarm.git
cd BlueGateFarm
```

---

### 4. Criar o Ambiente Virtual (OBRIGATÓRIO)

```bash
python3.12 -m venv venv
```

Ative o ambiente virtual:

**Linux/macOS:**

```bash
source venv/bin/activate
```

**Windows (PowerShell):**

```powershell
.\venv\Scripts\Activate.ps1
```

---

### 5. Instalar Dependências (OBRIGATÓRIO)

```bash
pip install -r requirements.txt
```

---

### 6. Criar o Arquivo `.env` na Raiz do Projeto

Crie um arquivo chamado `.env` e adicione as variáveis abaixo:

```bash
# Configurações do Banco de Dados MySQL
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=agricultura

# Chave secreta do Flask (Obrigatória para segurança de sessão)
# Gere uma string longa e aleatória:
# python -c import os 
# print(os.urandom(24).hex())
SECRET_KEY=SUA_CHAVE_SECRETA_AQUI
```

---

### 7. Executar a Aplicação

Para iniciar o servidor localmente:

```bash
python run.py
```

---

## 📂 Estrutura do Projeto

```
├── venv/                      # Ambiente Virtual (IGNORADO)
├── .env                       # Variáveis de Ambiente (IGNORADO)
├── .gitignore                 # Arquivos a serem ignorados pelo Git
├── config.py                  # Configurações globais da aplicação
├── requirements.txt           # Dependências Python
├── run.py                     # Script para iniciar o servidor
│
└── app/                       # Pacote principal da aplicação
    ├── __init__.py            # Inicializa o Flask, SQLAlchemy e Blueprints
    ├── api/                   # Blueprint para a API CRUD (JSON)
    │   └── routes.py          # Define as rotas REST (GET, POST, PUT, DELETE)
    │
    ├── models/                # Mapeamento Objeto-Relacional (SQLAlchemy)
    │   └── *.py               # Ex: user_model.py, funcionario_model.py
    │
    ├── static/                # Arquivos Estáticos (CSS, JS, Imagens)
    │
    └── templates/             # Templates HTML (Jinja2 + Bootstrap)
```

---

## 🧩 Contribuição

Sinta-se à vontade para contribuir com melhorias.
Crie uma **branch**, faça suas alterações e abra um **Pull Request**!

---

## 🧑‍💻 Autores
* Jose Carlos Souza :) eu ajudei
* Brian Gustavo M. Silva : tbm participei


