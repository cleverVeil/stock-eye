export default function LoadingSpinner() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
        <p className="text-gray-700 font-medium">Loading...</p>
      </div>
    </div>
  );
}
