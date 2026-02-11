export function ComponentsArticle() {
  return (
    <div>
      <div className="bg-gradient-to-r from-[#101012] to-[rgba(0,200,255,0.25)] p-6 lg:h-64 h-56 flex flex-col justify-center items-center">
        <div className="text-center">
          <span className="text-lg">Modulo 1</span>
          <h1 className="text-3xl">Fundamentos do ReactJS</h1>
        </div>
      </div>

      <div className="flex justify-center items-center mt-6">
        <div className="max-w-5xl p-4">
          <p className="text-base tracking-[0.6px] pb-6 leading-relaxed">
            O{" "}
            <span className="font-bold bg-blue-gradient-500 bg-clip-text text-transparent">
              React.JS
            </span>{" "}
            é uma biblioteca JavaScript criada pelo Facebook em 2013 para
            facilitar o desenvolvimento de interfaces de usuário (UI). Seu
            principal objetivo é tornar a construção de aplicações web mais
            eficiente e modular, permitindo que os desenvolvedores criem
            componentes reutilizáveis e de fácil manutenção.
          </p>
          <p className="text-base tracking-[0.6px] pb-6 leading-relaxed">
            Antes do React, o desenvolvimento web era frequentemente realizado
            com <strong>HTML, CSS e JavaScript puro</strong>, ou utilizando
            bibliotecas como jQuery para manipulação do DOM. No entanto,
            conforme as aplicações web se tornaram mais complexas e dinâmicas,
            essa abordagem começou a apresentar desafios, como a dificuldade de
            gerenciar o estado da aplicação e manter o código organizado.
          </p>
          <p className="text-base tracking-[0.6px] pb-6 leading-relaxed">
            O React surgiu como uma solução inovadora para esses problemas,
            introduzindo um modelo de programação baseado em{" "}
            <strong>componentes</strong> e um conceito chamado{" "}
            <strong>Virtual DOM</strong>.
          </p>

          <span className="font-bold bg-blue-gradient-500 bg-clip-text text-transparent text-xl">
            O Que Torna o React Especial?
          </span>

          <h4 className="text-lg font-medium pb-2 mt-6">1. Componentização</h4>
          <p className="text-base tracking-[0.6px] pb-4 leading-relaxed">
            Uma das maiores vantagens do React é sua abordagem baseada em{" "}
            <strong>componentes reutilizáveis</strong>. Em vez de escrever
            grandes blocos de código HTML e JavaScript, os desenvolvedores podem
            dividir a interface da aplicação em pequenas partes independentes,
            chamadas <strong>componentes</strong>.
          </p>

          <h4 className="text-lg font-medium pb-2">2. Virtual DOM</h4>
          <p className="text-base tracking-[0.6px] pb-4 leading-relaxed">
            O React usa um <strong>Virtual DOM</strong>, uma versão otimizada do
            DOM real. Em vez de modificar diretamente o DOM, o React compara as
            mudanças e faz apenas as atualizações necessárias, tornando a
            aplicação mais rápida e eficiente.
          </p>

          <h4 className="text-lg font-medium pb-2">
            3. Declaração e Reatividade
          </h4>
          <p className="text-base tracking-[0.6px] pb-4 leading-relaxed">
            No React, a construção de interfaces segue uma abordagem{" "}
            <strong>declarativa</strong>. Isso significa que os desenvolvedores
            descrevem o que deve ser exibido com base no estado da aplicação, e
            o React se encarrega de atualizar a interface automaticamente.
          </p>

          <h3 className="text-xl font-semibold pb-3">Conclusão</h3>
          <p className="text-base tracking-[0.6px] pb-6 leading-relaxed">
            O React revolucionou a forma como interfaces web são construídas,
            trazendo mais eficiência, modularidade e desempenho. Seu ecossistema
            continua evoluindo, tornando-se uma das principais escolhas para
            desenvolvedores que buscam criar aplicações modernas e escaláveis.
          </p>
          <p className="text-base tracking-[0.6px] pb-6 leading-relaxed">
            Se você deseja aprender React, comece pelos conceitos básicos, como{" "}
            <strong>componentes, estado e propriedades (props)</strong>. Depois,
            explore funcionalidades mais avançadas, como{" "}
            <strong>hooks, roteamento e gerenciamento de estado</strong>. Com
            dedicação e prática, você poderá criar aplicações robustas e
            interativas de forma mais eficiente. 🚀
          </p>
        </div>
      </div>
    </div>
  );
}
