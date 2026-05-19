import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Greeting from '../components/home/Greeting';
import ForjaComposer from '../components/home/ForjaComposer';
import RecentsRow from '../components/home/RecentsRow';
import StatsGrid from '../components/home/StatsGrid';
import { useApuntes } from '../hooks/useApuntes';
import { forjar } from '../lib/api';

export default function Home() {
  const navigate = useNavigate();
  const { items, loading, refresh } = useApuntes();
  const [submitting, setSubmitting] = useState(false);

  const handleQuickSubmit = async (text) => {
    setSubmitting(true);
    try {
      const r = await forjar({ texts: [text] });
      await refresh();
      navigate(`/apuntes/${r.id}`);
    } catch (e) {
      alert(e.message);
      setSubmitting(false);
    }
  };

  const forgingCount = items.filter((i) => i.status === 'forging').length;

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <Greeting apuntesCount={items.length} forgingCount={forgingCount} />
      <ForjaComposer onQuickSubmit={handleQuickSubmit} submitting={submitting} />
      <RecentsRow items={items} loading={loading} />
      <StatsGrid items={items} />
    </div>
  );
}