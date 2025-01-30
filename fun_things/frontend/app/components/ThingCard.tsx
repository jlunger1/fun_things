export default function ThingCard({ thing }) {
  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-4 flex flex-col items-center">
      {/* Image - Ensure full visibility */}
      {thing.image_url ? (
        <img
          src={thing.image_url}
          alt={thing.title}
          className="w-full max-h-64 object-contain rounded-md"
        />
      ) : (
        <div className="w-full h-64 bg-gray-300 rounded-md flex items-center justify-center text-gray-500">
          No Image Available
        </div>
      )}

      {/* Title - Clickable Link */}
      <h2 className="text-xl font-bold mt-3 text-center">
        <a
          href={thing.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {thing.title}
        </a>
      </h2>

      {/* Location */}
      {thing.location && (
        <p className="text-gray-500 text-sm mt-1">
          📍 <strong>Location:</strong> {thing.location}
        </p>
      )}

      {/* Age Recommendation */}
      {thing.age_recommendation && (
        <p className="text-gray-500 text-sm mt-1">
          👶 <strong>Recommended Age:</strong> {thing.age_recommendation}
        </p>
      )}

      {/* Accessibility */}
      {thing.accessibility && (
        <p className="text-gray-500 text-sm mt-1">
          ♿ <strong>Accessibility:</strong> {thing.accessibility}
        </p>
      )}

      {/* Pets Allowed */}
      <p className="text-gray-500 text-sm mt-1">
        🐾 <strong>Pets Allowed:</strong> {thing.pets_allowed ? "Yes" : "No"}
      </p>

      {/* Description */}
      <p className="text-gray-600 mt-3 text-center">{thing.description}</p>

      {/* Tags & Topics */}
      <div className="mt-2 flex flex-wrap gap-2 justify-center">
        {thing.activities?.map((activity) => (
          <span key={activity} className="bg-green-100 text-green-700 text-sm px-2 py-1 rounded-lg">
            {activity}
          </span>
        ))}
        {thing.topics?.map((topic) => (
          <span key={topic} className="bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded-lg">
            {topic}
          </span>
        ))}
      </div>
    </div>
  );
}
