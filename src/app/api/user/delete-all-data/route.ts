// import { db } from "@/db/db";
// import { authOptions } from "@/libs/auth/auth";
// import { getServerSession } from "next-auth";
// import { NextRequest, NextResponse } from "next/server";

import { NextRequest } from "next/server";

// export async function DELETE(req: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     const { userId } = await req.json();

//     if (!session?.user?.id || userId !== session.user.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Start transaction to delete all user data
//     await db.$transaction(async (tx) => {
//       // Delete related records first
//       await tx.testerProfile.deleteMany({ where: { userId } });
//       await tx.brandProfile.deleteMany({ where: { userId } });
//       await tx.userSettings.deleteMany({ where: { userId } });
//       await tx.sampleRequest.deleteMany({ where: { testerId: userId } });

//       // Finally delete user
//       await tx.user.delete({ where: { id: userId } });
//     });

//     return NextResponse.json(
//       { success: true, message: "All data deleted successfully" },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error deleting data:", error);
//     return NextResponse.json(
//       { error: "Failed to delete data" },
//       { status: 500 }
//     );
//   }
// }


export async function DELETE(req: NextRequest) {
try {
}
catch {
  
}
}