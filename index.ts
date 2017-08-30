import * as fs from "fs";
import * as readline from "readline";

type Vertice = number[];

let graph: {
  initialized: boolean;
  verticesNumber: number;
  edgesNumber: number;
  vertices: Vertice[];
} = {
  initialized: false,
  verticesNumber: 0,
  edgesNumber: 0,
  vertices: []
};

const rl = readline.createInterface({
  input: fs.createReadStream("exemplo.txt")
});

rl.on("line", line => {
  if (!graph.initialized) {
    initGraph(line);
  } else {
    processLine(line);
  }
});

rl.on("close", () => {
  if (hasOnlyEvenDegrees(graph.vertices)) {
    try {
      // Forca-se uma copia profunda do array
      // porque os proximos metodos sao recursivos
      // e alteram o array que lhes eh passado.
      const verticesCopy = JSON.parse(
        JSON.stringify(graph.vertices)
      ) as Vertice[];

      const circuit = HierholzerPath(verticesCopy, []);

      console.log("Eh um grafo euleriano.");
      console.log("Caminho: " + circuit);
    } catch (error) {
      // No momento o algoritmo de procurar o caminho vai lancar
      // um erro se ele perceber que o grafo nao eh conectado.
      console.log("Nao eh um grafo euleriano. Motivo: ");
      console.log("O grafo nao eh conectado.");
    }
  } else {
    // Como ha algum vertice com grau impar ja podemos afirmar
    // que o grafo nao eh euleriano.
    console.log("Nao eh um grafo euleriano. Motivo: ");
    console.log("Ha algum vertice com grau impar");
  }
});

const hasOnlyEvenDegrees = (vertices: Vertice[]): boolean =>
  vertices.reduce((prevResult, vertice) => {
    const verticeEdgesNumber = vertice.length;
    const isEven: boolean = verticeEdgesNumber % 2 === 0;
    return prevResult && isEven;
  }, true);

const initGraph = (line: string) => {
  const numbers = line.split(" ") as [string, string];
  graph.verticesNumber = Number(numbers[0]);
  graph.edgesNumber = Number(numbers[1]);
  graph.initialized = true;
  for (let i = 0; i < graph.verticesNumber; i++) {
    graph.vertices[i] = [];
  }
};

const processLine = (line: string) => {
  const numbers = line.split(" ") as [string, string];
  // Como a contagem dos indices comeca de 1 no arquivo texto,
  // aqui eh normalizado para comecar em 0.
  const from = Number(numbers[0]) - 1;
  const to = Number(numbers[1]) - 1;

  // Cada vertice guarda o numero do outro vertice ao qual eh ligado.
  graph.vertices[from] = [...graph.vertices[from], to];
  graph.vertices[to] = [...graph.vertices[to], from];
};

const createCircuit = (circuit: number[], vertices: Vertice[]): number[] => {
  // O proximo vertice eh o ultimo que esta no circuito.
  const nextVerticeNumber = circuit[circuit.length - 1];

  // O proximo passo(vertice) eh o ultimo que esta no array de vertices
  // e eh removido para nao poder mais ser usado.
  const nextStep = vertices[nextVerticeNumber].pop() as number;

  // Temos que tomar o cuidado de deletar esta aresta do outro vertice
  // ao qual ela esta ligada.
  const anotherIndex = vertices[nextStep].indexOf(nextVerticeNumber);
  vertices[nextStep].splice(anotherIndex, 1);

  // O novo circuito eh o que recebemos de antes
  // concatenado com o proximo passo.
  const newCircuit = [...circuit, nextStep];

  if (nextStep === circuit[0]) {
    // Se o item sendo inserido no circuito eh o primeiro item
    // do circuito significa que completamos uma volta.
    // Podemos retornar este circuito.
    return newCircuit;
  } else {
    // Ainda ha caminho para andar. Recursivamente construimos o circuito.
    return createCircuit(newCircuit, vertices);
  }
};

const findNonEmptyVerticeIndex = (
  vertices: Vertice[],
  index: number
): number => {
  if (vertices[index].length !== 0) {
    return index;
  } else {
    return findNonEmptyVerticeIndex(vertices, index + 1);
  }
};

const HierholzerPath = (vertices: Vertice[], circuit: number[]): string => {
  const edgesLeft = vertices.reduce((prev, curr) => [...prev, ...curr], []);
  if (edgesLeft.length === 0) {
    // -- Se C inclui todas arestas, eis o circuito euleriano.
    // Se nao ha mais arestas para processar, basta retornar
    // o circuito jah formatado como string e com o primeiro indice
    // comecando em 1.
    return circuit.map(n => n + 1).join(" ");
  } else {
    // Ainda ha arestas para processar

    if (circuit.length === 0) {
      // -- Comece de um vértice qualquer
      // -- Crie um circuito C sem repetir aresta
      // -- (ao usar uma aresta para chegar em um vértice escolha outra não usada para sair)
      // Se a funcao nao recebeu nenhum circuito
      // eh porque o processamento esta comecando agora.

      const newCircuit = createCircuit([0], vertices);
      return HierholzerPath(vertices, newCircuit);
    } else {
      // -- Senão, enquanto C não incluir todas as arestas,
      // -- construa outro circuito a partir de um vértice de C com arestas não usadas,
      // -- e "junte" esse circuito a C

      // Achamos um vertice que ainda tenha arestas disponiveis.
      const init = findNonEmptyVerticeIndex(vertices, 0);

      // Montamos um novo circuito comecando dessa aresta.
      const newCircuit = createCircuit([init], vertices);

      // Achamos qual a posicao no caminho no caminho anterior
      // que devemos inserir o novo caminho.
      const positionToInsert = circuit.indexOf(init);
      if (positionToInsert === -1) {
        // Se nao achar o caminho eh porque o grafo nao eh conectado.
        // Como no exemplo_nao_euleriano2.txt
        throw Error();
      }

      // O array beg eh dos itens que estao a frente da posicao a inserir
      const beg = [...circuit].slice(0, positionToInsert);

      // O array end nao contem o vertice que eh o init do novo grafo.
      // Assim podemos inserir este novo circuito antes desta parte.
      // Por exemplo, se o circuito antigo eh '1 2 3 4 1' e o novo eh '3 5 3'
      // beg == [1, 2]
      // ebd == [4, 1]
      const end = [...circuit].slice(positionToInsert + 1);

      // Juntamos o circuito completo.
      const mergedCircuit = [...beg, ...newCircuit, ...end];

      return HierholzerPath(vertices, mergedCircuit);
    }
  }
};
