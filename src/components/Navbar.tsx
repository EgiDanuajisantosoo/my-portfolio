export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 fixed top-0 left-0 w-full z-50">
      <ul className="flex justify-center gap-4 w-full">
        <li><a href="/">Beranda</a></li>
        <li><a href="/tentang">Tentang</a></li>
        <li><a href="/projects">Proyek</a></li>
      </ul>
    </nav>
  );
}
