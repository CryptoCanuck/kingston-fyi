import { Calendar, Clock, MapPin, Users } from 'lucide-react';

const mockEvents = [
  {
    id: 1,
    title: "Kingston Music Festival",
    date: "2024-07-15",
    time: "6:00 PM",
    location: "Market Square",
    category: "Music",
    description: "Annual summer music festival featuring local bands",
    attendees: 500,
    image: "🎵"
  },
  {
    id: 2,
    title: "Farmers Market",
    date: "2024-07-20",
    time: "8:00 AM",
    location: "Springer Market Square",
    category: "Market",
    description: "Fresh local produce and artisan goods",
    attendees: 200,
    image: "🥕"
  },
  {
    id: 3,
    title: "Art Gallery Opening",
    date: "2024-07-22",
    time: "7:00 PM",
    location: "Agnes Etherington Art Centre",
    category: "Art",
    description: "New contemporary art exhibition opening",
    attendees: 150,
    image: "🎨"
  },
];

export default function EventsPage() {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="heading-1 text-gradient-indigo-purple mb-4">
            Kingston Events
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Discover what&apos;s happening in Kingston. From festivals to markets, find events that bring our community together.
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockEvents.map((event) => (
            <div key={event.id} className="card card-hover">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{event.image}</div>
                  <span className="text-xs px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                    {event.category}
                  </span>
                </div>
                
                <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                <p className="text-sm text-muted mb-4">{event.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-muted">
                    <Clock className="h-4 w-4 mr-2" />
                    {event.time}
                  </div>
                  <div className="flex items-center text-muted">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-muted">
                    <Users className="h-4 w-4 mr-2" />
                    {event.attendees} interested
                  </div>
                </div>
                
                <button className="btn-primary w-full mt-4">
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}