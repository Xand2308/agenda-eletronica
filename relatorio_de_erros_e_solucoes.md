# Relatório de Erros e Soluções do Projeto (Agenda Eletrônica)

Este documento registra os principais problemas identificados durante o desenvolvimento e a sincronização do projeto, juntamente com as suas respetivas causas e soluções.

---

## 1. Divergência na Renderização do Layout (Service Worker e Cache)

* **Sintoma**: O código e o layout novos apareciam na IDE local, mas o site publicado mantinha a versão antiga.
* **Causa**: O Service Worker (`sw.js`) e o cache do navegador interceptavam as requisições HTTP e entregavam os ficheiros estáticos antigos armazenados localmente no dispositivo.
* **Solução**:
  * Desregistrar o Service Worker através do DevTools (`F12` > *Application* > *Service Workers* > *Unregister*).
  * Atualizar a versão da constante de cache dentro de `sw.js` (ex: de `agenda-v1` para `agenda-v2`) para forçar o navegador de todos os utilizadores a descarregar a versão nova.

---

## 2. Dessincronização entre IDE e Repositório Local (OneDrive)

* **Sintoma**: O comando `git status` retornava `working tree clean` mesmo com alterações visíveis na tela da IDE.
* **Causa**: O arquivo sendo editado no VS Code e a pasta sob monitoramento do Git no terminal apontavam para caminhos físicos ligeiramente diferentes dentro da estrutura do OneDrive (ou o arquivo não havia sido gravado no disco via buffer/salvamento).
* **Solução**:
  * Alinhar o diretório de trabalho abrindo explicitamente a pasta raiz oficial do repositório no VS Code via **File > Open Folder**.
  * Assegurar a gravação do arquivo no disco rígido (`Ctrl + S`) antes de executar os comandos do Git.

---

## 3. Erro de Sintaxe (SyntaxError) no JavaScript

* **Sintoma**: A aplicação não atualizava a interface de categorias nem renderizava os novos elementos CSS.
* **Causa**: Declaração incompleta de constante dentro da função `adicionarTarefa`:
  ```javascript
  // ❌ Incorreto
  const textoTarefa =
  const textoDigitado = ...
  ```
* **Solução**: Remoção da atribuição incompleta para permitir a interpretação correta do script pelo motor JavaScript do navegador.

---

## 4. Redeclaração de Variável no mesmo Escopo (TypeError)

* **Sintoma**: O script interrompia a execução durante a iteração de salvamento das tarefas.
* **Causa**: Utilização da palavra-chave `const` para redeclarar a mesma variável (`textoPuro`) dentro do bloco `forEach` da função `salvarTarefas`.
* **Solução**: Unificação da lógica de limpeza de texto em uma única atribuição de constante:
  ```javascript
  // ✅ Correto
  const textoPuro = limparTextoTarefa(spanCompleto, categoria);
  ```

---

## 5. Falha no Carregamento Inicial do LocalStorage

* **Sintoma**: A estrutura nova com categorias falhava ao carregar dados salvos em versões anteriores.
* **Causa**: Objeto de tarefas gravado no `localStorage` sem a propriedade `categoria`, gerando retornos `undefined` em funções de filtro e atribuição de CSS.
* **Solução**: Adição de um valor padrão (*fallback*) no salvamento e na leitura do `dataset`:
  ```javascript
  const categoria = item.dataset.categoria || "pessoal";
  ```