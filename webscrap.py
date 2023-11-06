import requests
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import os
import glob
import pandas as pd

# URL da página com o link para o arquivo CSV
url_pagina = "https://dados.mj.gov.br/dataset/reclamacoes-do-consumidor-gov-br"

# Instância do driver do Chrome
servico = Service("chromedriver.exe")  # Substitua pelo caminho do seu chromedriver
navegador = webdriver.Chrome(service=servico)
navegador.maximize_window()

# Acessar a página
navegador.get(url_pagina)

# Definir os cabeçalhos para a requisição
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.47"
}

try:
    # Aguardar até que os elementos com os links para os arquivos CSV estejam visíveis
    links_elements = WebDriverWait(navegador, 20).until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "a.heading"))
    )

    # Extrair os links para os arquivos CSV que contêm a data "2023"
    csv_links = [link.get_attribute("href") for link in links_elements if '2023' in link.text]

    # Criar um diretório para armazenar os arquivos CSV
    diretorio = 'DADOS CONSUMIDOR PROCONS SOMENTE 2023'
    if not os.path.exists(diretorio):
        os.makedirs(diretorio)

    # Baixar os arquivos CSV
    for idx, csv_link in enumerate(csv_links):
        navegador.get(csv_link)  # Acessar a página do link para o arquivo CSV
        time.sleep(3)  # Aguardar o carregamento da página

        # Obter a URL do arquivo CSV
        csv_url_element = navegador.find_element(By.CSS_SELECTOR,
                                                 "#content > div.row.wrapper > section > div:nth-child(1) > p > a")
        csv_url = csv_url_element.get_attribute("href")

        response = requests.get(csv_url, headers=headers)

        if response.status_code == 200:
            # Salvar o conteúdo em um arquivo local
            csv_filename = f'{diretorio}/basecompleta_somente_2023_{idx + 1}.csv'
            with open(csv_filename, "wb") as f:
                f.write(response.content)
            print(f"Arquivo {csv_filename} baixado com sucesso!")
        else:
            print(f"Falha ao baixar o arquivo {csv_link}. Código de status:", response.status_code)

    # Juntar todos os arquivos CSV em um arquivo geral
    csv_files = glob.glob(f"{diretorio}/*.csv")
    with open(f"{diretorio}/base_completa_dados_somente_2023.csv", "w", newline='', encoding='utf-8') as output_file:
        for csv_file in csv_files:
            with open(csv_file, "r", encoding='utf-8') as input_file:
                next(input_file)  # Ignorar a primeira linha (cabeçalho) de cada arquivo
                for line in input_file:
                    output_file.write(line)

    print("Arquivos CSV foram juntados com sucesso em base_completa_dados_somente_2023.csv!")
finally:
    # Fechar o navegador
    navegador.quit()

# Ler o arquivo CSV
df = pd.read_csv(f'{diretorio}/base_completa_dados_somente_2023.csv', header=None, names=['nome_arquivo', 'link_arquivo', 'data'])

# Filtrar apenas as linhas com data referente a 2023
df_2023 = df[df['data'].str.contains('2023')]

# Remover duplicações
df_2023.drop_duplicates(inplace=True)

# Salvar o DataFrame filtrado e sem duplicações
df_2023.to_csv(f'{diretorio}/base_completa_dados_somente_2023.csv', index=False)

print("Arquivo base_completa_dados_somente_2023.csv foi atualizado e as duplicações foram removidas.")
