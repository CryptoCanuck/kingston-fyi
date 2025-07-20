export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Test Page</h1>
      <p className="text-gray-700">If you can see this styled text, Tailwind is working!</p>
      <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
        Test Button
      </button>
    </div>
  );
}