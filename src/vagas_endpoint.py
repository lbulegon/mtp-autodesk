# vagas_endpoint.py
# Endpoint Django para fechar e candidatar vagas

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

from motopro.models import Vaga, Motoboy_Vaga_Candidatura
from geravagas_fixas import Command as GerarVagasCommand

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class FecharECandidatarView(View):
    """
    Endpoint para fechar uma vaga e gerar candidaturas automaticamente
    """
    
    @require_http_methods(["POST"])
    def post(self, request, vaga_id):
        try:
            # Buscar a vaga
            vaga = Vaga.objects.get(id=vaga_id)
            
            # Verificar se a vaga está aberta
            if vaga.status != 'aberta':
                return JsonResponse({
                    'error': 'Vaga não está aberta',
                    'status': vaga.status
                }, status=400)
            
            with transaction.atomic():
                # 1. Fechar a vaga
                vaga.status = 'encerrada'
                vaga.save()
                
                # 2. Gerar candidaturas usando a lógica do geravagas_fixas
                candidaturas_geradas = self.gerar_candidaturas_para_vaga(vaga)
                
                logger.info(f'Vaga {vaga_id} fechada e {candidaturas_geradas} candidaturas geradas')
                
                return JsonResponse({
                    'success': True,
                    'message': f'Vaga fechada e {candidaturas_geradas} candidaturas geradas',
                    'vaga_id': vaga_id,
                    'candidaturas_geradas': candidaturas_geradas
                })
                
        except ObjectDoesNotExist:
            return JsonResponse({
                'error': 'Vaga não encontrada'
            }, status=404)
        except Exception as e:
            logger.error(f'Erro ao fechar e candidatar vaga {vaga_id}: {str(e)}')
            return JsonResponse({
                'error': 'Erro interno do servidor',
                'details': str(e)
            }, status=500)
    
    def gerar_candidaturas_para_vaga(self, vaga):
        """
        Gera candidaturas para a vaga usando a lógica do geravagas_fixas
        """
        try:
            # Buscar motoboys disponíveis para a empresa
            from motopro.models import Motoboy
            
            # Buscar motoboys ativos da empresa
            motoboys = Motoboy.objects.filter(
                empresa=vaga.contrato.estabelecimento.empresa,
                status='ativo'
            )
            
            candidaturas_geradas = 0
            
            for motoboy in motoboys:
                # Verificar se já existe candidatura para este motoboy nesta vaga
                candidatura_existente = Motoboy_Vaga_Candidatura.objects.filter(
                    motoboy=motoboy,
                    vaga=vaga
                ).first()
                
                if not candidatura_existente:
                    # Criar nova candidatura
                    Motoboy_Vaga_Candidatura.objects.create(
                        motoboy=motoboy,
                        vaga=vaga,
                        status='pendente',
                        data_candidatura=timezone.now()
                    )
                    candidaturas_geradas += 1
            
            return candidaturas_geradas
            
        except Exception as e:
            logger.error(f'Erro ao gerar candidaturas para vaga {vaga.id}: {str(e)}')
            raise e

# URL pattern para incluir no urls.py:
# path('vagas/<int:vaga_id>/fechar-e-candidatar/', FecharECandidatarView.as_view(), name='fechar_e_candidatar'),

# Exemplo de uso no urls.py:
"""
from django.urls import path
from .vagas_endpoint import FecharECandidatarView

urlpatterns = [
    # ... outras URLs ...
    path('vagas/<int:vaga_id>/fechar-e-candidatar/', FecharECandidatarView.as_view(), name='fechar_e_candidatar'),
]
"""

