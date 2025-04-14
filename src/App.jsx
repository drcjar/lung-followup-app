import { useState } from "react";

function CopyPlanButton({ schedule, surgeryDate }) {
  const [copied, setCopied] = useState(false);

  const formattedText = `Lung cancer post-operative follow-up plan:\n\n${schedule
    .map(item => `• ${item.label}: ${item.type}`)
    .join("\n")}\n\nBased on surgery date: ${surgeryDate}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      onClick={copyToClipboard}
      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      {copied ? "Copied!" : "Copy Plan"}
    </button>
  );
}

function generateSchedule(surgeryDateStr, type = "NEL") {
  const schedules = {
    ICL: {
      months: [3, 6, 9, 12, 18, 24, 36, 48, 60],
      types: {
        3: "CXR",
        6: "CT",
        9: "CXR",
        12: "CT",
        18: "CT",
        24: "CT",
        36: "CT",
        48: "CT",
        60: "CT",
      },
    },
    NEL: {
      months: [1.5, 3, 6, 9, 12, 15, 18, 24, 30, 36, 48, 60],
      types: {
        1.5: "CXR",
        3: "CT Chest",
        6: "CXR",
        9: "CXR",
        12: "CT Chest/Abdo",
        15: "CXR",
        18: "CT Chest/Abdo",
        24: "CT Chest/Abdo",
        30: "CXR",
        36: "CT Chest/Abdo",
        48: "CT Chest/Abdo",
        60: "CT Chest/Abdo",
      },
    },
  };

  const { months, types } = schedules[type];
  const surgeryDate = new Date(surgeryDateStr);
  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return months.map((m) => {
    const followUpDate = new Date(surgeryDate);
    followUpDate.setMonth(surgeryDate.getMonth() + Math.floor(m));
    followUpDate.setDate(surgeryDate.getDate() + Math.round((m % 1) * 30));
    return {
      label: `${m} months`,
      type: types[m],
      date: formatter.format(followUpDate),
    };
  });
}

export default function App() {
  const [surgeryDate, setSurgeryDate] = useState("");
  const [scheduleType, setScheduleType] = useState("NEL");

  const formattedDate = surgeryDate
    ? new Date(surgeryDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const schedule = surgeryDate ? generateSchedule(surgeryDate, scheduleType) : [];

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Lung Follow-up Planner</h1>

      <div className="space-y-2">
        <label className="block font-medium">Surgery Date</label>
        <input
          type="date"
          value={surgeryDate}
          onChange={(e) => setSurgeryDate(e.target.value)}
          className="border px-2 py-1 rounded w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="block font-medium">Follow-up Protocol</label>
        <select
          value={scheduleType}
          onChange={(e) => setScheduleType(e.target.value)}
          className="border px-2 py-1 rounded w-full"
        >
          <option value="NEL">NHS North East London</option>
          <option value="ICL">Imperial College London</option>
        </select>
      </div>

      {schedule.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Follow-up Schedule</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b pb-1">Timepoint</th>
                <th className="border-b pb-1">Imaging</th>
                <th className="border-b pb-1">Date</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-1">{item.label}</td>
                  <td className="py-1">{item.type}</td>
                  <td className="py-1">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <CopyPlanButton
            schedule={schedule.map(({ label, type }) => ({ label, type }))}
            surgeryDate={formattedDate}
          />
        </div>
      )}
    </div>
  );
}

