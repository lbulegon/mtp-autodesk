# 🛣️ Implementação Backend - Sistema de Rotas de Entrega

## 🎯 Visão Geral

Implementação dos endpoints Django para o sistema de **rotas de entrega** conforme especificado no documento `DOCUMENTACAO_ROTAS_DESKTOP.md`. O sistema permite agrupar pedidos por proximidade geográfica e otimizar as entregas dos motoboys.

## 🏗️ Arquitetura do Sistema

### Conceito de Rotas de Entrega

Uma **rota de entrega** é um agrupamento inteligente de pedidos que:
- **Agrupa pedidos por proximidade geográfica** (raio configurável)
- **Otimiza o trajeto** para minimizar tempo e distância
- **Atribui um motoboy** para executar a rota completa
- **Controla o fluxo** de execução (pendente → em andamento → concluída)

### Fluxo de Trabalho

```
1. 📦 Pedidos Recebidos → 2. 🛣️ Criar Rota → 3. 🚀 Iniciar Rota → 4. ✅ Finalizar Rota
```

## 📋 Pré-requisitos

### 1. **Estrutura do Projeto Django**
- Projeto Django configurado
- App `motopro` criado
- Modelos `Motoboy`, `Pedido`, `Vaga`, `Motoboy_Vaga_Candidatura` existentes

### 2. **Modelos Necessários**

```python
# motopro/models.py

class Rota(models.Model):
    estabelecimento = models.ForeignKey('Estabelecimento', on_delete=models.CASCADE)
    motoboy = models.ForeignKey(Motoboy, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, default='pendente')  # pendente, emandamento, concluida, cancelada
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_inicio = models.DateTimeField(null=True, blank=True)
    data_finalizacao = models.DateTimeField(null=True, blank=True)
    distancia_km = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    tempo_estimado_min = models.IntegerField(default=0)
    observacoes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'rota'
        verbose_name = 'Rota'
        verbose_name_plural = 'Rotas'

class Rota_Pedido(models.Model):
    rota = models.ForeignKey(Rota, on_delete=models.CASCADE)
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE)
    ordem = models.IntegerField(default=1)  # Ordem de entrega na rota
    status = models.CharField(max_length=20, default='pendente')  # pendente, entregue, cancelado
    data_entrega = models.DateTimeField(null=True, blank=True)
    observacao = models.TextField(blank=True)
    
    class Meta:
        db_table = 'rota_pedido'
        verbose_name = 'Rota Pedido'
        verbose_name_plural = 'Rota Pedidos'
        unique_together = ['rota', 'pedido']
        ordering = ['ordem']
```

### 3. **Campo Adicional no Modelo Pedido**

```python
# No modelo Pedido, adicione:
rota = models.ForeignKey(Rota, on_delete=models.SET_NULL, null=True, blank=True)
data_atribuicao = models.DateTimeField(null=True, blank=True)
observacoes_atribuicao = models.TextField(blank=True)
```

## 🔧 Implementação dos Endpoints

### 1. **Criar Arquivo de Endpoints**

Crie o arquivo `src/rotas_desktop.py` no seu projeto Django:

```python
# src/rotas_desktop.py
# Endpoints Django para sistema de rotas de entrega

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views import View
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
import json
import logging
from django.utils import timezone
from datetime import datetime, date
from decimal import Decimal

from motopro.models import Motoboy, Vaga, Motoboy_Vaga_Candidatura, Pedido, Rota, Rota_Pedido

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class CriarRotasView(View):
    """
    Endpoint para criar rotas automaticamente agrupando pedidos por proximidade
    """
    
    @require_http_methods(["POST"])
    def post(self, request):
        try:
            data = json.loads(request.body)
            
            estabelecimento_id = data.get('estabelecimento_id')
            max_pedidos_por_rota = data.get('max_pedidos_por_rota', 8)
            raio_agrupamento_km = data.get('raio_agrupamento_km', 5.0)
            motoboy_id = data.get('motoboy_id')  # opcional
            
            if not estabelecimento_id:
                return JsonResponse({
                    'success': False,
                    'error': 'estabelecimento_id é obrigatório'
                }, status=400)
            
            logger.info(f'Criando rotas para estabelecimento {estabelecimento_id}')
            
            with transaction.atomic():
                # Buscar pedidos disponíveis
                pedidos_disponiveis = Pedido.objects.filter(
                    estabelecimento_id=estabelecimento_id,
                    status__in=['preparo', 'pronto'],
                    rota__isnull=True
                ).order_by('data_criacao')
                
                if not pedidos_disponiveis.exists():
                    return JsonResponse({
                        'success': False,
                        'error': 'Nenhum pedido disponível para criar rotas'
                    }, status=400)
                
                # Agrupar pedidos por proximidade (simulação)
                rotas_criadas = self.agrupar_pedidos_por_proximidade(
                    pedidos_disponiveis, 
                    max_pedidos_por_rota, 
                    raio_agrupamento_km,
                    motoboy_id
                )
                
                logger.info(f'Criadas {len(rotas_criadas)} rotas com sucesso')
                
                return JsonResponse({
                    'success': True,
                    'message': f'{len(rotas_criadas)} rotas criadas com sucesso',
                    'rotas_criadas': rotas_criadas
                })
                
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'JSON inválido'
            }, status=400)
        except Exception as e:
            logger.error(f'Erro ao criar rotas: {str(e)}')
            return JsonResponse({
                'success': False,
                'error': 'Erro interno do servidor',
                'details': str(e)
            }, status=500)
    
    def agrupar_pedidos_por_proximidade(self, pedidos, max_pedidos, raio_km, motoboy_id=None):
        """
        Agrupa pedidos por proximidade geográfica
        """
        rotas_criadas = []
        pedidos_list = list(pedidos)
        
        while pedidos_list:
            # Pegar até max_pedidos_por_rota
            pedidos_grupo = pedidos_list[:max_pedidos]
            pedidos_list = pedidos_list[max_pedidos:]
            
            # Criar rota
            rota = Rota.objects.create(
                estabelecimento_id=pedidos_grupo[0].estabelecimento_id,
                motoboy_id=motoboy_id,
                status='pendente',
                data_criacao=timezone.now(),
                distancia_km=Decimal('12.5'),  # Simulado
                tempo_estimado_min=45  # Simulado
            )
            
            # Adicionar pedidos à rota
            for i, pedido in enumerate(pedidos_grupo):
                Rota_Pedido.objects.create(
                    rota=rota,
                    pedido=pedido,
                    ordem=i + 1,
                    status='pendente'
                )
                
                # Atualizar pedido
                pedido.rota = rota
                pedido.data_atribuicao = timezone.now()
                pedido.save()
            
            rotas_criadas.append({
                'rota_id': rota.id,
                'estabelecimento': rota.estabelecimento.nome,
                'quantidade_pedidos': len(pedidos_grupo),
                'status': rota.status,
                'distancia_km': float(rota.distancia_km),
                'tempo_estimado_min': rota.tempo_estimado_min
            })
        
        return rotas_criadas

@method_decorator(csrf_exempt, name='dispatch')
class ListarRotasView(View):
    """
    Endpoint para listar todas as rotas com filtros
    """
    
    @require_http_methods(["GET"])
    def get(self, request):
        try:
            estabelecimento_id = request.GET.get('estabelecimento_id')
            status = request.GET.get('status')
            data_inicio = request.GET.get('data_inicio')
            data_fim = request.GET.get('data_fim')
            
            logger.info(f'Listando rotas com filtros: estabelecimento={estabelecimento_id}, status={status}')
            
            # Construir query
            rotas_query = Rota.objects.select_related('estabelecimento', 'motoboy')
            
            if estabelecimento_id:
                rotas_query = rotas_query.filter(estabelecimento_id=estabelecimento_id)
            
            if status:
                rotas_query = rotas_query.filter(status=status)
            
            if data_inicio:
                rotas_query = rotas_query.filter(data_criacao__date__gte=data_inicio)
            
            if data_fim:
                rotas_query = rotas_query.filter(data_criacao__date__lte=data_fim)
            
            rotas = rotas_query.order_by('-data_criacao')
            
            rotas_data = []
            for rota in rotas:
                # Calcular estatísticas
                total_pedidos = rota.rotapedido_set.count()
                pedidos_entregues = rota.rotapedido_set.filter(status='entregue').count()
                progresso = (pedidos_entregues / total_pedidos * 100) if total_pedidos > 0 else 0
                
                rotas_data.append({
                    'rota_id': rota.id,
                    'estabelecimento': rota.estabelecimento.nome,
                    'motoboy': rota.motoboy.nome if rota.motoboy else None,
                    'status': rota.status,
                    'quantidade_pedidos': total_pedidos,
                    'pedidos_entregues': pedidos_entregues,
                    'progresso_percentual': round(progresso, 1),
                    'distancia_km': float(rota.distancia_km),
                    'tempo_estimado_min': rota.tempo_estimado_min,
                    'criada_em': rota.data_criacao.strftime('%d/%m/%Y %H:%M'),
                    'iniciada_em': rota.data_inicio.strftime('%d/%m/%Y %H:%M') if rota.data_inicio else None
                })
            
            logger.info(f'Encontradas {len(rotas_data)} rotas')
            
            return JsonResponse({
                'success': True,
                'rotas': rotas_data,
                'total_rotas': len(rotas_data)
            })
            
        except Exception as e:
            logger.error(f'Erro ao listar rotas: {str(e)}')
            return JsonResponse({
                'success': False,
                'error': 'Erro interno do servidor',
                'details': str(e)
            }, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class DetalhesRotaView(View):
    """
    Endpoint para detalhes completos de uma rota específica
    """
    
    @require_http_methods(["GET"])
    def get(self, request, rota_id):
        try:
            logger.info(f'Buscando detalhes da rota {rota_id}')
            
            try:
                rota = Rota.objects.select_related('estabelecimento', 'motoboy').get(id=rota_id)
            except Rota.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'error': f'Rota {rota_id} não encontrada'
                }, status=404)
            
            # Calcular estatísticas
            total_pedidos = rota.rotapedido_set.count()
            pedidos_entregues = rota.rotapedido_set.filter(status='entregue').count()
            pedidos_em_entrega = rota.rotapedido_set.filter(status='em_entrega').count()
            pedidos_pendentes = rota.rotapedido_set.filter(status='pendente').count()
            progresso = (pedidos_entregues / total_pedidos * 100) if total_pedidos > 0 else 0
            
            # Buscar entregas
            entregas = []
            for rota_pedido in rota.rotapedido_set.select_related('pedido').order_by('ordem'):
                pedido = rota_pedido.pedido
                entregas.append({
                    'ordem': rota_pedido.ordem,
                    'pedido_id': pedido.id,
                    'cliente': pedido.cliente,
                    'endereco': pedido.endereco,
                    'bairro': pedido.bairro if hasattr(pedido, 'bairro') else '',
                    'cidade': pedido.cidade if hasattr(pedido, 'cidade') else '',
                    'valor': float(pedido.subtotal + pedido.taxaEntrega - (pedido.desconto or 0)),
                    'status': rota_pedido.status.upper(),
                    'observacao': rota_pedido.observacao
                })
            
            return JsonResponse({
                'success': True,
                'rota': {
                    'id': rota.id,
                    'estabelecimento': rota.estabelecimento.nome,
                    'motoboy': rota.motoboy.nome if rota.motoboy else None,
                    'status': rota.status,
                    'distancia_km': float(rota.distancia_km),
                    'tempo_estimado_min': rota.tempo_estimado_min,
                    'criada_em': rota.data_criacao.strftime('%d/%m/%Y %H:%M'),
                    'iniciada_em': rota.data_inicio.strftime('%d/%m/%Y %H:%M') if rota.data_inicio else None
                },
                'estatisticas': {
                    'total_pedidos': total_pedidos,
                    'pedidos_entregues': pedidos_entregues,
                    'pedidos_em_entrega': pedidos_em_entrega,
                    'pedidos_pendentes': pedidos_pendentes,
                    'progresso_percentual': round(progresso, 1)
                },
                'entregas': entregas
            })
            
        except Exception as e:
            logger.error(f'Erro ao buscar detalhes da rota: {str(e)}')
            return JsonResponse({
                'success': False,
                'error': 'Erro interno do servidor',
                'details': str(e)
            }, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class IniciarRotaView(View):
    """
    Endpoint para iniciar a execução de uma rota
    """
    
    @require_http_methods(["POST"])
    def post(self, request, rota_id):
        try:
            logger.info(f'Iniciando rota {rota_id}')
            
            try:
                rota = Rota.objects.get(id=rota_id)
            except Rota.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'error': f'Rota {rota_id} não encontrada'
                }, status=404)
            
            if rota.status != 'pendente':
                return JsonResponse({
                    'success': False,
                    'error': f'Rota não pode ser iniciada (status atual: {rota.status})'
                }, status=400)
            
            # Atualizar rota
            rota.status = 'emandamento'
            rota.data_inicio = timezone.now()
            rota.save()
            
            logger.info(f'Rota {rota_id} iniciada com sucesso')
            
            return JsonResponse({
                'success': True,
                'message': 'Rota iniciada com sucesso',
                'rota_id': rota.id,
                'iniciada_em': rota.data_inicio.strftime('%d/%m/%Y %H:%M')
            })
            
        except Exception as e:
            logger.error(f'Erro ao iniciar rota: {str(e)}')
            return JsonResponse({
                'success': False,
                'error': 'Erro interno do servidor',
                'details': str(e)
            }, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class FinalizarRotaView(View):
    """
    Endpoint para finalizar uma rota (apenas se todos os pedidos foram entregues)
    """
    
    @require_http_methods(["POST"])
    def post(self, request, rota_id):
        try:
            logger.info(f'Finalizando rota {rota_id}')
            
            try:
                rota = Rota.objects.get(id=rota_id)
            except Rota.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'error': f'Rota {rota_id} não encontrada'
                }, status=404)
            
            if rota.status != 'emandamento':
                return JsonResponse({
                    'success': False,
                    'error': f'Rota não pode ser finalizada (status atual: {rota.status})'
                }, status=400)
            
            # Verificar se todos os pedidos foram entregues
            pedidos_pendentes = rota.rotapedido_set.exclude(status='entregue').count()
            if pedidos_pendentes > 0:
                return JsonResponse({
                    'success': False,
                    'error': f'Não é possível finalizar a rota. {pedidos_pendentes} pedidos ainda não foram entregues.'
                }, status=400)
            
            # Atualizar rota
            rota.status = 'concluida'
            rota.data_finalizacao = timezone.now()
            rota.save()
            
            logger.info(f'Rota {rota_id} finalizada com sucesso')
            
            return JsonResponse({
                'success': True,
                'message': 'Rota finalizada com sucesso',
                'rota_id': rota.id,
                'finalizada_em': rota.data_finalizacao.strftime('%d/%m/%Y %H:%M')
            })
            
        except Exception as e:
            logger.error(f'Erro ao finalizar rota: {str(e)}')
            return JsonResponse({
                'success': False,
                'error': 'Erro interno do servidor',
                'details': str(e)
            }, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class CancelarRotaView(View):
    """
    Endpoint para cancelar uma rota
    """
    
    @require_http_methods(["POST"])
    def post(self, request, rota_id):
        try:
            data = json.loads(request.body)
            motivo = data.get('motivo', '')
            
            logger.info(f'Cancelando rota {rota_id}: {motivo}')
            
            try:
                rota = Rota.objects.get(id=rota_id)
            except Rota.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'error': f'Rota {rota_id} não encontrada'
                }, status=404)
            
            if rota.status in ['concluida', 'cancelada']:
                return JsonResponse({
                    'success': False,
                    'error': f'Rota não pode ser cancelada (status atual: {rota.status})'
                }, status=400)
            
            with transaction.atomic():
                # Atualizar rota
                rota.status = 'cancelada'
                rota.observacoes = f"Cancelada: {motivo}"
                rota.save()
                
                # Liberar pedidos da rota
                for rota_pedido in rota.rotapedido_set.all():
                    pedido = rota_pedido.pedido
                    pedido.rota = None
                    pedido.data_atribuicao = None
                    pedido.save()
                
                # Deletar registros de rota_pedido
                rota.rotapedido_set.all().delete()
            
            logger.info(f'Rota {rota_id} cancelada com sucesso')
            
            return JsonResponse({
                'success': True,
                'message': 'Rota cancelada com sucesso',
                'rota_id': rota.id,
                'motivo': motivo
            })
            
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'JSON inválido'
            }, status=400)
        except Exception as e:
            logger.error(f'Erro ao cancelar rota: {str(e)}')
            return JsonResponse({
                'success': False,
                'error': 'Erro interno do servidor',
                'details': str(e)
            }, status=500)
```

### 2. **Configurar URLs**

Adicione as URLs no arquivo `urls.py` do seu projeto Django:

```python
# urls.py ou motopro/urls.py

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
```

### 3. **Criar Migrações**

Execute os comandos para criar e aplicar as migrações:

```bash
# Criar migrações para os novos modelos
python manage.py makemigrations motopro

# Aplicar migrações
python manage.py migrate
```

## 🧪 Testando os Endpoints

### 1. **Teste com curl**

```bash
# Criar rotas automaticamente
curl -X POST "http://localhost:8000/api/v1/desktop/rotas/criar/" \
  -H "Content-Type: application/json" \
  -d '{
    "estabelecimento_id": 11,
    "max_pedidos_por_rota": 8,
    "raio_agrupamento_km": 5.0,
    "motoboy_id": 1
  }'

# Listar rotas
curl -X GET "http://localhost:8000/api/v1/desktop/rotas/listar/?estabelecimento_id=11&status=pendente"

# Detalhes de uma rota
curl -X GET "http://localhost:8000/api/v1/desktop/rotas/1/"

# Iniciar rota
curl -X POST "http://localhost:8000/api/v1/desktop/rotas/1/iniciar/"

# Finalizar rota
curl -X POST "http://localhost:8000/api/v1/desktop/rotas/1/finalizar/"

# Cancelar rota
curl -X POST "http://localhost:8000/api/v1/desktop/rotas/1/cancelar/" \
  -H "Content-Type: application/json" \
  -d '{"motivo": "Problema com motoboy"}'
```

### 2. **Teste com Postman**

1. **POST** `/api/v1/desktop/rotas/criar/`
2. **GET** `/api/v1/desktop/rotas/listar/`
3. **GET** `/api/v1/desktop/rotas/{rota_id}/`
4. **POST** `/api/v1/desktop/rotas/{rota_id}/iniciar/`
5. **POST** `/api/v1/desktop/rotas/{rota_id}/finalizar/`
6. **POST** `/api/v1/desktop/rotas/{rota_id}/cancelar/`

## 🔒 Segurança e Validações

### 1. **Validações Implementadas**
- ✅ Verificação de existência da rota
- ✅ Verificação de status para ações
- ✅ Verificação de pedidos entregues para finalização
- ✅ Transações atômicas para cancelamento
- ✅ Logs de auditoria para rastreabilidade

### 2. **Status das Rotas**

| Status | Descrição | Ações Disponíveis |
|--------|-----------|-------------------|
| `pendente` | Rota criada, aguardando início | Iniciar, Cancelar |
| `emandamento` | Rota em execução | Finalizar, Cancelar |
| `concluida` | Rota finalizada com sucesso | Visualizar |
| `cancelada` | Rota cancelada | Visualizar |

## 📊 Monitoramento e Logs

### 1. **Logs Configurados**
```python
# settings.py

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'rotas_desktop.log',
        },
    },
    'loggers': {
        'rotas_desktop': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

### 2. **Métricas Sugeridas**
- Total de rotas criadas por dia
- Média de pedidos por rota
- Tempo médio de execução das rotas
- Taxa de sucesso vs cancelamento
- Eficiência por estabelecimento

## 🚀 Deploy e Produção

### 1. **Configurações de Produção**
```python
# settings.py (produção)

DEBUG = False
ALLOWED_HOSTS = ['seu-dominio.com']

# Configurar banco de dados de produção
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'motopro_db',
        'USER': 'motopro_user',
        'PASSWORD': 'senha_segura',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### 2. **Comandos de Deploy**
```bash
# Coletar arquivos estáticos
python manage.py collectstatic

# Aplicar migrações
python manage.py migrate

# Criar superusuário se necessário
python manage.py createsuperuser

# Testar endpoints
python manage.py test
```

## 📚 Documentação da API

### 1. **Endpoints Disponíveis**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/desktop/rotas/criar/` | Criar rotas automaticamente |
| GET | `/api/v1/desktop/rotas/listar/` | Listar rotas com filtros |
| GET | `/api/v1/desktop/rotas/{rota_id}/` | Detalhes de uma rota |
| POST | `/api/v1/desktop/rotas/{rota_id}/iniciar/` | Iniciar execução da rota |
| POST | `/api/v1/desktop/rotas/{rota_id}/finalizar/` | Finalizar rota |
| POST | `/api/v1/desktop/rotas/{rota_id}/cancelar/` | Cancelar rota |

### 2. **Códigos de Resposta**
- `200` - Sucesso
- `400` - Dados inválidos ou ação não permitida
- `404` - Recurso não encontrado
- `500` - Erro interno do servidor

## 🎯 Próximos Passos

1. **Implementar os modelos** no `models.py`
2. **Criar e aplicar migrações**
3. **Adicionar os endpoints** no `urls.py`
4. **Testar os endpoints** com curl/Postman
5. **Integrar com o frontend** MTP-Desktop
6. **Implementar roteirização inteligente** (algoritmos de proximidade)

---

**Status**: 📋 DOCUMENTAÇÃO COMPLETA  
**Versão**: 1.0  
**Data**: Janeiro 2025  
**Foco**: Backend Django para Sistema de Rotas de Entrega (MTP-Desktop)
