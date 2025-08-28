# 🐍 Implementação Backend Django - MotoPro

## 📋 **Visão Geral**

Este documento contém todas as implementações necessárias para o backend Django (`MotoPro`) que o frontend Electron (`mtp-autodesk`) precisa consumir.

## 🏗️ **Estrutura de Pastas Recomendada**

```
MotoPro/
├── motopro/
│   ├── models.py                 # Modelos existentes + novos
│   ├── views/
│   │   ├── __init__.py
│   │   ├── rotas.py              # Endpoints de rotas
│   │   ├── vagas.py              # Endpoints de vagas
│   │   ├── motoboys.py           # Endpoints de motoboys
│   │   └── pedidos.py            # Endpoints de pedidos
│   ├── urls.py                   # URLs principais
│   ├── serializers.py            # Serializers para JSON
│   └── management/
│       └── commands/
│           └── gerar_vagas_fixas.py
└── manage.py
```

## 📊 **1. Modelos (models.py)**

### **Adicionar ao models.py existente:**

```python
from django.db import models
from django.utils import timezone
from decimal import Decimal

class Rota(models.Model):
    """Modelo para rotas de entrega"""
    
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('emandamento', 'Em Andamento'),
        ('concluida', 'Concluída'),
        ('cancelada', 'Cancelada'),
    ]
    
    id = models.AutoField(primary_key=True)
    estabelecimento = models.ForeignKey('Estabelecimento', on_delete=models.CASCADE)
    motoboy = models.ForeignKey('Motoboy', on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente')
    data_criacao = models.DateTimeField(default=timezone.now)
    data_inicio = models.DateTimeField(null=True, blank=True)
    data_fim = models.DateTimeField(null=True, blank=True)
    observacoes = models.TextField(blank=True)
    total_pedidos = models.IntegerField(default=0)
    distancia_km = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('0.00'))
    tempo_estimado_min = models.IntegerField(default=0)
    motivo_cancelamento = models.TextField(blank=True)
    
    class Meta:
        db_table = 'rota'
        ordering = ['-data_criacao']
    
    def __str__(self):
        return f"Rota #{self.id} - {self.estabelecimento.nome} ({self.status})"

class Rota_Pedido(models.Model):
    """Relacionamento entre rotas e pedidos"""
    
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('emandamento', 'Em Andamento'),
        ('entregue', 'Entregue'),
        ('cancelado', 'Cancelado'),
    ]
    
    id = models.AutoField(primary_key=True)
    rota = models.ForeignKey(Rota, on_delete=models.CASCADE, related_name='pedidos')
    pedido = models.ForeignKey('Pedido', on_delete=models.CASCADE)
    ordem = models.IntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente')
    data_entrega = models.DateTimeField(null=True, blank=True)
    observacoes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'rota_pedido'
        unique_together = ['rota', 'pedido']
        ordering = ['rota', 'ordem']
    
    def __str__(self):
        return f"Rota #{self.rota.id} - Pedido #{self.pedido.id} ({self.status})"
```

## 🔗 **2. Views - Rotas (views/rotas.py)**

```python
# views/rotas.py
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
            
            if not estabelecimento_id:
                return JsonResponse({
                    'success': False,
                    'error': 'estabelecimento_id é obrigatório'
                }, status=400)
            
            logger.info(f'Criando rotas para estabelecimento {estabelecimento_id}')
            
            with transaction.atomic():
                # Buscar pedidos disponíveis (não roteirizados)
                pedidos_disponiveis = Pedido.objects.filter(
                    estabelecimento_id=estabelecimento_id,
                    status__in=['preparo', 'pronto'],
                    rota_pedido__isnull=True  # Não está em nenhuma rota
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
                    raio_agrupamento_km
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
    
    def agrupar_pedidos_por_proximidade(self, pedidos, max_pedidos, raio_km):
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
                estabelecimento=pedidos_grupo[0].estabelecimento,
                status='pendente',
                total_pedidos=len(pedidos_grupo),
                observacoes=f'Rota criada automaticamente com {len(pedidos_grupo)} pedidos'
            )
            
            # Adicionar pedidos à rota
            for i, pedido in enumerate(pedidos_grupo):
                Rota_Pedido.objects.create(
                    rota=rota,
                    pedido=pedido,
                    ordem=i + 1,
                    status='pendente'
                )
            
            rotas_criadas.append({
                'rota_id': rota.id,
                'quantidade_pedidos': len(pedidos_grupo),
                'status': rota.status
            })
        
        return rotas_criadas

@method_decorator(csrf_exempt, name='dispatch')
class ListarRotasView(View):
    """
    Endpoint para listar rotas ativas
    """
    
    @require_http_methods(["GET"])
    def get(self, request):
        try:
            estabelecimento_id = request.GET.get('estabelecimento_id')
            status = request.GET.get('status', 'pendente,emandamento')
            
            # Filtrar rotas
            rotas_query = Rota.objects.select_related('estabelecimento', 'motoboy')
            
            if estabelecimento_id:
                rotas_query = rotas_query.filter(estabelecimento_id=estabelecimento_id)
            
            if status:
                status_list = status.split(',')
                rotas_query = rotas_query.filter(status__in=status_list)
            
            rotas = rotas_query.all()
            
            rotas_data = []
            for rota in rotas:
                # Contar pedidos por status
                pedidos_entregues = rota.pedidos.filter(status='entregue').count()
                pedidos_em_entrega = rota.pedidos.filter(status='emandamento').count()
                pedidos_pendentes = rota.pedidos.filter(status='pendente').count()
                
                rotas_data.append({
                    'id': rota.id,
                    'estabelecimento': rota.estabelecimento.nome,
                    'motoboy': rota.motoboy.nome if rota.motoboy else None,
                    'status': rota.status,
                    'total_pedidos': rota.total_pedidos,
                    'pedidos_entregues': pedidos_entregues,
                    'pedidos_em_entrega': pedidos_em_entrega,
                    'pedidos_pendentes': pedidos_pendentes,
                    'data_criacao': rota.data_criacao.strftime('%d/%m/%Y %H:%M'),
                    'distancia_km': float(rota.distancia_km),
                    'tempo_estimado_min': rota.tempo_estimado_min
                })
            
            return JsonResponse({
                'success': True,
                'rotas': rotas_data,
                'total': len(rotas_data)
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
    Endpoint para obter detalhes de uma rota específica
    """
    
    @require_http_methods(["GET"])
    def get(self, request, rota_id):
        try:
            rota = Rota.objects.select_related('estabelecimento', 'motoboy').get(id=rota_id)
            pedidos_rota = rota.pedidos.select_related('pedido').order_by('ordem')
            
            # Estatísticas
            total_pedidos = rota.total_pedidos
            pedidos_entregues = pedidos_rota.filter(status='entregue').count()
            pedidos_em_entrega = pedidos_rota.filter(status='emandamento').count()
            pedidos_pendentes = pedidos_rota.filter(status='pendente').count()
            
            progresso_percentual = (pedidos_entregues / total_pedidos * 100) if total_pedidos > 0 else 0
            
            # Dados da rota
            rota_data = {
                'id': rota.id,
                'status': rota.status,
                'motoboy': rota.motoboy.nome if rota.motoboy else None,
                'distancia_km': float(rota.distancia_km),
                'tempo_estimado_min': rota.tempo_estimado_min,
                'criada_em': rota.data_criacao.strftime('%d/%m/%Y %H:%M'),
                'iniciada_em': rota.data_inicio.strftime('%d/%m/%Y %H:%M') if rota.data_inicio else None
            }
            
            # Estatísticas
            estatisticas = {
                'total_pedidos': total_pedidos,
                'pedidos_entregues': pedidos_entregues,
                'pedidos_em_entrega': pedidos_em_entrega,
                'pedidos_pendentes': pedidos_pendentes,
                'progresso_percentual': round(progresso_percentual, 1)
            }
            
            # Entregas
            entregas = []
            for rota_pedido in pedidos_rota:
                pedido = rota_pedido.pedido
                entregas.append({
                    'ordem': rota_pedido.ordem,
                    'cliente': pedido.cliente,
                    'endereco': pedido.endereco,
                    'valor': float(pedido.valor_total),
                    'status': rota_pedido.status
                })
            
            return JsonResponse({
                'success': True,
                'rota': rota_data,
                'estatisticas': estatisticas,
                'entregas': entregas
            })
            
        except ObjectDoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Rota não encontrada'
            }, status=404)
        except Exception as e:
            logger.error(f'Erro ao obter detalhes da rota {rota_id}: {str(e)}')
            return JsonResponse({
                'success': False,
                'error': 'Erro interno do servidor',
                'details': str(e)
            }, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class IniciarRotaView(View):
    """
    Endpoint para iniciar uma rota
    """
    
    @require_http_methods(["POST"])
    def post(self, request, rota_id):
        try:
            with transaction.atomic():
                rota = Rota.objects.get(id=rota_id)
                
                if rota.status != 'pendente':
                    return JsonResponse({
                        'success': False,
                        'error': f'Rota não pode ser iniciada (status atual: {rota.status})'
                    }, status=400)
                
                # Atualizar status da rota
                rota.status = 'emandamento'
                rota.data_inicio = timezone.now()
                rota.save()
                
                # Atualizar status dos pedidos
                rota.pedidos.update(status='emandamento')
                
                return JsonResponse({
                    'success': True,
                    'message': f'Rota #{rota_id} iniciada com sucesso'
                })
                
        except ObjectDoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Rota não encontrada'
            }, status=404)
        except Exception as e:
            logger.error(f'Erro ao iniciar rota {rota_id}: {str(e)}')
            return JsonResponse({
                'success': False,
                'error': 'Erro interno do servidor',
                'details': str(e)
            }, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class FinalizarRotaView(View):
    """
    Endpoint para finalizar uma rota
    """
    
    @require_http_methods(["POST"])
    def post(self, request, rota_id):
        try:
            with transaction.atomic():
                rota = Rota.objects.get(id=rota_id)
                
                if rota.status != 'emandamento':
                    return JsonResponse({
                        'success': False,
                        'error': f'Rota não pode ser finalizada (status atual: {rota.status})'
                    }, status=400)
                
                # Verificar se todos os pedidos foram entregues
                pedidos_pendentes = rota.pedidos.filter(status__in=['pendente', 'emandamento']).count()
                if pedidos_pendentes > 0:
                    return JsonResponse({
                        'success': False,
                        'error': f'Rota não pode ser finalizada: {pedidos_pendentes} pedidos ainda não entregues'
                    }, status=400)
                
                # Atualizar status da rota
                rota.status = 'concluida'
                rota.data_fim = timezone.now()
                rota.save()
                
                return JsonResponse({
                    'success': True,
                    'message': f'Rota #{rota_id} finalizada com sucesso'
                })
                
        except ObjectDoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Rota não encontrada'
            }, status=404)
        except Exception as e:
            logger.error(f'Erro ao finalizar rota {rota_id}: {str(e)}')
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
            motivo = data.get('motivo', 'Cancelamento solicitado')
            
            with transaction.atomic():
                rota = Rota.objects.get(id=rota_id)
                
                if rota.status in ['concluida', 'cancelada']:
                    return JsonResponse({
                        'success': False,
                        'error': f'Rota não pode ser cancelada (status atual: {rota.status})'
                    }, status=400)
                
                # Atualizar status da rota
                rota.status = 'cancelada'
                rota.motivo_cancelamento = motivo
                rota.data_fim = timezone.now()
                rota.save()
                
                # Atualizar status dos pedidos
                rota.pedidos.update(status='cancelado')
                
                return JsonResponse({
                    'success': True,
                    'message': f'Rota #{rota_id} cancelada com sucesso'
                })
                
        except ObjectDoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Rota não encontrada'
            }, status=404)
        except Exception as e:
            logger.error(f'Erro ao cancelar rota {rota_id}: {str(e)}')
            return JsonResponse({
                'success': False,
                'error': 'Erro interno do servidor',
                'details': str(e)
            }, status=500)
```

## 📦 **3. Views - Pedidos (views/pedidos.py)**

```python
# views/pedidos.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views import View
import logging

from motopro.models import Pedido, Rota_Pedido

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class PedidosDisponiveisRotaView(View):
    """
    Endpoint para listar pedidos disponíveis para criar rotas
    """
    
    @require_http_methods(["GET"])
    def get(self, request):
        try:
            estabelecimento_id = request.GET.get('estabelecimento_id')
            
            if not estabelecimento_id:
                return JsonResponse({
                    'success': False,
                    'error': 'estabelecimento_id é obrigatório'
                }, status=400)
            
            # Buscar pedidos disponíveis (não roteirizados)
            pedidos = Pedido.objects.filter(
                estabelecimento_id=estabelecimento_id,
                status__in=['preparo', 'pronto'],
                rota_pedido__isnull=True  # Não está em nenhuma rota
            ).order_by('data_criacao')
            
            pedidos_data = []
            for pedido in pedidos:
                pedidos_data.append({
                    'id': pedido.id,
                    'cliente': pedido.cliente,
                    'endereco': pedido.endereco,
                    'status': pedido.status,
                    'valor_total': float(pedido.valor_total),
                    'itens_count': pedido.itens.count() if hasattr(pedido, 'itens') else 0,
                    'data_criacao': pedido.data_criacao.strftime('%d/%m/%Y %H:%M')
                })
            
            return JsonResponse({
                'success': True,
                'pedidos': pedidos_data,
                'total': len(pedidos_data)
            })
            
        except Exception as e:
            logger.error(f'Erro ao listar pedidos disponíveis: {str(e)}')
            return JsonResponse({
                'success': False,
                'error': 'Erro interno do servidor',
                'details': str(e)
            }, status=500)
```

## 🛵 **4. Views - Motoboys (views/motoboys.py)**

```python
# views/motoboys.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views import View
from datetime import date
import logging

from motopro.models import Motoboy, Vaga, Motoboy_Vaga_Candidatura

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class MotoboysDisponiveisView(View):
    """
    Endpoint para buscar motoboys disponíveis para atribuição de pedidos
    """
    
    @require_http_methods(["GET"])
    def get(self, request):
        try:
            # Parâmetros opcionais
            estabelecimento_id = request.GET.get('estabelecimento_id')
            data = request.GET.get('data', date.today().isoformat())
            
            logger.info(f'Buscando motoboys disponíveis para estabelecimento {estabelecimento_id} na data {data}')
            
            # Buscar vagas ativas do estabelecimento na data
            vagas_query = Vaga.objects.filter(
                data=date.fromisoformat(data),
                status='aberta'
            )
            
            if estabelecimento_id:
                vagas_query = vagas_query.filter(contrato__estabelecimento_id=estabelecimento_id)
            
            vagas = vagas_query.all()
            
            motoboys_disponiveis = []
            
            for vaga in vagas:
                # Buscar motoboys alocados nesta vaga
                candidaturas = Motoboy_Vaga_Candidatura.objects.filter(
                    vaga=vaga,
                    status='aceita'
                ).select_related('motoboy')
                
                for candidatura in candidaturas:
                    motoboy = candidatura.motoboy
                    
                    # Verificar se o motoboy já está na lista
                    if not any(m['id'] == motoboy.id for m in motoboys_disponiveis):
                        motoboys_disponiveis.append({
                            'id': motoboy.id,
                            'nome': motoboy.nome,
                            'telefone': motoboy.telefone,
                            'placa': motoboy.placa,
                            'status': motoboy.status,
                            'vaga_id': vaga.id,
                            'vaga_horario': f"{vaga.hora_inicio} - {vaga.hora_fim}",
                            'estabelecimento': vaga.contrato.estabelecimento.nome,
                            'entregas_hoje': 0,  # TODO: implementar contagem de entregas
                            'rating': 4.5  # TODO: implementar sistema de rating
                        })
            
            logger.info(f'Encontrados {len(motoboys_disponiveis)} motoboys disponíveis')
            
            return JsonResponse({
                'success': True,
                'motoboys': motoboys_disponiveis,
                'total': len(motoboys_disponiveis),
                'data': data,
                'estabelecimento_id': estabelecimento_id
            })
            
        except Exception as e:
            logger.error(f'Erro ao buscar motoboys disponíveis: {str(e)}')
            return JsonResponse({
                'success': False,
                'error': 'Erro interno do servidor',
                'details': str(e)
            }, status=500)
```

## 🏢 **5. Views - Vagas (views/vagas.py)**

```python
# views/vagas.py
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
from datetime import time, datetime

from motopro.models import Vaga, Estabelecimento_Contrato

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class GerarVagasExtrasView(View):
    """
    Endpoint para gerar vagas extras com quantidade e turno específicos
    """
    
    @require_http_methods(["POST"])
    def post(self, request):
        try:
            # Parse do JSON
            data = json.loads(request.body)
            
            # Validar campos obrigatórios
            estabelecimento_id = data.get('estabelecimento_id')
            data_inicio = data.get('data_inicio')
            quantidade = data.get('quantidade')
            turno = data.get('turno')
            
            if not estabelecimento_id:
                return JsonResponse({
                    'error': 'estabelecimento_id é obrigatório'
                }, status=400)
                
            if not data_inicio:
                return JsonResponse({
                    'error': 'data_inicio é obrigatório'
                }, status=400)
                
            if not quantidade or quantidade < 1:
                return JsonResponse({
                    'error': 'quantidade deve ser maior que 0'
                }, status=400)
                
            if not turno or turno not in ['manha', 'noite']:
                return JsonResponse({
                    'error': 'turno deve ser "manha" ou "noite"'
                }, status=400)
            
            # Buscar contrato do estabelecimento
            try:
                contrato = Estabelecimento_Contrato.objects.get(
                    estabelecimento_id=estabelecimento_id,
                    status='vigente'
                )
            except Estabelecimento_Contrato.DoesNotExist:
                return JsonResponse({
                    'error': f'Contrato ativo não encontrado para o estabelecimento {estabelecimento_id}'
                }, status=404)
            
            # Buscar horários do contrato do estabelecimento
            def get_horario(contrato, chave):
                """Busca horário específico no contrato"""
                logger.info(f'Buscando horário: {chave} no contrato do estabelecimento {contrato.estabelecimento.nome}')
                
                item = contrato.itens.filter(item__chave_sistema=chave).first()
                if item:
                    try:
                        h, m = map(int, item.valor.split(":"))
                        horario = time(h, m)
                        logger.info(f'✅ Horário encontrado no contrato: {chave} = {horario}')
                        return horario
                    except ValueError:
                        logger.error(f'❌ Formato inválido para horário "{chave}": {item.valor}')
                else:
                    logger.warning(f'⚠️  Item de horário "{chave}" não encontrado no contrato')
                return None
            
            # Buscar horários baseados no turno usando os labels corretos
            if turno == 'manha':
                hora_inicio = get_horario(contrato, 'hora_inicio_dia')
                hora_fim = get_horario(contrato, 'hora_fim_dia')
            else:  # noite
                hora_inicio = get_horario(contrato, 'hora_inicio_noite')
                hora_fim = get_horario(contrato, 'hora_fim_noite')
            
            # Usar horários padrão se não encontrados no contrato
            if not hora_inicio or not hora_fim:
                logger.warning(f'Horários não encontrados no contrato para o turno "{turno}". Usando horários padrão.')
                
                # Horários padrão como fallback
                if turno == 'manha':
                    hora_inicio = time(8, 0)  # 08:00
                    hora_fim = time(18, 0)    # 18:00
                else:  # noite
                    hora_inicio = time(18, 0) # 18:00
                    hora_fim = time(2, 0)     # 02:00
            
            # Criar vagas extras
            vagas_criadas = []
            with transaction.atomic():
                for i in range(quantidade):
                    vaga = Vaga.objects.create(
                        contrato=contrato,
                        data_da_vaga=datetime.strptime(data_inicio, '%Y-%m-%d').date(),
                        hora_inicio_padrao=hora_inicio,
                        hora_fim_padrao=hora_fim,
                        tipo_vaga='extra',
                        status='aberta'
                    )
                    vagas_criadas.append({
                        'id': vaga.id,
                        'data': vaga.data_da_vaga.strftime('%d/%m/%Y'),
                        'horario': f"{vaga.hora_inicio_padrao.strftime('%H:%M')} - {vaga.hora_fim_padrao.strftime('%H:%M')}",
                        'tipo': vaga.tipo_vaga,
                        'status': vaga.status
                    })
            
            logger.info(f'Criadas {len(vagas_criadas)} vagas extras para estabelecimento {estabelecimento_id}')
            
            return JsonResponse({
                'success': True,
                'message': f'{len(vagas_criadas)} vagas extras criadas com sucesso',
                'vagas_criadas': vagas_criadas,
                'estabelecimento_id': estabelecimento_id,
                'data_inicio': data_inicio,
                'turno': turno,
                'quantidade': quantidade
            })
            
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'JSON inválido'
            }, status=400)
        except Exception as e:
            logger.error(f'Erro ao gerar vagas extras: {str(e)}')
            return JsonResponse({
                'success': False,
                'error': 'Erro interno do servidor',
                'details': str(e)
            }, status=500)
```

## 🔗 **6. URLs (urls.py)**

```python
# urls.py
from django.urls import path
from .views.rotas import (
    CriarRotasView, ListarRotasView, DetalhesRotaView,
    IniciarRotaView, FinalizarRotaView, CancelarRotaView
)
from .views.pedidos import PedidosDisponiveisRotaView
from .views.motoboys import MotoboysDisponiveisView
from .views.vagas import GerarVagasExtrasView

urlpatterns = [
    # Rotas
    path('api/v1/desktop/rotas/criar/', CriarRotasView.as_view(), name='criar_rotas'),
    path('api/v1/desktop/rotas/listar/', ListarRotasView.as_view(), name='listar_rotas'),
    path('api/v1/desktop/rotas/<int:rota_id>/', DetalhesRotaView.as_view(), name='detalhes_rota'),
    path('api/v1/desktop/rotas/<int:rota_id>/iniciar/', IniciarRotaView.as_view(), name='iniciar_rota'),
    path('api/v1/desktop/rotas/<int:rota_id>/finalizar/', FinalizarRotaView.as_view(), name='finalizar_rota'),
    path('api/v1/desktop/rotas/<int:rota_id>/cancelar/', CancelarRotaView.as_view(), name='cancelar_rota'),
    
    # Pedidos
    path('api/v1/motoboy-vaga/pedidos-disponiveis-rota/', PedidosDisponiveisRotaView.as_view(), name='pedidos_disponiveis_rota'),
    
    # Motoboys
    path('api/v1/motoboy-vaga/motoboys-disponiveis/', MotoboysDisponiveisView.as_view(), name='motoboys_disponiveis'),
    
    # Vagas
    path('api/v1/vagas/gerar-extras/', GerarVagasExtrasView.as_view(), name='gerar_vagas_extras'),
]
```

## 📋 **7. Migrations**

Após adicionar os modelos, execute:

```bash
python manage.py makemigrations
python manage.py migrate
```

## 🔧 **8. Configurações Adicionais**

### **CORS (settings.py)**
```python
INSTALLED_APPS = [
    # ...
    'corsheaders',
    # ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ... outros middlewares
]

# Permitir requisições do frontend Electron
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Para desenvolvimento, permitir todas as origens
CORS_ALLOW_ALL_ORIGINS = True  # Apenas para desenvolvimento!
```

### **Logging (settings.py)**
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'debug.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

## 🚀 **9. Testes**

### **Testar endpoints:**
```bash
# Criar rotas
curl -X POST http://localhost:8000/api/v1/desktop/rotas/criar/ \
  -H "Content-Type: application/json" \
  -d '{"estabelecimento_id": 11, "max_pedidos_por_rota": 5, "raio_agrupamento_km": 5.0}'

# Listar rotas
curl http://localhost:8000/api/v1/desktop/rotas/listar/?estabelecimento_id=11

# Pedidos disponíveis
curl http://localhost:8000/api/v1/motoboy-vaga/pedidos-disponiveis-rota/?estabelecimento_id=11
```

## ✅ **10. Checklist de Implementação**

- [ ] Adicionar modelos `Rota` e `Rota_Pedido` ao `models.py`
- [ ] Criar pasta `views/` e arquivos de views
- [ ] Implementar todos os endpoints
- [ ] Configurar URLs
- [ ] Executar migrations
- [ ] Configurar CORS
- [ ] Testar endpoints
- [ ] Remover sistema de localStorage do frontend
- [ ] Atualizar frontend para usar APIs

## 🎯 **Resultado Final**

Após implementar tudo no backend Django:

1. **Frontend** faz requisições para APIs
2. **Backend** processa e salva no banco de dados
3. **Pedidos roteirizados** ficam no banco, não no localStorage
4. **Sistema completo** e profissional

Agora você pode abrir o projeto Django e implementar essas funcionalidades! 🚀
