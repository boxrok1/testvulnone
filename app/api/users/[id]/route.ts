import { NextResponse } from "next/server";

const users = [
  { id: "1001", name: "Demo Alice", email: "alice@example.invalid", privateNote: "internal-demo-note" },
  { id: "1002", name: "Demo Bob", email: "bob@example.invalid", privateNote: "another-internal-note" }
];

export async function GET(_request: Request, context: { params: { id: string } }) {
  // INTENTIONAL VULNERABILITY: no authentication or ownership check.
  // Any caller can request another user's record by changing the ID.
  const user = users.find((entry) => entry.id === context.params.id);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}
