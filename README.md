# LUMYRA-STORE
A Lumyra Store é uma joalheria digital de luxo dedicada a oferecer peças exclusivas, atemporais e de alta sofisticação. A plataforma foi projetada para proporcionar uma experiência de compra amigavel, conectando clientes a coleções de alta joalheria com elegância e segurança em cada detalhe.

## Descrição
A Lumyra Store foca na excelência da jornada do cliente, desde a curadoria das peças até a finalização do pedido. O ecossistema oferece funcionalidades pensadas para o mercado de luxo:

## Instalação
Para configurar o ambiente da Lumyra Store localmente, temos alguns critérios e passos a seguir:

1.  **Instale uma IDE:** Recomendamos o uso do IntelliJ IDEA, Eclipse ou VS Code.
2.  **Configure o Maven v3.9.6+:** É obrigatório o uso do Maven 3.9.6 ou superior instalado globalmente. (https://maven.apache.org/download.cgi)
3.  **Java JDK 21:** O projeto utiliza o JDK 21 (Recomendado: Amazon Corretto 21). (https://docs.aws.amazon.com/corretto/latest/corretto-21-ug/downloads-list.html)
4.  **Node.js v20.12.0+ (LTS):** Necessário para executar o servidor de desenvolvimento do frontend e gerenciar dependências. (https://nodejs.org/en/download/)

## Configuração do Projeto para Desenvolvimento Local

1.  Verifique a variável de sistema `JAVA_HOME` e certifique-se de que aponta para o JDK 21.
2.  Verifique a variável de sistema `PATH` e certifique-se de que inclua o caminho `/bin` do seu JDK e do Maven.
3.  Crie ou verifique a variável `MAVEN_HOME` apontando para sua instalação local do Maven.

O comando a seguir compila o backend e prepara o ambiente. Recomenda-se executar este comando na pasta `/backend` antes do primeiro uso:

mvn clean install

### Windows / OSX - PASSO 1 (Backend)

1.  Acesse o terminal na pasta `/backend`.
2.  Execute o comando para iniciar o serviço na porta 8080:
    mvn spring-boot:run

### Windows / OSX - PASSO 2 (Frontend)

1.  Acesse o terminal na pasta `/frontend`.
2.  Instale as dependências de servidor (necessário apenas na primeira vez):
    npm install
3.  Inicie o servidor local na porta 3000:
    npm start

Após completar estes passos, seu ambiente estará pronto para testes e desenvolvimento.
