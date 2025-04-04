import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex">
        <h1 className="text-5xl font-bold">Treffy</h1>
      </div>
      <div className="my-8 text-center">
        <p className="text-xl">
          Yüksek performanslı video konferans uygulaması
        </p>
      </div>
      <div className="grid gap-6 text-center">
        <Link 
          href="/call" 
          className="group px-5 py-4 transition-all border rounded-lg hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Görüşme Başlat{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Yeni bir P2P video görüşmesi başlatın.
          </p>
        </Link>
      </div>
    </main>
  )
}
