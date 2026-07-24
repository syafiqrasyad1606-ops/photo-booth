// components/pickers/FilterPicker.jsx
export default function FilterPicker({ filters, filter, onChange }) {
  return (
    <div className="pb-field">
      <label>Filter</label>
      <div className="pb-pills">
        {Object.values(filters).map((f) => (
          <button
            key={f.id}
            className={`pb-pill ${filter === f.id ? 'selected' : ''}`}
            onClick={() => onChange(f.id)}
            type="button"
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}