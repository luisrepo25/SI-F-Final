
const SubscriptionTestimonials: React.FC = () => {
  const testimonios = [
    {
      nombre: "María González",
      empresa: "EcoTours Costa Rica",
      plan: "Plan Profesional",
      texto: "Desde que implementamos el Plan Profesional, nuestras reservas aumentaron un 150%. La visibilidad que obtenemos es increíble.",
      calificación: 5
    },
    {
      nombre: "Carlos Rodríguez",
      empresa: "Aventuras Andinas",
      plan: "Plan Premium",
      texto: "El soporte 24/7 y los reportes personalizados nos han permitido optimizar nuestras operaciones. Totalmente recomendado.",
      calificación: 5
    },
    {
      nombre: "Ana Martínez",
      empresa: "Paraíso Caribeño Tours",
      plan: "Plan Anual Élite",
      texto: "La consultoría de marketing incluida en el plan Élite transformó nuestro negocio. Ahora tenemos presencia internacional.",
      calificación: 5
    }
  ];

  const renderEstrellas = (calificación: number) => {
    return (
      <div className="flex justify-center space-x-1">
        {[...Array(5)].map((_, índice) => (
          <svg
            key={índice}
            className={`w-5 h-5 ${índice < calificación ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-8 mb-8">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
        Lo que Dicen Nuestros Proveedores
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonios.map((testimonio, índice) => (
          <div key={índice} className="bg-white rounded-lg shadow-md p-6">
            {renderEstrellas(testimonio.calificación)}
            <p className="text-gray-600 italic my-4">{testimonio.texto}</p>
            <div className="border-t pt-4">
              <p className="font-semibold text-gray-900">{testimonio.nombre}</p>
              <p className="text-sm text-gray-500">{testimonio.empresa}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {testimonio.plan}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionTestimonials;