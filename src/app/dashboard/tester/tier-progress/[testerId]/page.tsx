import TierProgress from "@/components/dashboard/tester/TierProgress";
import { userService } from "@/services/users.service";

export default async function TesterDashboard({
  params,
}: {
  params: Promise<{ testerId: string }>;
}) {

  const { testerId } = await params;

  const result = await userService.getUser(testerId, "id");
  const user = result?.user;
console.log(user,"user in tier page");
  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-red-500">User not found.</p>
      </div>
    );
  }

  const testerProfile = user.testerProfile;
  if (!testerProfile) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-red-500 font-medium">Tester profile not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* <TierProgress
        testerId={testerProfile.id}
        currentTier={testerProfile.testerTier}
      /> */}
    </div>
  );
}
