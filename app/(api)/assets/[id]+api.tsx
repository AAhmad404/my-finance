import { neon } from "@neondatabase/serverless";
import { Asset } from "@/types/type";

export async function GET(
  request: Request,
  context: { id?: string }, // Adjusted type definition based on logs
) {
  const clerkId = context?.id;

  // Check if `clerkId` is present
  if (!clerkId) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const response = await sql`
      SELECT assets FROM users
      WHERE clerk_id = ${clerkId};
    `;

    // If no row found, return an empty assets list for client convenience
    if (!response || response.length === 0) {
      return new Response(JSON.stringify({ data: [{ assets: [] }] }), {
        status: 200,
      });
    }

    return new Response(JSON.stringify({ data: response }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
