import { Link } from "wouter";
export default function NotFound() {
  return <div className="rounded-3xl border bg-white p-8 text-center"><h1 className="text-3xl font-black">Page not found</h1><p className="mt-2 text-slate-600">This community thread does not exist.</p><Link href="/" className="mt-5 inline-block rounded-full bg-blue-500 px-5 py-2 font-bold text-white">Return home</Link></div>;
}
