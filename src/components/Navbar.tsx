export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <ul className="flex gap-4">
        <li><a href="/">Beranda</a></li>
        <li><a href="/about">Tentang</a></li>
        <li><a href="/projects">Proyek</a></li>
      </ul>
    </nav>
  );
}
