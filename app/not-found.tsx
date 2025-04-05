import { redirect } from "next/navigation";

export default function NotFound() {
  redirect("/"); // Redirects users to the homepage if the route does not exist
  return null; // This prevents rendering anything before redirection
}
