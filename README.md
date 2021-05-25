# Bake-Off 3
Escrita em Smartwatches

## Iterações
### Inicial 
Divisão das letras em nove teclas, estilo t9 (ordenadas alfabeticamente). Mas, ao invês de se clicar x vezes na tecla para se obter a letra na posição x, seleção das letras é feita através de *swipes*.

**Problema:** Tempo utilizado na procura de posições das letras. Utilizadores já não estão familiarizados com este tipo de teclados.

### Primeira
Divisão das letras em 3 teclas, estilo qwerty. Evolução da dinâmica dos *swipes*.

**Problema:** Não foi apontado nenhum problema em específico com a interface, mas vários utilizadores com ecrãs de dimensões superiores a 15 polegadas tiveram problemas com a pixelização do ecrã do relógio, ou seja, não estávamos a escalar corretamente. Para além disso, comentaram que uma função *"auto complete"* melhoraria drasticamente a sua performance.

### Segunda
Para além das mudanças da primeira iteração, foi implementado um algoritmo de texto preditivo para uma função *"auto complete"*.

**Problema:** Visto que as teclas foram ligeiramente alteradas (mais especificamente, as centrais de cada uma das três regiões), alguns utilizadores referiram que foi mais díficil reconhecer o teclado com um teclado qwerty. Para além disso, notamos que os utilizadores passavam grande parte do tempo a clicar na barra de espaços (pois as teclas de *"auto complete"* não o faziam automaticamente).

### Terceira
O tamanho das teclas centrais, de cada uma das três regiões, foi reduzido (para ser mais fácil reconhecer o teclado), e foi adicionado um espaço automático após a utilização de uma das teclas de *"auto complete"*.

**Problema:** ?
