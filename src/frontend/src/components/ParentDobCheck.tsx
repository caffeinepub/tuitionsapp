import { useState } from "react";

type Props = {
  onConfirmed: () => void;
  onBack: () => void;
  parentPrincipal: string;
};

export function getParentDob(principal: string): string | null {
  return localStorage.getItem(`tuitions_parent_dob_${principal}`);
}

export function ParentDobCheck({
  onConfirmed,
  onBack,
  parentPrincipal,
}: Props) {
  const [dobInput, setDobInput] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!dobInput) {
      setError("Please enter your date of birth.");
      return;
    }
    const dob = new Date(dobInput);
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const monthDiff = now.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
      age--;
    }
    if (age < 25) {
      setError(
        "You must be 25 or older to register as a parent on Tuition Skill.",
      );
      return;
    }
    localStorage.setItem(`tuitions_parent_dob_${parentPrincipal}`, dobInput);
    onConfirmed();
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #FFA500 0%, #ADD8E6 50%, #90EE90 100%)",
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="mb-6">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
            style={{ background: "#D4A520", color: "#fff" }}
          >
            Parent
          </span>
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: "#1B2B50", fontFamily: "Nunito, sans-serif" }}
          >
            Age Verification
          </h2>
          <p className="text-sm" style={{ color: "#8B929F" }}>
            To ensure platform safety, parents must be 25 or older. Please
            confirm your date of birth.
          </p>
        </div>
        <div className="mb-4">
          <label
            htmlFor="parent-dob-input"
            className="block text-sm font-semibold mb-1"
            style={{ color: "#1B2B50" }}
          >
            Date of Birth
          </label>
          <input
            id="parent-dob-input"
            data-ocid="parent_dob.input"
            type="date"
            value={dobInput}
            onChange={(e) => {
              setDobInput(e.target.value);
              setError("");
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
            max={new Date().toISOString().split("T")[0]}
          />
          {error && (
            <p
              className="text-red-500 text-xs mt-1"
              data-ocid="parent_dob.error_state"
            >
              {error}
            </p>
          )}
        </div>
        <button
          type="button"
          data-ocid="parent_dob.submit_button"
          className="w-full py-2 rounded-lg font-bold text-white text-sm transition-opacity hover:opacity-90 mb-3"
          style={{ background: "#D4A520" }}
          onClick={handleSubmit}
        >
          Confirm Age
        </button>
        <button
          type="button"
          data-ocid="parent_dob.cancel_button"
          className="w-full py-2 rounded-lg font-semibold text-sm transition-opacity hover:opacity-80"
          style={{ color: "#8B929F" }}
          onClick={onBack}
        >
          Back
        </button>
      </div>
    </div>
  );
}
