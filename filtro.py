import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import string
import nltk

# Certifique-se de ter os pacotes NLTK e as stopwords em português baixados.
nltk.download('punkt')
nltk.download('stopwords')
stop_words = set(stopwords.words('portuguese'))

# Função para pré-processamento de texto
def preprocess_text(text):
     # Transforma o texto em Maiuscula
    text = text.upper()
    print("Texto em maiúsculas:", text)
    
    # Remove pontuações e caracteres especiais
    text = ''.join([char for char in text if char not in string.punctuation])
    print("Texto sem pontuações:", text)
    
    # Remove números
    text = ''.join([char for char in text if not char.isdigit()])
    print("Texto sem números:", text)
   
    # Tokenização e remoção de stop words
    tokens = word_tokenize(text, language='portuguese')
    filtered_tokens = [word for word in tokens if word not in stop_words]
    print("Tokens após remoção de stop words:", filtered_tokens)
    # Reconstroi o texto após o pré-processamento
    text = ' '.join(filtered_tokens)
    print("Texto após reconstituição:", text)
    return text

# Carregue o arquivo CSV com colunas 'Assunto' e 'Problema' (substitua 'nome_do_arquivo.csv' pelo nome do seu arquivo CSV)
df = pd.read_csv('Dados Consumidor Reclamações Mercado Livre.csv', sep=';')

# Renomeie as colunas para 'descricao' e 'reclamacao' (opcional)
df.columns = ['assunto', 'problema']

# Visualize o DataFrame
print(df)

# Aplica o pré-processamento à coluna 'problema'
df['problema_tratado'] = df['problema'].apply(preprocess_text)

# Cria o vetor TF-IDF
tfidf_vectorizer = TfidfVectorizer()
tfidf_matrix = tfidf_vectorizer.fit_transform(df['problema_tratado'])

# Encontre o número ideal de clusters usando o método do cotovelo
wcss = []
max_clusters = 69
for i in range(1, max_clusters + 1):
    kmeans = KMeans(n_clusters=i, init='k-means++', max_iter=300, n_init=10, random_state=0)
    kmeans.fit(tfidf_matrix)
    wcss.append(kmeans.inertia_)

# Plot do gráfico do método do cotovelo
plt.plot(range(1, max_clusters + 1), wcss)
plt.title('Método do Cotovelo')
plt.xlabel('Número de clusters')
plt.ylabel('WCSS (Soma dos Quadrados das Distâncias)')
plt.show()

# Executa o K-Means com o número ideal de clusters
num_clusters = 7
kmeans = KMeans(n_clusters=num_clusters, init='k-means++', max_iter=300, n_init=10, random_state=0)
df['cluster'] = kmeans.fit_predict(tfidf_matrix)

# Reduz a dimensionalidade usando t-SNE
tsne = TSNE(n_components=2, random_state=0, init='random')
tsne_result = tsne.fit_transform(tfidf_matrix)

# Cria um DataFrame para o t-SNE
df_tsne = pd.DataFrame({'tsne_x': tsne_result[:, 0], 'tsne_y': tsne_result[:, 1], 'cluster': df['cluster']})

# Plota o gráfico t-SNE
plt.figure(figsize=(10, 8))
plt.scatter(df_tsne['tsne_x'], df_tsne['tsne_y'], c=df_tsne['cluster'], cmap='viridis')
plt.title('Gráfico t-SNE com Clusters')
plt.xlabel('t-SNE Dimensão 1')
plt.ylabel('t-SNE Dimensão 2')
plt.colorbar()
plt.show()
