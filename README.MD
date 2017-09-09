# INF 330 - UFV - Trabalho 1 - 2017/2

## Linha de comando:
1. Tenha o Node 6 ou maior e o NPM 3 ou maior instalado.
2. Abra esta pasta no terminal.
2. Execute 'npm run cli' para gerar o código e executar com o arquivo exemplo.txt.
3. Execute 'npm run build:cli' para gerar o código.
4. Execute 'cd cli && node index.js qualquerarquivo.txt' para rodar com qualquer arquivo.

## Website:
1. Execute 'npm run web' para gerar o código e servir e a partir de um servidor local.
2. Execute 'npm run pre' para gerar o código do Github Pages.
3. Faça commit no github para atualizar o site.

## Pontos importantes:
Os arquivos que contém funções relevantes ao trabalho estão na pasta shared. Estes são o graph.ts e o HierholzerPath.ts. O primeiro guarda os dados do grafo e verifica se algum vértice tem grau ímpar. O segundo procura um caminho euleriano no grafo usando o algoritomo de Hierholzer.