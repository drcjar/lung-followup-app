import { useState } from 'react';
import { format, addMonths, addYears } from 'date-fns';

function LungFollowUpApp() {
  const [surgeryDate, setSurgeryDate] = useState('');
  const [scanSchedule, setScanSchedule] = useState([]);

  const generateSchedule = () => {
    const baseDate = new Date(surgeryDate);
    const schedule = [
      { label: '3 months', type: 'CXR', date: addMonths(baseDate, 3) },
      { label: '6 months', type: 'CT', date: addMonths(baseDate, 6) },
      { label: '9 months', type: 'CXR', date: addMonths(baseDate, 9) },
      { label: '12 months', type: 'CT', date: addMonths(baseDate, 12) },
      { label: '18 months', type: 'CT', date: addMonths(baseDate, 18) },
      { label: '24 months', type: 'CT', date: addMonths(baseDate, 24) },
      { label: 'Year 3', type: 'CT', date: addYears(baseDate, 3) },
      { label: 'Year 4', type: 'CT', date: addYears(baseDate, 4) },
      { label: 'Year 5', type: 'CT', date: addYears(baseDate, 5) },
    ];
    setScanSchedule(schedule);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Lung Cancer Surgery Follow-Up Planner</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <input
          type="date"
          value={surgeryDate}
          onChange={(e) => setSurgeryDate(e.target.value)}
          style={{ padding: '0.5rem', flex: '1' }}
        />
        <button onClick={generateSchedule} style={{ padding: '0.5rem 1rem' }}>Generate</button>
      </div>

      {scanSchedule.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          {scanSchedule.map((item, idx) => (
            <div key={idx} style={{ border: '1px solid #ccc', borderRadius: '0.5rem', padding: '1rem', marginBottom: '0.5rem' }}>
              <p style={{ fontWeight: 'bold' }}>{item.label} — {item.type}</p>
              <p>{format(item.date, 'PPP')}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <a
          href="https://github.com/drcjar/lung-followup-app"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#0366d6', textDecoration: 'underline' }}
        >
          View on GitHub
        </a>
      </div>
    </div>
  );
}

export default LungFollowUpApp;

