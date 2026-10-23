# Manutenção do cache --- Agenda Eletrônica

## Problema identificado

O site voltava a exibir o layout antigo mesmo depois de enviar as
alterações ao GitHub. Ao atualizar a página com `Ctrl + Shift + R`, o
layout novo aparecia temporariamente, mas depois o antigo retornava.

## Causa

O Service Worker (`sw.js`) podia continuar entregando arquivos antigos
armazenados no cache do navegador.

## Correção aplicada

No arquivo `sw.js`:

-   O nome do cache foi atualizado de `agenda-v2` para `agenda-v3`.
-   O evento `activate` remove os caches antigos.
-   `self.skipWaiting()` permite que o novo Service Worker seja ativado
    sem esperar todas as abas antigas fecharem.
-   `self.clients.claim()` faz o novo Service Worker assumir o controle
    das páginas abertas.
-   O evento `fetch` tenta carregar os arquivos pela rede primeiro e usa
    o cache como alternativa se estiver sem conexão.

## Se o problema acontecer novamente

1.  Confira se as alterações mais recentes foram salvas no Cursor.
2.  Envie os arquivos alterados ao GitHub.
3.  Confira se o `sw.js` está atualizado no repositório.
4.  Abra o site e pressione `Ctrl + Shift + R`.
5.  Feche a aba e abra o site novamente para confirmar que o layout
    continua atualizado.
6.  Se o problema persistir, verifique o `sw.js` antes de alterar outros
    arquivos.

## Cuidados

-   Não apague nem altere arquivos de HTML, CSS ou JavaScript sem antes
    confirmar a causa.
-   Se mudar novamente a estratégia de cache, atualize o nome da
    constante `CACHE` (por exemplo, para `agenda-v4`) para forçar a
    criação de um novo cache.
-   Os caminhos em `ASSETS` precisam corresponder ao local em que o site
    está publicado.

## Registro da correção

-   Repositório: `Xand2308/agenda-eletronica`
-   Branch: `main`
-   Commit: `22dfb42`
-   Mensagem: `Corrige atualização do cache`
