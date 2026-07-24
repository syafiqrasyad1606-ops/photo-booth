// components/pickers/ThemePicker.jsx
export default function ThemePicker({ themes, theme, onChange }) {
  return (
    <div className="pb-field">
      <label>Tema</label>
      <div className="pb-themes">
        {Object.values(themes).map((t) => (
          <button
            key={t.id}
            className={`pb-swatch ${theme === t.id ? 'selected' : ''}`}
            style={{ background: t.swatch }}
            onClick={() => onChange(t.id)}
            type="button"
            aria-label={t.label}
          />
        ))}
      </div>
    </div>
  );
}