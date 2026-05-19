import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import TopBar from './layout/TopBar';
import { listApuntes } from '../lib/api';
import { detectSubject } from '../lib/subjects';

export default function Layout() {
  const [counts, setCounts] = useState({});
  const [subjectCounts, setSubjectCounts] = useState({});

  useEffect(() => {
    listApuntes().then((r) => {
      const items = r.items ?? [];
      const ready = items.filter((a) => a.status === 'ready');
      setCounts({
        '/apuntes': items.length,
        '/audios':  ready.length,
      });
      const bySubject = {};
      for (const a of items) {
        const s = detectSubject(a);
        if (s) bySubject[s.id] = (bySubject[s.id] ?? 0) + 1;
      }
      setSubjectCounts(bySubject);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex bg-surface-soft">
      <Sidebar counts={counts} subjectCounts={subjectCounts} onOpenCmdK={() => document.dispatchEvent(new CustomEvent('open-cmdk'))} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}