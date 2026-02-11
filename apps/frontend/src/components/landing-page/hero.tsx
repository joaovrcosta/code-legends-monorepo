import Link from "next/link";

export default function Hero() {
  return (
    <div className="relative w-full lg:min-h-[70vh] min-h-[40vh] overflow-hidden">
      {/* 🎥 Vídeo de fundo */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover z-[-1] opacity-25"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/videos/intro-code-legends.mp4" type="video/mp4" />
        Seu navegador não suporta vídeos em HTML5.
      </video>

      {/* 📄 Conteúdo centralizado vertical e horizontalmente */}
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <div className="relative flex flex-col items-center text-white text-center space-y-8 z-10 max-w-[1000px] lg:mt-0 mt-12">
          <h1 className="lg:text-5xl text-3xl">
            Impossível não ser{" "}
            <span className="font-bold bg-blue-gradient-500 bg-clip-text text-transparent">
              lendário
            </span>
          </h1>
          <div className="max-w-[756px]">
            <p className="lg:text-xl text-[14px] text-[#c4c4cc]">
              Se torne um dos profissionais mais disputados no mundo da
              programação com os cursos completos e didáticos do Code Legends.
            </p>
          </div>
          <button className="lg:max-w-[240px] h-[52px] rounded-full px-4 flex items-center justify-center gap-3 bg-blue-gradient-second w-full shadow-xl">
            <Link href="/learn">
              <span className="text-[#ffffff] font-semibold">PRÉ-VENDA</span>
            </Link>

            {/* <div className="flex items-center justify-center bg-[#2b2b2b] p-3 rounded-full bg-blue-gradient-800"> */}
            {/* <ArrowRight size={24} /> */}
            {/* </div> */}
            {/* <ChevronRight /> */}
          </button>
        </div>
      </div>
    </div>
  );
}
