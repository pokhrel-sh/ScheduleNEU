import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 p-4">
      <h3>The data is currently hard coded. The real data will display once I am done with mvc of this project.</h3>
      <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">How it works</h1>

      <div className="space-y-4 max-w-2xl text-lg">
        <h2 className="text-xl font-semibold">
          Step 1:<span className="text-gray-500"> Search for your classes in this format: [CS 1111] (without the bracket)</span>
        </h2>
        <h2 className="text-xl font-semibold">
          Step 2: <span className="text-gray-500">Add the classes you want to your cart</span>
        </h2>
        <h2 className="text-xl font-semibold">
          Step 3: <span className="text-gray-500">Go to your cart and click the <span className="font-bold text-blue-600">Generate Schedule</span> button</span>
        </h2>
        <h2 className="text-xl font-semibold">
          Step 4: <span className="text-gray-500">View your schedule and save it to your calendar</span>
        </h2>
      </div>

      <Link
        to="/search"
        className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
      >
        Continue
      </Link>
    </div>
  );
}

export default LandingPage;
