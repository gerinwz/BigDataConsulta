import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import string
import nltk
from wordcloud import WordCloud
import plotly.express as px
from wordcloud import WordCloud, STOPWORDS
import matplotlib.pyplot as plt
import webbrowser

# Certifique-se de ter os pacotes NLTK e as stopwords em português baixados.
nltk.download("punkt")
nltk.download("stopwords")
stop_words = set(stopwords.words("portuguese"))


# Função para pré-processamento de texto
def preprocess_text(text):
    # Transforma o texto em Maiuscula
    text = text.upper()
    print("Texto em maiúsculas:", text)

    # Remove pontuações e caracteres especiais
    text = "".join([char for char in text if char not in string.punctuation])
    print("Texto sem pontuações:", text)

    # Remove números
    text = "".join([char for char in text if not char.isdigit()])
    print("Texto sem números:", text)

    # Tokenização e remoção de stop words
    tokens = word_tokenize(text, language="portuguese")
    filtered_tokens = [word for word in tokens if word not in stop_words]
    print("Tokens após remoção de stop words:", filtered_tokens)
    # Reconstroi o texto após o pré-processamento
    text = " ".join(filtered_tokens)
    print("Texto após reconstituição:", text)
    return text


# Carregue o arquivo CSV com colunas 'Assunto' e 'Problema' (substitua 'nome_do_arquivo.csv' pelo nome do seu arquivo CSV)
df = pd.read_csv("Dados Consumidor Reclamações Mercado Livre.csv", sep=";")

# Renomeie as colunas para 'descricao' e 'reclamacao' (opcional)
df.columns = ["assunto", "problema"]

# Visualize o DataFrame
print(df)

# Aplica o pré-processamento à coluna 'problema'
df["problema_tratado"] = df["problema"].apply(preprocess_text)

# Cria o vetor TF-IDF
tfidf_vectorizer = TfidfVectorizer()
tfidf_matrix = tfidf_vectorizer.fit_transform(df["problema_tratado"])

# Encontre o número ideal de clusters usando o método do cotovelo
wcss = []
max_clusters = 69
for i in range(1, max_clusters + 1):
    kmeans = KMeans(
        n_clusters=i, init="k-means++", max_iter=300, n_init=10, random_state=0
    )
    kmeans.fit(tfidf_matrix)
    wcss.append(kmeans.inertia_)

# Plot do gráfico do Método do Cotovelo
plt.figure(figsize=(10, 5))
plt.plot(range(1, max_clusters + 1), wcss, marker="o", linestyle="-", color="b")
plt.title("Número Ideal de Categorias para Mensagens")
plt.xlabel("Número de Categorias (Clusters)")
plt.ylabel("Variabilidade Dentro dos Clusters")
plt.grid()
plt.savefig("Figure_1.png")  # Salva o primeiro gráfico como Figure_1.png
plt.show()

# Executa o K-Means com o número ideal de clusters
num_clusters = 9
kmeans = KMeans(
    n_clusters=num_clusters, init="k-means++", max_iter=300, n_init=10, random_state=0
)
df["cluster"] = kmeans.fit_predict(tfidf_matrix)
df["cluster"] = df["cluster"].astype(str)

# Reduz a dimensionalidade usando t-SNE
tsne = TSNE(n_components=2, random_state=0, init="random")
tsne_result = tsne.fit_transform(tfidf_matrix)

# Cria um DataFrame para o t-SNE
df_tsne = pd.DataFrame(
    {"tsne_x": tsne_result[:, 0], "tsne_y": tsne_result[:, 1], "cluster": df["cluster"]}
)

# Criação do gráfico t-SNE com Clusters usando Plotly
fig = px.scatter(
    df_tsne,
    x="tsne_x",
    y="tsne_y",
    color="cluster",
    title="Agrupando Mensagens em Categorias (t-SNE)",
    labels={"tsne_x": "Forma 1 das Mensagens", "tsne_y": "Forma 2 das Mensagens"},
    color_continuous_scale="viridis",
)

# Personalização do layout
fig.update_layout(
    xaxis_title="Forma 1 das Mensagens",
    yaxis_title="Forma 2 das Mensagens",
    coloraxis_colorbar_title="Categorias",
    legend_title="Legenda de Categorias",
)

# Salva o gráfico como um arquivo HTML
html_file_path = "tsne_clusters_plot.html"
fig.write_html("tsne_clusters_plot.html")

# Abre o arquivo HTML no navegador padrão
webbrowser.open(html_file_path)

# Crie uma nuvem de palavras para cada cluster
for cluster_label in df["cluster"].unique():
    # Filtra o DataFrame para obter apenas as linhas do cluster atual
    cluster_df = df[df["cluster"] == cluster_label]

    # Combine o texto do cluster
    cluster_combined_text = " ".join(cluster_df["problema_tratado"])

    # Crie uma nuvem de palavras para o texto combinado do cluster
    wordcloud = WordCloud(background_color="white").generate(cluster_combined_text)

    # Exiba a nuvem de palavras
    plt.figure(figsize=(6, 4))
    plt.imshow(wordcloud, interpolation="bilinear")
    plt.title(f"Wordcloud - Cluster {cluster_label}")
    plt.savefig(f"wordcloud_cluster_{cluster_label}.png", bbox_inches="tight")
    plt.axis("off")
    plt.show()

    cluster_0 = df[df["cluster"] == "0"]
    cluster_0.to_excel("cluster_0.xlsx")
    cluster_1 = df[df["cluster"] == "1"]
    cluster_1.to_excel("cluster_1.xlsx")
    cluster_2 = df[df["cluster"] == "2"]
    cluster_2.to_excel("cluster_2.xlsx")
    cluster_3 = df[df["cluster"] == "3"]
    cluster_3.to_excel("cluster_3.xlsx")
    cluster_4 = df[df["cluster"] == "4"]
    cluster_4.to_excel("cluster_4.xlsx")
    cluster_5 = df[df["cluster"] == "5"]
    cluster_5.to_excel("cluster_5.xlsx")
    cluster_6 = df[df["cluster"] == "6"]
    cluster_6.to_excel("cluster_6.xlsx")
    cluster_7 = df[df["cluster"] == "7"]
    cluster_7.to_excel("cluster_7.xlsx")
    cluster_8 = df[df["cluster"] == "8"]
    cluster_8.to_excel("cluster_8.xlsx")
