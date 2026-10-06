/** Bandeau de titre des pages publiques */
export default function PageHero({ kicker, title, text, image }: { kicker: string; title: string; text?: string; image?: string }) {
  return (
    <section className="relative overflow-hidden bg-primary-400">
      {image && <img src={image} alt="" className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-40 md:block" style={{ maskImage: "linear-gradient(to right, transparent, black 60%)" }} />}
      <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
        <p className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-accent-400"><span className="h-px w-10 bg-accent-400" /> {kicker}</p>
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight text-white md:text-5xl">{title}</h1>
        {text && <p className="mt-4 max-w-xl text-lg text-slate-300">{text}</p>}
      </div>
    </section>
  );
}
