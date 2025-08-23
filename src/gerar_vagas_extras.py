# gerar_vagas_extras.py
# Endpoint Django para gerar vagas extras

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
                
                logger.info(f'Usando horários padrão: {hora_inicio} - {hora_fim}')
            else:
                logger.info(f'Usando horários do contrato: {hora_inicio} - {hora_fim}')
            
            # Converter data string para objeto date
            try:
                data_vaga = datetime.strptime(data_inicio, '%Y-%m-%d').date()
            except ValueError:
                return JsonResponse({
                    'error': 'Formato de data inválido. Use YYYY-MM-DD'
                }, status=400)
            
            vagas_criadas = []
            
            with transaction.atomic():
                # Criar as vagas extras
                for i in range(quantidade):
                    vaga = Vaga.objects.create(
                        contrato=contrato,
                        data_da_vaga=data_vaga,
                        hora_inicio_padrao=hora_inicio,
                        hora_fim_padrao=hora_fim,
                        tipo_vaga='extra',
                        status='aberta'
                    )
                    vagas_criadas.append({
                        'id': vaga.id,
                        'status': vaga.status,
                        'data': data_vaga.strftime('%Y-%m-%d'),
                        'inicio': hora_inicio.strftime('%H:%M'),
                        'fim': hora_fim.strftime('%H:%M'),
                        'turno': turno
                    })
            
            logger.info(f'{len(vagas_criadas)} vagas extras criadas para estabelecimento {estabelecimento_id} em {data_inicio}')
            
            return JsonResponse({
                'success': True,
                'message': f'{len(vagas_criadas)} vagas extras criadas com sucesso',
                'vagas_criadas': vagas_criadas,
                'vagas_criadas_total': len(vagas_criadas),
                'estabelecimento_id': estabelecimento_id,
                'data_inicio': data_inicio,
                'turno': turno
            })
                
        except json.JSONDecodeError:
            return JsonResponse({
                'error': 'JSON inválido'
            }, status=400)
        except Exception as e:
            logger.error(f'Erro ao gerar vagas extras: {str(e)}')
            return JsonResponse({
                'error': 'Erro interno do servidor',
                'details': str(e)
            }, status=500)

# URL pattern para incluir no urls.py:
# path('motoboy-vaga/gerar-vagas-extras/', GerarVagasExtrasView.as_view(), name='gerar_vagas_extras'),
