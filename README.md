# Gestão de Clientes - Teste técnico para Desenvolvedor C#

Projeto criado implementando [.NET 8](https://dotnet.microsoft.com/pt-br/) com [Entity Framework](https://learn.microsoft.com/pt-br/aspnet/entity-framework) e BCrypt no backend e Reactjs com [shadcn/ui](https://github.com/shadcn-ui/ui), [Tailwind CSS](https://tailwindcss.com/), [Vite](https://vitejs.dev/) e [axios](https://axios-http.com/) no frontend.


# Como executar

## Dockerfile

É possível rodar o projeto completo via Docker, usando as configurações do Dockerfile disponível. Para executá-lo basta rodar os seguintes comandos a partir da pasta raiz do projeto:

    docker build -t gestao-clientes .
    docker run -d -p 80:80 gestao-clientes

## Backend

Primeiro é necessário criar o banco de dados SQLite usando as migrations existentes no projeto `GestaoClientes.Persistence`. Para isso, execute os seguintes comandos a partir da pasta `GestaoClientes`:

    dotnet ef database update -s GestaoClientes.API

Para executar o backend diretamente no Visual Studio abrindo o arquivo `GestaoClientes.sln` e rodar o projeto `GestaoClientes.API` ou por meio do terminal ao executar o comando `dotnet run` dentro da pasta do projeto `GestaoClientes.API`.

## Frontend

Já para o frontend, abra a pasta `Gestao-Cliente` no terminal e execute os seguintes comandos:

    npm install
    npm run dev
    

## Criando dados para teste

Há um pequeno programa feito para gerar dados para teste dentro do projeto de frontend, gerando 10 clientes por execução.  Com o projeto de backend rodando, basta executar o comando abaixo quantas vezes forem necessárias a partir da pasta `Gestao-Cliente`:

    npm tsx src/utils/data.ts 

# Contatos

É possível me contactar por e-mail em gamazyn@live.com, e através do meu perfil no [LinkedIn](https://www.linkedin.com/in/thi-moreira/).

