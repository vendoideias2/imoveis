# CRM Imobiliária

Este é um sistema de CRM para imobiliárias, composto por um frontend em Next.js e um backend (a ser definido/configurado).

## Estrutura do Projeto

- `client/`: Aplicação Frontend (Next.js)
- `server/`: Aplicação Backend
- `docker-compose.yml`: Configuração para desenvolvimento local
- `Dockerfile`: Arquivo de build para deploy do frontend (Client)

## Como Rodar Localmente

1. Certifique-se de ter o Docker e Docker Compose instalados.
2. Execute:
   ```bash
   docker-compose up --build
   ```

## Deploy

O projeto está configurado para deploy via Docker. O `Dockerfile` na raiz constrói a aplicação cliente.
