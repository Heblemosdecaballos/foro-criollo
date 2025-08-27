import Link from "next/link";
import { Eye, MessageSquare } from "lucide-react";

type Profile = { id: string; username: string | null; full_name: string | null; avatar_url: string | null };
type Thread = {
  id: string;
  slug?: string | null;
  title: string;
  content: string;
  created_at: string;
  author_id: string | null;
  views: number;
  posts_count: number;
};

export default function ThreadCard({ thread, profile }: { thread: Thread; profile?: Profile | null }) {
  const authorName = profile?.username || profile?.full_name || "Usuario";
  const preview = thread.content?.slice(0, 140) || "";
  const href = `/foros/${thread.slug ?? thread.id}`;

  return (
    <li className="rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition">
      <Link href={href} className="block">
        <h3 className="text-lg font-semibold mb-1 line-clamp-2">{thread.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{preview}</p>
      </Link>
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={authorName} className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-gray-200" />
          )}
          <span className="truncate max-w-[140px]">Por {authorName}</span>
          <span>•</span>
          <span>{new Date(thread.created_at).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1"><Eye className="w-4 h-4" /> {thread.views}</span>
          <span className="inline-flex items-center gap-1"><MessageSquare className="w-4 h-4" /> {thread.posts_count}</span>
        </div>
      </div>
    </li>
  );
}
