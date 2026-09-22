/* eslint-disable react-hooks/rules-of-hooks */
import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { quick_votes, vote_options } from "@/db/schema/quickVote";
import { eq, and } from "drizzle-orm";
import { products } from "@/db/schema/products";
import { brands } from "@/db/schema/brands";
import { testerActivity, testerProfiles } from "@/db/schema/tester";
import { ActivityType, users } from "@/db/schema/users";
import notificationApi from "@/services/notificationApi"; // ⭐ REQUIRED

type VoteOption = {
  label: string;
  value: string;
};

type VoteRequestBody = {
  productId: string;
  selected: string[];
  userId?: string | null;
};

/* ----------------------------- DEFAULT VOTE OPTIONS ---------------------------- */

const DEFAULT_OPTIONS: VoteOption[] = [
  {
    value: "i_already_use_a_similar_product",
    label: "I already use a similar Product",
  },
  {
    value: "i_would_love_to_try_this_product",
    label: "I would love to try this Product",
  },
  { value: "it_is_too_expensive_for_me", label: "It is too expensive for me" },
  {
    value: "not_really_my_type_of_Product",
    label: "Not really my type of Product",
  },
];

/* ----------------------------- GET CUSTOM OPTIONS ---------------------------- */

async function getVoteOptions(productId: string): Promise<VoteOption[]> {
  try {
    const customOptionsRecord = await db
      .select()
      .from(vote_options)
      .where(eq(vote_options.product_id, productId))
      .limit(1);

    if (customOptionsRecord.length > 0 && customOptionsRecord[0].options) {
      const opts = customOptionsRecord[0].options;
      if (Array.isArray(opts) && opts.length > 0) {
        return opts as VoteOption[];
      }
    }
  } catch (error) {
    console.error("Error fetching custom vote options:", error);
  }

  return DEFAULT_OPTIONS;
}



export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");
    const userId = url.searchParams.get("userId");

    // GET OPTIONS + HAS VOTED
    if (productId) {
      const options = await getVoteOptions(productId);

      let hasVoted = false;
      if (userId) {
        const existing = await db
          .select()
          .from(quick_votes)
          .where(
            and(
              eq(quick_votes.product_id, productId),
              eq(quick_votes.user_id, userId)
            )
          );
        hasVoted = existing.length > 0;
      }

      return NextResponse.json({ options, hasVoted });
    }
    if (userId) {
      const votedProducts = await db
        .select({
          voteId: quick_votes.id,
          productId: quick_votes.product_id,
          selectedOptions: quick_votes.selected_options,
          productName: products.name,
          media: products.media,
          price: products.price,
          handle: products.handle,
        })
        .from(quick_votes)
        .leftJoin(products, eq(products.id, quick_votes.product_id))
        .leftJoin(brands, eq(products.brandId, brands.id))
        .leftJoin(users, eq(brands.userId, users.id))
        .where(
          and(eq(quick_votes.user_id, userId), eq(users.status, "active"))
        );

      return NextResponse.json({ votedProducts });
    }

    return NextResponse.json(
      { error: "productId or userId is required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("GET /quickvotes error:", error);
    return NextResponse.json(
      { error: "Failed to load quick votes" },
      { status: 500 }
    );
  }
}



export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const { productId, selected, userId } = body as VoteRequestBody;

    if (!productId || !selected?.length) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    /* ----------------------------- Prevent Duplicate Vote ---------------------------- */
    if (userId) {
      const existing = await db
        .select()
        .from(quick_votes)
        .where(
          and(
            eq(quick_votes.product_id, productId),
            eq(quick_votes.user_id, userId)
          )
        );
      if (existing.length > 0) {
        return NextResponse.json(
          { error: "You already voted for this product" },
          { status: 400 }
        );
      }
    }


    const options = await getVoteOptions(productId);
    const validValues = options.map((o) => o.value);

    for (const sel of selected) {
      if (!validValues.includes(sel)) {
        return NextResponse.json(
          { error: `Invalid vote option: ${sel}` },
          { status: 400 }
        );
      }
    }
    let testerHashId: string | null = null;
    if (userId) {
      try {
        const profile = await db
          .select()
          .from(testerProfiles)
          .where(eq(testerProfiles.userId, userId))
          .limit(1);

        if (profile.length > 0 && profile[0].id) {
          testerHashId = profile[0].id;
        }
      } catch (err) {
        console.error("Failed to fetch tester profile:", err);
      }
    }


    const [inserted] = await db
      .insert(quick_votes)
      .values({
        product_id: productId,
        user_id: userId ?? null,
        selected_options: selected,
      })
      .returning();
    if (testerHashId) {
      try {
        await db.insert(testerActivity).values({
          testerId: testerHashId,
          activityType: "vote" as ActivityType,
          productId,
          details: { selectedOptions: selected },
        });
      } catch (err) {
        console.error("Failed to log tester activity:", err);
      }
    }


    try {
      await notificationApi.createNotification({
        type: "vote",
        title: "Thanks for voting! 🗳️",
        message: "Your feedback has been recorded successfully.",
        recipientId: userId!,
        icon: "⭐",
        link: `/product/${productId}`,
        data: {
          productId,
          selectedOptions: selected,
          voteId: inserted.id,
        },
      });

      console.log("✅ Vote notification sent to:", userId);
    } catch (notifErr) {
      console.error("❌ Failed to send vote notification:", notifErr);
    }
    const stats = await computeStats(productId);

    return NextResponse.json({ ok: true, vote: inserted, stats });
  } catch (error) {
    console.error("POST /quickvotes error:", error);
    return NextResponse.json(
      { error: "Failed to submit vote" },
      { status: 500 }
    );
  }
}

async function computeStats(productId: string) {
  try {
    const votes = await db
      .select()
      .from(quick_votes)
      .where(eq(quick_votes.product_id, productId));

    const counts: Record<string, number> = {};

    for (const v of votes) {
      const arr = Array.isArray(v.selected_options) ? v.selected_options : [];
      for (const opt of arr) {
        counts[opt] = (counts[opt] || 0) + 1;
      }
    }

    return counts;
  } catch (error) {
    console.error("Error computing stats:", error);
    return {};
  }
}
