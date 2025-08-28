# teste_endpoints_rotas.py
# Script para testar os endpoints de rotas

import requests
import json

# Configurações
BASE_URL = "http://localhost:8000"
ESTABELECIMENTO_ID = 11  # Ajuste conforme necessário

def testar_endpoints():
    """Testa todos os endpoints de rotas"""
    
    print("🧪 TESTANDO ENDPOINTS DE ROTAS")
    print("=" * 50)
    
    # 1. Testar criação de rotas
    print("\n1️⃣ Testando criação de rotas...")
    try:
        dados_criar = {
            "estabelecimento_id": ESTABELECIMENTO_ID,
            "max_pedidos_por_rota": 5,
            "raio_agrupamento_km": 3.0,
            "motoboy_id": 1  # opcional
        }
        
        response = requests.post(
            f"{BASE_URL}/api/v1/desktop/rotas/criar/",
            json=dados_criar,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            resultado = response.json()
            print(f"✅ Sucesso: {resultado.get('message')}")
            print(f"   Rotas criadas: {len(resultado.get('rotas_criadas', []))}")
        else:
            print(f"❌ Erro {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro na requisição: {str(e)}")
    
    # 2. Testar listagem de rotas
    print("\n2️⃣ Testando listagem de rotas...")
    try:
        response = requests.get(
            f"{BASE_URL}/api/v1/desktop/rotas/listar/",
            params={
                'estabelecimento_id': ESTABELECIMENTO_ID,
                'status': 'pendente'
            }
        )
        
        if response.status_code == 200:
            resultado = response.json()
            print(f"✅ Sucesso: {resultado.get('total_rotas', 0)} rotas encontradas")
            
            # Pegar primeira rota para testes
            rotas = resultado.get('rotas', [])
            if rotas:
                primeira_rota_id = rotas[0]['rota_id']
                print(f"   Primeira rota ID: {primeira_rota_id}")
                
                # 3. Testar detalhes da rota
                print(f"\n3️⃣ Testando detalhes da rota {primeira_rota_id}...")
                response_detalhes = requests.get(
                    f"{BASE_URL}/api/v1/desktop/rotas/{primeira_rota_id}/"
                )
                
                if response_detalhes.status_code == 200:
                    detalhes = response_detalhes.json()
                    print(f"✅ Sucesso: Rota {detalhes['rota']['id']}")
                    print(f"   Status: {detalhes['rota']['status']}")
                    print(f"   Pedidos: {detalhes['estatisticas']['total_pedidos']}")
                    
                    # 4. Testar iniciar rota (se estiver pendente)
                    if detalhes['rota']['status'] == 'pendente':
                        print(f"\n4️⃣ Testando iniciar rota {primeira_rota_id}...")
                        response_iniciar = requests.post(
                            f"{BASE_URL}/api/v1/desktop/rotas/{primeira_rota_id}/iniciar/"
                        )
                        
                        if response_iniciar.status_code == 200:
                            print("✅ Rota iniciada com sucesso!")
                        else:
                            print(f"❌ Erro ao iniciar: {response_iniciar.text}")
                    
                    # 5. Testar cancelar rota
                    print(f"\n5️⃣ Testando cancelar rota {primeira_rota_id}...")
                    dados_cancelar = {"motivo": "Teste de cancelamento"}
                    response_cancelar = requests.post(
                        f"{BASE_URL}/api/v1/desktop/rotas/{primeira_rota_id}/cancelar/",
                        json=dados_cancelar,
                        headers={'Content-Type': 'application/json'}
                    )
                    
                    if response_cancelar.status_code == 200:
                        print("✅ Rota cancelada com sucesso!")
                    else:
                        print(f"❌ Erro ao cancelar: {response_cancelar.text}")
                        
                else:
                    print(f"❌ Erro ao buscar detalhes: {response_detalhes.text}")
        else:
            print(f"❌ Erro {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro na requisição: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🏁 TESTE CONCLUÍDO")

def testar_endpoint_individual(endpoint, metodo="GET", dados=None):
    """Testa um endpoint específico"""
    
    print(f"\n🧪 Testando {metodo} {endpoint}")
    
    try:
        if metodo == "GET":
            response = requests.get(f"{BASE_URL}{endpoint}")
        elif metodo == "POST":
            headers = {'Content-Type': 'application/json'} if dados else {}
            response = requests.post(f"{BASE_URL}{endpoint}", json=dados, headers=headers)
        
        print(f"Status: {response.status_code}")
        print(f"Resposta: {response.text[:200]}...")
        
        if response.status_code == 200:
            print("✅ Sucesso!")
        else:
            print("❌ Erro!")
            
    except Exception as e:
        print(f"❌ Erro na requisição: {str(e)}")

if __name__ == "__main__":
    # Teste completo
    testar_endpoints()
    
    # Testes individuais (descomente para testar endpoints específicos)
    # testar_endpoint_individual("/api/v1/desktop/rotas/listar/")
    # testar_endpoint_individual("/api/v1/desktop/rotas/criar/", "POST", {
    #     "estabelecimento_id": ESTABELECIMENTO_ID,
    #     "max_pedidos_por_rota": 3
    # })
