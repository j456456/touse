export default function ComparisonSection() {
  return (
    <section className="px-8 md:px-16 py-20">
      <h2 className="text-2xl md:text-3xl font-bold font-sans text-center mb-12 text-black">
        The Problem with Current LLMs
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 border border-black/5">
          <h3 className="text-lg font-semibold font-sans mb-4 text-black">
            Raw Prompt
          </h3>
          <div className="h-48 flex items-center justify-center rounded-xl bg-parchment/60 border border-dashed border-black/10">
            <span className="text-sm text-black/30 font-sans">
              Coming soon
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 border border-black/5">
          <h3 className="text-lg font-semibold font-sans mb-4 text-black">
            Raw prompt, translated into English, and output translated back into
            original language
          </h3>
          <div className="h-48 flex items-center justify-center rounded-xl bg-parchment/60 border border-dashed border-black/10">
            <span className="text-sm text-black/30 font-sans">
              Coming soon
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
