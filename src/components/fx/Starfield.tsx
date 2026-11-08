import ParticleField from "./ParticleField";

/** Deep midnight sky with a soft milky-way band and twinkling stars. */
export default function Starfield({ dense = 110 }: { dense?: number }) {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_10%,#2b1a40_0%,#170d24_45%,#07040b_100%)]" />
      <div
        className="absolute left-[-30%] top-[10%] h-[45%] w-[160%] rotate-[-24deg] opacity-50"
        style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(185,165,209,0.35), rgba(232,167,182,0.12) 45%, transparent 75%)", filter: "blur(20px)" }}
      />
      <ParticleField variant="stars" count={dense} />
    </>
  );
}
