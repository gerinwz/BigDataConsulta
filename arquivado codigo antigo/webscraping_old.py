# CÓDIGO TODO COMENTADO

import requests  # Importa a biblioteca 'requests' para fazer solicitações HTTP
from bs4 import BeautifulSoup  # Importa a biblioteca 'BeautifulSoup' para análise HTML
import pandas as pd  # Importa a biblioteca 'pandas' para manipulação de dados
import time  # Importa o módulo 'time' para adicionar atraso entre as requisições HTTP

url = "https://www.reclameaqui.com.br/empresa/blink-telecom/lista-reclamacoes/"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.47"
}

# Obtém o número da última página
site = requests.get(url, headers=headers)  # Envia uma solicitação GET para a URL fornecida
soup = BeautifulSoup(site.content, "html.parser")  # Analisa o conteúdo da página com BeautifulSoup
ultima_pagina_element = soup.find("li", class_="sc-hImiYT jTAoeE")  # Procura um elemento HTML com a classe específica
ultima_pagina = int(ultima_pagina_element.text.strip()) if ultima_pagina_element else 1  # Extrai o número da última página

time.sleep(2)  # Adiciona um atraso de 2 segundos entre as requisições

# Itera sobre as páginas (de 1 a 51)
with open("Dados das Reclamações.csv", "w", newline="", encoding="UTF-8") as f:  # Abre um arquivo CSV para escrita
    for i in range(1, 52):  # Loop de 1 a 51 (alterável para a quantidade desejada de páginas)
        url_pag = f"https://www.reclameaqui.com.br/empresa/amazon/lista-reclamacoes/?pagina={i}"  # Gera a URL da página atual
        site = requests.get(url_pag, headers=headers)  # Envia uma solicitação GET para a URL da página atual
        soup = BeautifulSoup(site.content, "html.parser")  # Analisa o conteúdo da página com BeautifulSoup
        reclamacoes = soup.find_all("div", class_="sc-1pe7b5t-0 iQGzPh")  # Encontra todas as reclamações na página

        for reclamacao in reclamacoes:  # Loop pelas reclamações na página
            # Extrai informações da reclamação
            titulo_reclamacao = reclamacao.find("h4", class_="sc-1pe7b5t-1 jAlTVn").get_text().strip()
            descricao_reclamacao = reclamacao.find("p", class_="jmCUqY").text.strip() if reclamacao.find("p", class_="jmCUqY") else ''
            status_reclamacao = reclamacao.find("span", class_="bfzjDQ").text.strip() if reclamacao.find("span", class_="bfzjDQ") else ''
            data_reclamacao = reclamacao.find("span", class_="bmtSzo").text.strip() if reclamacao.find("span", class_="bmtSzo") else ''

            linha = f"{titulo_reclamacao};{descricao_reclamacao};{status_reclamacao};{data_reclamacao};"  # Cria uma linha de dados no formato CSV
            print(linha)  # Imprime a linha no console
            f.write(linha + "\n")  # Escreve a linha no arquivo CSV

        print(f"Página {i} processada: {url_pag}")  # Imprime uma mensagem indicando a página processada
        time.sleep(2)  # Adiciona um atraso de 2 segundos entre as requisições

# Verifica se existem reclamações
if reclamacoes:
    primeiro_reclamacao = reclamacoes[0]  # Acessa o primeiro elemento da lista de reclamações
    # Extrai informações da primeira reclamação
    titulo_reclamacao = primeiro_reclamacao.find("h4", class_="sc-1pe7b5t-1 jAlTVn").get_text().strip()
    descricao_reclamacao = primeiro_reclamacao.find("p", class_="jmCUqY")
    status_reclamacao = primeiro_reclamacao.find("span", class_="bfzjDQ")
    data_reclamacao = primeiro_reclamacao.find("span", class_="bmtSzo")

    # Verifica se há descrição, status e data da primeira reclamação
    if descricao_reclamacao:
        print("Descrição:", descricao_reclamacao.get_text().strip())  # Imprime a descrição
    else:
        print("Nenhuma descrição encontrada.")

    if status_reclamacao:
        print("Status da Reclamação:", status_reclamacao.text.strip())  # Imprime o status
    else:
        print("Nenhum status de reclamação encontrado.")

    if data_reclamacao:
        print("Data da Reclamação:", data_reclamacao.text.strip())  # Imprime a data
    else:
        print("Nenhuma data de reclamação encontrada.")
else:
    print("Nenhuma reclamação encontrada.")  # Mensagem se não houver reclamações