// components/pickers/CountPicker.jsx
export default function CountPicker({ options, shotCount, onChange }) {
  return (
    <div className="pb-field">
      <label>Jumlah Foto</label>
      <div className="pb-pills">
        {options.map((count) => (
          <button
            key={count}
            className={`pb-pill ${shotCount === count ? 'selected' : ''}`}
            onClick={() => onChange(count)}
            type="button"
          >
            {count} foto
          </button>
        ))}
      </div>
    </div>
  );
}