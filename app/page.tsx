export default function Home() {
  return (
    <main>
      <p>Use this project only to test static and agent-based security review.</p>
      <ul>
        <li><a href="/results?q=%3Cimg%20src=x%20onerror=alert(1)%3E">Results page (XSS sink)</a></li>
        <li><a href="/api/users/1001">User API (IDOR)</a></li>
        <li><a href="/api/redirect?to=https://example.com">Redirect API</a></li>
      </ul>
    </main>
  );
}
