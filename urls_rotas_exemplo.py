# urls_rotas_exemplo.py
# Exemplo de configuração de URLs para os endpoints de rotas

from django.urls import path
from rotas_desktop import (
    CriarRotasView,
    ListarRotasView,
    DetalhesRotaView,
    IniciarRotaView,
    FinalizarRotaView,
    CancelarRotaView
)

urlpatterns = [
    # ... outras URLs existentes ...
    
    # Endpoints do Sistema de Rotas de Entrega
    path('api/v1/desktop/rotas/criar/', 
         CriarRotasView.as_view(), 
         name='criar_rotas'),
    
    path('api/v1/desktop/rotas/listar/', 
         ListarRotasView.as_view(), 
         name='listar_rotas'),
    
    path('api/v1/desktop/rotas/<int:rota_id>/', 
         DetalhesRotaView.as_view(), 
         name='detalhes_rota'),
    
    path('api/v1/desktop/rotas/<int:rota_id>/iniciar/', 
         IniciarRotaView.as_view(), 
         name='iniciar_rota'),
    
    path('api/v1/desktop/rotas/<int:rota_id>/finalizar/', 
         FinalizarRotaView.as_view(), 
         name='finalizar_rota'),
    
    path('api/v1/desktop/rotas/<int:rota_id>/cancelar/', 
         CancelarRotaView.as_view(), 
         name='cancelar_rota'),
]

# INSTRUÇÕES:
# 1. Copie estas URLs para o seu arquivo urls.py principal
# 2. Ou importe este arquivo no seu urls.py principal
# 3. Certifique-se de que o arquivo rotas_desktop.py está no caminho correto
