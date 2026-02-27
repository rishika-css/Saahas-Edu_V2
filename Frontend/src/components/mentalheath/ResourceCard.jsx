export default function ResourceCard({ title, description, link, icon }) {
    return (
      <div className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition cursor-pointer">
        <span className="text-3xl">{icon}</span>
        <div>
          <h4 className="font-semibold text-gray-800 text-sm">{title}</h4>
          <p className="text-gray-500 text-xs mt-1">{description}</p>
        </div>
      </div>
    )
  }