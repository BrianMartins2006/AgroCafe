import requests
import json
import sys

BASE_URL = "http://localhost:5000/api/v1"

def test_api():
    print("🚀 Iniciando Testes de Sanidade do AgroCafé...\n")
    
    try:
        # 1. Testar Perfil
        print("👤 Testando Perfil...")
        res = requests.get(f"{BASE_URL}/perfil")
        if res.status_code == 200:
            print("  ✅ GET /perfil OK")
        else:
            print(f"  ❌ GET /perfil FAILED ({res.status_code})")
            
        # 2. Testar Categorias (O CRUD que estava quebrando)
        print("\n📂 Testando CRUD de Categorias...")
        # Criar
        payload = {"nome": "Teste API", "icone": "Zap", "cor": "bg-red-500"}
        res = requests.post(f"{BASE_URL}/tipos-atividade", json=payload)
        if res.status_code == 201:
            tipo_id = res.json()['id']
            print(f"  ✅ POST /tipos-atividade OK (ID: {tipo_id})")
            
            # Editar
            payload['nome'] = "Teste Editado"
            res = requests.put(f"{BASE_URL}/tipos-atividade/{tipo_id}", json=payload)
            if res.status_code == 200:
                print("  ✅ PUT /tipos-atividade OK")
            else:
                print(f"  ❌ PUT /tipos-atividade FAILED")
                
            # Deletar
            res = requests.delete(f"{BASE_URL}/tipos-atividade/{tipo_id}")
            if res.status_code == 200 or res.status_code == 204:
                print("  ✅ DELETE /tipos-atividade OK")
            else:
                print(f"  ❌ DELETE /tipos-atividade FAILED")
        else:
            print(f"  ❌ POST /tipos-atividade FAILED ({res.status_code})")

        # 3. Testar Lavouras
        print("\n🌱 Testando Lavouras...")
        res = requests.get(f"{BASE_URL}/lavouras")
        if res.status_code == 200:
            print(f"  ✅ GET /lavouras OK ({len(res.json())} talhões)")
        else:
            print(f"  ❌ GET /lavouras FAILED")

        # 4. Testar Funcionários
        print("\n👥 Testando Funcionários...")
        res = requests.get(f"{BASE_URL}/funcionarios")
        if res.status_code == 200:
            print(f"  ✅ GET /funcionarios OK ({len(res.json())} pessoas)")
        else:
            print(f"  ❌ GET /funcionarios FAILED")

        print("\n✨ Testes finalizados!")
        
    except Exception as e:
        print(f"\n🚨 Erro crítico ao conectar com a API: {e}")
        print("Certifique-se de que o backend (python run.py) está rodando!")

if __name__ == "__main__":
    test_api()
