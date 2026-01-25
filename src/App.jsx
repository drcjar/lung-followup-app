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
      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      {copied ? "Copied!" : "Copy Plan"}
    </button>
  );
}

function generateSchedule(surgeryDateStr, type = "NEL", highRisk = false) {
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
      // Updated to match README: 6,12,18,24,36 (+30 if high risk) then annual to 10y
      months: highRisk
        ? [6, 12, 18, 24, 30, 36, 48, 60, 72, 84, 96, 108, 120]
        : [6, 12, 18, 24, 36, 48, 60, 72, 84, 96, 108, 120],
      types: {
        6: "CT Chest/Abdo",
        12: "CT Chest/Abdo",
        18: "CT Chest/Abdo",
        24: "CT Chest/Abdo",
        30: "CT Chest/Abdo", // high risk only
        36: "CT Chest/Abdo",
        48: "CT Chest/Abdo",
        60: "CT Chest/Abdo",
        72: "CT Chest/Abdo",
        84: "CT Chest/Abdo",
        96: "CT Chest/Abdo",
        108: "CT Chest/Abdo",
        120: "CT Chest/Abdo",
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
  const [nelHighRisk, setNelHighRisk] = useState(false);

  const formattedDate = surgeryDate
    ? new Date(surgeryDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const schedule = surgeryDate
  ? generateSchedule(surgeryDate, scheduleType, nelHighRisk)
  : [];


  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6 space-y-6">
        <h1 className="text-3xl font-bold text-center">Lung Follow-up Planner</h1>

        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Surgery Date</label>
            <input
              type="date"
              value={surgeryDate}
              onChange={(e) => setSurgeryDate(e.target.value)}
              className="border px-3 py-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Follow-up Protocol</label>
            <select
              value={scheduleType}
              onChange={(e) => {
  		const next = e.target.value;
  		setScheduleType(next);
  		if (next !== "NEL") setNelHighRisk(false);
		}}

              className="border px-3 py-2 rounded w-full"
            >

              <option value="NEL">NHS North East London</option>
              <option value="ICL">Imperial College London</option>
            </select>
            {scheduleType === "NEL" && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  id="nelHighRisk"
                  type="checkbox"
                  checked={nelHighRisk}
                  onChange={(e) => setNelHighRisk(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="nelHighRisk" className="text-sm text-gray-800">
                  High risk (e.g. R1/2 resections, PL 1/2 disease, STAS - adds 30-month CT)
                </label>
              </div>
            )}

          </div>
        </div>

        {schedule.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Follow-up Schedule</h2>
            <div className="space-y-2">
              {schedule.map((item, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-100"
                >
                  <p className="font-semibold">{item.label} — {item.type}</p>
                  <p className="text-gray-700">{item.date}</p>
                </div>
              ))}
            </div>

            <CopyPlanButton
              schedule={schedule.map(({ label, type }) => ({ label, type }))}
              surgeryDate={formattedDate}
            />
          </div>
        )}
      </div>
    </div>
  );
}
