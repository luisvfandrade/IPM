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

**Problema:** Dado que os tempos ainda não eram ideais, e que não tivemos muitos comentários de utilizadores, olhámos com atencão e verificámos que no nosso protótipo não é dado qualquer tipo de feedback de que se está a selecionar uma letra, antes da mesma ser inserida na frase, o que pode levar a alguns enganos. Adicionalmente, a partir dos únicos comentários que recebemos, notámos também que não temos feedback sonoro.

### Quarta
No ato do *swipe*, e antes do dedo ser levantado, foi adicionado um genéro de "marcador" que enfatiza a tecla que está a ser selecionada. Para além disso, foram acrescentados sons quando qualquer tecla é premida com sucesso.

**Problema:** Iteração final?
