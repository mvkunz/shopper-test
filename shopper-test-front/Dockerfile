# Imagem base
FROM node:20

# Define o diretório de trabalho no container
WORKDIR /usr/src/app

# Copia os arquivos de configuração do projeto
COPY package*.json ./
COPY vite.config.ts ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

# Expõe a porta em que o servidor Vite estará rodando
EXPOSE 5173

# Comando para iniciar o aplicativo
CMD ["npm", "run", "dev"]
