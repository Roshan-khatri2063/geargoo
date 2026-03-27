const ServiceCard = ({ service }) => (
  <div className="bg-white shadow-md rounded-lg p-4 text-center hover:shadow-xl transition">
    <img src={service.image} alt={service.name} className="h-32 w-full object-cover rounded mb-2" />
    <h3 className="font-bold text-lg">{service.name}</h3>
    <p className="text-gray-500 text-sm mt-1">{service.description}</p>
  </div>
);

export default ServiceCard;