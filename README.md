Shopper Price Updater
=====================

Este projeto é dividido em duas partes principais: o frontend e o backend, utilizando Docker para facilitar a configuração e a execução em ambientes de desenvolvimento.

Sumário
-------

- [Shopper Price Updater](#shopper-price-updater)
  - [Sumário](#sumário)
  - [Estrutura do Projeto](#estrutura-do-projeto)
    - [Frontend (`shopper-front`)](#frontend-shopper-front)
    - [Backend (`shopper-test-back`)](#backend-shopper-test-back)
  - [Configuração do Docker](#configuração-do-docker)
    - [Detalhes do Docker Compose](#detalhes-do-docker-compose)
  - [Instruções de Instalação e Execução](#instruções-de-instalação-e-execução)
    - [Comandos para iniciar o projeto:](#comandos-para-iniciar-o-projeto)
  - [Como Usar](#como-usar)
    - [Rotas do Backend](#rotas-do-backend)
    - [Rotas do Frontend](#rotas-do-frontend)
  - [Licença](#licença)

## Estrutura do Projeto

### Frontend (`shopper-front`)

A interface do usuário é construída com React, utilizando Tailwind CSS para o design.

**Estrutura de diretórios:**

```shopper-front/
├── node_modules/
├── public/
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── components/
│   │   └── ui/
│   ├── lib/
│   │   └── utils.ts
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── index.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── package.json
└── README.md
```

### Backend (`shopper-test-back`)

O backend é desenvolvido com NestJS e Prisma para gerenciamento de banco de dados MySQL.

**Estrutura de diretórios:**

```
shopper-test-back/
├── node_modules/
├── prisma/
│   ├── schema.prisma
├── src/
│   ├── products/
│   ├── app.module.ts
│   └── main.ts
└── README.md
```

Tecnologias Utilizadas

*   **Frontend:** React, TypeScript, Axios, Tailwind CSS, Vite
*   **Backend:** NestJS, TypeScript, Prisma, MySQL, Docker

## Configuração do Docker
----------------------

Utilizamos `docker-compose` para orquestrar containers do backend, frontend e banco de dados.

### Detalhes do Docker Compose
```yaml
services:
  app-backend:
    build: ./shopper-test-back
    ports:
      - "3000:3000"
  app-frontend:
    build: ./shopper-front
    ports:
      - "5173:5173"
  db:
    image: mysql:8.0
    ports:
      - "3306:3306"
```


## Instruções de Instalação e Execução

Antes de iniciar, instale Docker e Docker Compose na sua máquina. Acesse os diretórios a raiz do projeto e execute:

### Comandos para iniciar o projeto:
```bash 
docker-compose up --build
```

Para interromper os serviços e remover os containers:

```bash 
docker-compose down
```

## Como Usar

### Rotas do Backend

O backend fornece várias rotas API RESTful para interagir com os dados dos produtos:

*   **POST [`http://locahost:3000/products/upload-validate`](http://locahost:3000/products/upload-validate)** : Valida o arquivo CSV enviado e salva localmente caso a validação seja um sucesso.
*   **PUT [`http://locahost:3000/products/update-prices/:fileId`](http://locahost:3000/products/update-prices/:fileId)** : Faz o update dos dados com base no arquivo CSV validado, apos isso exclui arquivo do local.

### Rotas do Frontend

O frontend é acessível principalmente através do navegador e interage com o backend:

*   **Homepage ([`http://localhost:5173`](http://localhost:5173))**: Exibe a tela de upload, validação e update dos produtos.

## Licença

Este projeto é distribuído sob a Licença MIT.