export default function PagoCancelado() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="flex items-center justify-center mb-4">
          <span className="text-4xl text-red-600">❌</span>
        </div>
        <h1 className="text-2xl font-bold mb-2 text-red-700">Pago cancelado o fallido</h1>
        <p className="mb-4 text-gray-700">No se pudo completar el pago. Puedes intentarlo de nuevo o contactar soporte si el problema persiste.</p>
        <div className="flex flex-col gap-2 mt-6">
          <a href="/paquetes" className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition">Volver a paquetes</a>
          <a href="/contacto" className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition">Contactar soporte</a>
        </div>
      </div>
    </div>
  );
}
