import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function ProtectedPage() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const [content, setContent] = useState();
  console.log({ status });

  // Fetch content from protected route
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/examples/jwt");
      const json = await res.json();
      console.log({ json });
      if (json.sub) {
        setContent(json.sub);
      }
    };
    fetchData();
  }, [session]);

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && loading) return null;

  // If no session exists, display access denied message
  if (!session) {
    return <div>Access Denied</div>;
  } else {
    // If session exists, display content
    return (
      <>
        <h1>Protected Page</h1>
        <p>
          <strong>{content ?? "\u00a0"}</strong>
        </p>
      </>
    );
  }
}
