export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-3">Access Denied</h1>
      <p>You don&apos;t have permission to access this page.</p>
    </div>
  );
}
