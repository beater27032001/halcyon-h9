import { BENCHMARKS } from '@domain/gpu'
import { BenchRow } from '@molecules/BenchRow'
import { SectionHeading } from '@molecules/SectionHeading'

export function Benchmarks() {
  return (
    <section className="border-t border-line py-20 md:py-[120px]">
      <div className="wrap">
        <SectionHeading
          eyebrow="Desempenho"
          title="H9 contra a geração anterior"
        />
        <div className="mt-2 flex flex-col gap-7">
          {BENCHMARKS.map((bench) => (
            <BenchRow key={bench.name} bench={bench} />
          ))}
        </div>
        <p className="mt-7 font-mono text-[11px] text-muted">
          Valores ilustrativos de um produto fictício. Média de quadros por
          segundo; render de IA em iterações por segundo.
        </p>
      </div>
    </section>
  )
}
