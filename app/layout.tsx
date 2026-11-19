import React from "react";

export const metadata = {
  title: "Security Review Lab",
  description: "Intentionally vulnerable test application"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", margin: 40 }}>
        <h1>Security Review Lab</h1>
        <p>Intentionally vulnerable demo. Do not deploy publicly.</p>
        {children}
      </body>
    </html>
  );
}
