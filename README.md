# InfoPol Search

Interface web para pesquisa em banco de dados de boletins de ocorrência policial.

## Funcionalidades

- Pesquisa por número de BO
- Pesquisa por nome de pessoa
- Pesquisa por cidade
- Pesquisa por data (início e fim)
- Pesquisa por tipo de crime
- Pesquisa avançada com múltiplos termos e operadores lógicos (AND/OR)
- Visualização dos resultados em formato de tabela

## Tecnologias Utilizadas

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Hook Form
- Zod (validação de formulários)

## Requisitos

- Node.js 16+
- npm ou yarn

## Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/infopol-search.git

# Entre no diretório do projeto
cd infopol-search

# Instale as dependências
npm install
```

## Executando o Projeto

```bash
# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse o aplicativo em [http://localhost:5173](http://localhost:5173)

## Integração com API

Atualmente o projeto utiliza dados mockados para simulação. Para conectar com uma API real, atualize o arquivo `src/services/api.ts` com os endpoints e parâmetros corretos quando disponíveis.

## Estrutura do Projeto

```
/src
  /components   # Componentes React
  /services     # Serviços e integração com API
  /types        # Definições de tipos TypeScript
  /schemas      # Schemas de validação Zod
  /assets       # Recursos estáticos
```

## Desenvolvimento

### Comandos Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Compila o projeto para produção
- `npm run lint` - Executa a verificação de linting
- `npm run preview` - Visualiza a build de produção localmente

## Próximos Passos

- Integração com API real
- Implementação de paginação de resultados
- Implementação de filtros adicionais
- Implementação de autenticação
- Exportação de resultados para CSV/PDF
