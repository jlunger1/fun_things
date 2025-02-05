import { useRouter } from "next/navigation";
import { MdAccessible } from "react-icons/md";
import { FaPaw } from "react-icons/fa";

interface Activity {
  id: number;
  title: string;
  image_url?: string;
  pets_allowed?: boolean;
  accessibility?: boolean;
}

export default function MiniActivityCard({ activity }: { activity: Activity }) {


  return (
    <div
      className="cursor-pointer relative w-full max-w-3xl rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition"
    >
      {/* Image */}
      <div className="relative w-full aspect-[9/9] h-auto">
        {activity.image_url ? (
          <img src={activity.image_url} alt={activity.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
            No Image Available
          </div>
        )}

        {/* Accessibility & Pets Icons */}
        {(activity.pets_allowed || activity.accessibility) && (
          <div className="absolute top-4 left-4 flex gap-3 text-white drop-shadow-lg z-20">
            {activity.pets_allowed && <FaPaw className="text-3xl" />}
            {activity.accessibility && <MdAccessible className="text-3xl" />}
          </div>
        )}

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 z-20">
          <h3 className="text-white text-xl font-bold">{activity.title}</h3>
        </div>
      </div>
    </div>
  );
}
