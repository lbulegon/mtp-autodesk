from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import time
from motopro.models import Estabelecimento_Contrato, Vaga

class Command(BaseCommand):
    help = 'Cria vagas fixas diárias (dia e noite) com base nos contratos vigentes dos estabelecimentos'

    def get_horario(self, contrato, chave):
        item = contrato.itens.filter(item__chave_sistema=chave).first()
        if item:
            try:
                h, m = map(int, item.valor.split(":"))
                return time(h, m)
            except ValueError:
                self.stdout.write(f'Formato inválido para horário "{chave}" no contrato de {contrato.estabelecimento.nome}')
        else:
            self.stdout.write(f'Item de horário "{chave}" não encontrado no contrato de {contrato.estabelecimento.nome}')
        return None

    def handle(self, *args, **kwargs):
        hoje = timezone.localdate()
        contratos = Estabelecimento_Contrato.objects.filter(status="vigente")

        for contrato in contratos:
            if contrato.data_inicio and contrato.data_inicio > hoje:
                continue
            if contrato.data_fim and contrato.data_fim < hoje:
                continue

            # Pega horários definidos nos itens do contrato
            hora_inicio_dia   = self.get_horario(contrato, "hora_inicio_dia")
            hora_fim_dia      = self.get_horario(contrato, "hora_fim_dia")
            hora_inicio_noite = self.get_horario(contrato, "hora_inicio_noite")
            hora_fim_noite    = self.get_horario(contrato, "hora_fim_noite")

            periodos = {
                "dia":   (hora_inicio_dia, hora_fim_dia),
                "noite": (hora_inicio_noite, hora_fim_noite),
            }

            for chave, (hora_inicio, hora_fim) in periodos.items():
                if not hora_inicio or not hora_fim:
                    self.stdout.write(f'Horário ausente ou inválido para o período "{chave}" em {contrato.estabelecimento.nome}')
                    continue

                item_vagas = contrato.itens.filter(item__chave_sistema=f"max_vagas_fixas_{chave}").first()
                if not item_vagas:
                    self.stdout.write(f'Contrato sem item "max_vagas_fixas_{chave}" para {contrato.estabelecimento.nome}')
                    continue

                try:
                    quantidade_vagas = int(item_vagas.valor)
                except ValueError:
                    self.stdout.write(f'Valor inválido para "max_vagas_fixas_{chave}" no contrato de {contrato.estabelecimento.nome}')
                    continue

                vagas_existentes = Vaga.objects.filter(
                    contrato           = contrato,
                    data_da_vaga       = hoje,
                    hora_inicio_padrao = hora_inicio,
                    hora_fim_padrao    = hora_fim,
                    tipo_vaga          = 'fixa'
                ).count()

                if vagas_existentes >= quantidade_vagas:
                    self.stdout.write(
                        f'Vagas já lançadas ({chave}): {contrato.estabelecimento.nome}'
                    )
                    continue

                vagas_para_criar = quantidade_vagas - vagas_existentes

                for _ in range(vagas_para_criar):
                    Vaga.objects.create(
                        contrato           = contrato,
                        data_da_vaga       = hoje,
                        hora_inicio_padrao = hora_inicio,
                        hora_fim_padrao    = hora_fim,
                        tipo_vaga          = 'fixa'
                    )

                self.stdout.write(
                    f'{vagas_para_criar} vaga(s) criada(s) para {contrato.estabelecimento.nome} ({chave})'
                )
