import { Calendar, Clock, TrendingUp } from 'lucide-react';

// Mock news data
const mockNews = [
  {
    id: '1',
    title: 'New Italian Restaurant Opens Downtown Kingston',
    excerpt: 'Atomica brings authentic Italian cuisine and an extensive wine selection to the heart of downtown Kingston.',
    category: 'New Opening',
    date: '2024-12-15',
    readTime: '3 min read',
    featured: true,
  },
  {
    id: '2',
    title: 'Kingston Food Festival Returns This Summer',
    excerpt: 'The annual celebration of local cuisine will feature over 50 restaurants and food vendors from across the region.',
    category: 'Events',
    date: '2024-12-10',
    readTime: '4 min read',
    featured: true,
  },
  {
    id: '3',
    title: 'Local Chef Wins Provincial Competition',
    excerpt: 'Chef Sarah Chen from Chez Piggy takes home top honors at the Ontario Culinary Championships.',
    category: 'Awards',
    date: '2024-12-08',
    readTime: '2 min read',
    featured: false,
  },
  {
    id: '4',
    title: 'Farm-to-Table Movement Growing in Kingston',
    excerpt: 'More restaurants are partnering with local farms to bring fresh, seasonal ingredients to their menus.',
    category: 'Trends',
    date: '2024-12-05',
    readTime: '5 min read',
    featured: false,
  },
];

export default function NewsPage() {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurant News</h1>
          <p className="text-gray-600">
            Stay updated with the latest happenings in Kingston&apos;s culinary scene
          </p>
        </div>

        {/* Featured Articles */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Stories</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {mockNews.filter(article => article.featured).map((article) => (
              <article key={article.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Placeholder for article image */}
                <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <TrendingUp className="h-16 w-16 text-blue-400" />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-500">{article.readTime}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                    <a href="#">{article.title}</a>
                  </h3>
                  
                  <p className="text-gray-600 mb-4">{article.excerpt}</p>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    <time dateTime={article.date}>
                      {new Date(article.date).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </time>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Recent Articles */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Articles</h2>
          <div className="space-y-4">
            {mockNews.filter(article => !article.featured).map((article) => (
              <article key={article.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {article.category}
                      </span>
                      <span className="text-xs text-gray-500">{article.readTime}</span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                      <a href="#">{article.title}</a>
                    </h3>
                    
                    <p className="text-gray-600 mb-3">{article.excerpt}</p>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <time dateTime={article.date}>
                        {new Date(article.date).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </time>
                    </div>
                  </div>
                  
                  {/* Placeholder for article thumbnail */}
                  <div className="ml-6 w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="mt-12 bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Stay in the Loop</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Get the latest restaurant news, reviews, and exclusive offers delivered to your inbox weekly.
          </p>
          <form className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}