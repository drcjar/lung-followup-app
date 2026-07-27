import { useRef, useState } from "react";

// The native date input renders in the browser's own locale, so a UK user on a
// US-configured browser sees mm/dd/yyyy. These helpers back a plain text field
// that is always dd/mm/yyyy, while state stays on ISO yyyy-mm-dd.

// Keeps the digits only and re-inserts the separators as the user types.
// A separator is only added once a digit follows it, so backspace never sticks.
function maskUkDate(input) {
  const digits = input.replace(/\D/g, "").slice(0, 8);

  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter((part) => part !== "")
    .join("/");
}

// "15/03/2026" -> "2026-03-15", or "" if incomplete or not a real date.
function ukDateToIso(text) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!match) return "";

  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm);

  if (month < 1 || month > 12 || day < 1) return "";

  const daysInMonth = new Date(Number(yyyy), month, 0).getDate();
  if (day > daysInMonth) return "";

  return `${yyyy}-${mm}-${dd}`;
}

// "2026-03-15" -> "15/03/2026"
function isoToUkDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);

  return match ? `${match[3]}/${match[2]}/${match[1]}` : "";
}

function CopyPlanButton({ schedule, surgeryDate }) {
  const [copied, setCopied] = useState(false);

  const formattedText = `Lung cancer post-operative follow-up plan:\n\n${schedule
    .map(
      (item) => `• ${item.label} (${item.date}): ${item.type}`
    )
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
      months: highRisk
        ? [6, 12, 18, 24, 30, 36, 48, 60, 72, 84, 96, 108, 120]
        : [6, 12, 18, 24, 36, 48, 60, 72, 84, 96, 108, 120],
      types: {
        6: "CT Chest/Abdo",
        12: "CT Chest/Abdo",
        18: "CT Chest/Abdo",
        24: "CT Chest/Abdo",
        30: "CT Chest/Abdo",
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
    followUpDate.setDate(
      surgeryDate.getDate() + Math.round((m % 1) * 30)
    );

    return {
      label: `${m} months`,
      type: types[m],
      date: formatter.format(followUpDate),
    };
  });
}

export default function App() {
  // surgeryDate is ISO yyyy-mm-dd ("" while incomplete); dateText is what the
  // user sees and types, always dd/mm/yyyy.
  const [surgeryDate, setSurgeryDate] = useState("");
  const [dateText, setDateText] = useState("");
  const [dateTouched, setDateTouched] = useState(false);
  const [scheduleType, setScheduleType] = useState("NEL");
  const [nelHighRisk, setNelHighRisk] = useState(false);

  const pickerRef = useRef(null);

  const handleDateTextChange = (e) => {
    const text = maskUkDate(e.target.value);
    setDateText(text);
    setSurgeryDate(ukDateToIso(text));
  };

  const handlePickerChange = (e) => {
    const iso = e.target.value;
    setSurgeryDate(iso);
    setDateText(isoToUkDate(iso));
    setDateTouched(true);
  };

  const openPicker = () => {
    const picker = pickerRef.current;
    if (!picker) return;

    if (typeof picker.showPicker === "function") {
      try {
        picker.showPicker();
        return;
      } catch {
        // Older or restrictive browsers: fall back to focusing the input,
        // the text field above still accepts a typed date either way.
      }
    }

    picker.focus();
  };

  const dateInvalid = dateTouched && dateText !== "" && !surgeryDate;

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
        <h1 className="text-3xl font-bold text-center">
          Lung Follow-up Planner
        </h1>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="surgeryDate"
              className="block font-medium mb-1"
            >
              Surgery Date
            </label>
            <div className="flex">
              <input
                id="surgeryDate"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="dd/mm/yyyy"
                value={dateText}
                onChange={handleDateTextChange}
                onBlur={() => setDateTouched(true)}
                aria-invalid={dateInvalid}
                className="border px-3 py-2 rounded-l w-full"
              />
              <button
                type="button"
                onClick={openPicker}
                aria-label="Open calendar picker"
                title="Open calendar picker"
                className="border border-l-0 px-3 py-2 rounded-r text-gray-600 hover:text-gray-900"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  aria-hidden="true"
                  className="h-5 w-5"
                >
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M3 10h18M8 3v4M16 3v4" />
                </svg>
              </button>
              <input
                ref={pickerRef}
                type="date"
                value={surgeryDate}
                onChange={handlePickerChange}
                tabIndex={-1}
                aria-label="Surgery date calendar picker"
                className="sr-only"
              />
            </div>
            {dateInvalid && (
              <p className="mt-1 text-xs text-red-600">
                Enter a real date as dd/mm/yyyy.
              </p>
            )}
          </div>

          <div>
            <label className="block font-medium mb-1">
              Follow-up Protocol
            </label>
            <select
              value={scheduleType}
              onChange={(e) => {
                const next = e.target.value;
                setScheduleType(next);
                if (next !== "NEL") setNelHighRisk(false);
              }}
              className="border px-3 py-2 rounded w-full"
            >
              <option value="NEL">
                NHS North East London
              </option>
              <option value="ICL">
                Imperial College London
              </option>
            </select>

            {scheduleType === "NEL" && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  id="nelHighRisk"
                  type="checkbox"
                  checked={nelHighRisk}
                  onChange={(e) =>
                    setNelHighRisk(e.target.checked)
                  }
                  className="h-4 w-4"
                />
                <label
                  htmlFor="nelHighRisk"
                  className="text-sm text-gray-800"
                >
                  High risk (e.g. R1/2 resections, PL 1/2
                  disease, STAS – adds 30-month CT)
                </label>
              </div>
            )}
          </div>
        </div>

        {schedule.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">
              Follow-up Schedule
            </h2>

            <div className="space-y-2">
              {schedule.map((item, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-100"
                >
                  <p className="font-semibold">
                    {item.label} — {item.type}
                  </p>
                  <p className="text-gray-700">
                    {item.date}
                  </p>
                </div>
              ))}
            </div>

            <CopyPlanButton
              schedule={schedule}
              surgeryDate={formattedDate}
            />
          </div>
        )}

        <footer className="pt-4 mt-6 border-t text-center text-xs text-gray-500 space-y-1">
          <p>
            Clinical decision support only. Not a
            substitute for specialist clinical judgement.
          </p>
          <p>
            <a
              href="https://github.com/drcjar/lung-followup-app"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-700"
            >
              View source & methodology
            </a>{" "}
            · Guidance updated Jan 2026
          </p>
        </footer>
      </div>
    </div>
  );
}
