export default function TemplatePicker({ templates, selectedId, onChange }) {
  return (
    <div className="pb-field">
      <label>Pilih Template</label>
      <div className="pb-template-grid">
        {Object.values(templates).map((t) => (
          <button
            key={t.id}
            type="button"
            className={`pb-template-card${selectedId === t.id ? " selected" : ""}`}
            onClick={() => onChange(t.id)}
          >
            <div className="pb-template-thumb">
              <img src={t.image} alt={t.name} />
            </div>
            <span className="pb-template-name">{t.name}</span>
            <span className="pb-template-count">{t.slots.length} foto</span>
          </button>
        ))}
      </div>
    </div>
  );
}