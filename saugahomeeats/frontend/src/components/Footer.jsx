// Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-navy/5 border-t border-border mt-auto py-8">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="font-serif text-navy font-semibold text-lg mb-1">🍱 SaugaHomeEats</p>
        <p className="text-text-muted text-sm">
          Connecting Mississauga's home cooks with their neighbours.
        </p>
        <p className="text-text-muted text-xs mt-3">
          © {new Date().getFullYear()} SaugaHomeEats · MGMT8155 Capstone Project
        </p>
      </div>
    </footer>
  );
}
