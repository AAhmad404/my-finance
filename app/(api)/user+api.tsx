import { neon } from "@neondatabase/serverless";
import { Asset } from "@/types/type";

// Helper function to delete user from Clerk using REST API
async function deleteClerkUser(clerkId: string): Promise<boolean> {
  try {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      return false;
    }

    const response = await fetch(`https://api.clerk.dev/v1/users/${clerkId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const url = new URL(request.url);
    const clerkId = url.searchParams.get('clerkId');

    if (!clerkId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: clerkId is required" }),
        { status: 400 },
      );
    }

    const response = await sql`
      SELECT * FROM users WHERE clerk_id = ${clerkId};
    `;

    return new Response(JSON.stringify({ data: response[0] || null }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { email, clerkId } = await request.json();

    if (!clerkId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: clerkId is required" }),
        { status: 400 },
      );
    }

    // Upsert: create a row if it doesn't exist, otherwise keep or update values
    const response = await sql`
      INSERT INTO users (email, clerk_id, created_at)
      VALUES (${email ?? null}, ${clerkId}, NOW())
      ON CONFLICT (clerk_id) DO UPDATE
      SET
        email = COALESCE(EXCLUDED.email, users.email)
      RETURNING *;
    `;

    return new Response(JSON.stringify({ data: response }), {
      status: 201,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

export async function PUT(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { clerkId, assets } = await request.json();

    if (!clerkId || !assets) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 },
      );
    }

    const assetsString = JSON.stringify(assets);

    // First ensure the user exists, then update assets
    // Try to update existing user first
    const updateResponse = await sql`
      UPDATE users 
      SET assets = ${assetsString}::jsonb
      WHERE clerk_id = ${clerkId}
      RETURNING *;
    `;

    if (updateResponse.length === 0) {
      // User doesn't exist, create with default values
      const insertResponse = await sql`
        INSERT INTO users (clerk_id, email, assets, created_at)
        VALUES (${clerkId}, NULL, ${assetsString}::jsonb, NOW())
        RETURNING *;
      `;
      return new Response(JSON.stringify({ data: insertResponse }), {
        status: 201,
      });
    }

    return new Response(JSON.stringify({ data: updateResponse }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

export async function DELETE(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { clerkId } = await request.json();

    if (!clerkId) {
      return new Response(JSON.stringify({ error: "Missing required fields: clerkId" }), {
        status: 400,
      });
    }

    // Delete user from both Clerk and local database
    const clerkDeleted = await deleteClerkUser(clerkId);
    
    if (!clerkDeleted) {
      // Note: Failed to delete from Clerk, but proceeding with local deletion
    }

    // Delete from local database
    const response = await sql`
      DELETE FROM users WHERE clerk_id = ${clerkId};
    `;

    return new Response(JSON.stringify({ 
      data: response,
      message: clerkDeleted 
        ? "User successfully deleted from both Clerk and database" 
        : "User deleted from database, but Clerk deletion may have failed"
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
