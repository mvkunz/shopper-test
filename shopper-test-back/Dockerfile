FROM node:20

WORKDIR /usr/src/app

# Instalar dockerize
ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

# Instalação de dependências
COPY package*.json ./
RUN npm install

# Copia o resto dos arquivos
COPY . .

CMD ["npm", "run", "start:dev"]
