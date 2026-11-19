type Props = { searchParams: { q?: string } };

export default function ResultsPage({ searchParams }: Props) {
  const query = searchParams.q || "nothing";

  // INTENTIONAL VULNERABILITY: untrusted URL input is inserted as raw HTML.
  const html = `<p>You searched for: ${query}</p>`;

  return (
    <main>
      <h2>Search results</h2>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
