export default function ProblemSection() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 px-8 md:px-16 py-16">
      <h2 className="text-2xl md:text-3xl font-bold font-sans leading-snug text-black">
        AI is leaving non-English speakers behind.
      </h2>
      <p className="text-base md:text-lg font-sans leading-relaxed text-black/80">
        AI can only benefit the world if it benefits{" "}
        <em className="font-serif italic">everybody</em>. Current LLMs are
        trained heavily on English-language data, and underperform significantly
        for the billions of non-English speakers who need it. Babel bridges this
        divide by uplifting the performance of LLMs on non-English prompts.
      </p>
    </section>
  );
}
