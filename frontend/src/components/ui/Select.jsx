import ReactSelect from 'react-select';

const controlStyles = {
  minHeight: '48px',
  borderRadius: '0.75rem',
  borderColor: '#2a2a2a',
  backgroundColor: '#1a1a1a',
  boxShadow: 'none',
  cursor: 'pointer',
};

const selectStyles = {
  container: (base) => ({
    ...base,
    width: '100%',
  }),
  control: (base, state) => ({
    ...base,
    ...controlStyles,
    width: '100%',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: state.isFocused ? '#ffffff' : '#2a2a2a',
    '&:hover': {
      borderColor: state.isFocused ? '#ffffff' : '#3a3a3a',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '2px 12px',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#ffffff',
  }),
  input: (base) => ({
    ...base,
    color: '#ffffff',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#888888',
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.75rem',
    border: '1px solid #2a2a2a',
    backgroundColor: '#0f0f0f',
    overflow: 'hidden',
    zIndex: 9999,
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  menuList: (base) => ({
    ...base,
    padding: '4px',
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: '0.5rem',
    backgroundColor: state.isSelected ? '#ffffff' : state.isFocused ? '#1a1a1a' : 'transparent',
    color: state.isSelected ? '#000000' : '#ffffff',
    cursor: 'pointer',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: '#888888',
    paddingRight: '12px',
    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : undefined,
    '&:hover': {
      color: '#ffffff',
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: '#888888',
    '&:hover': {
      color: '#ffffff',
    },
  }),
};

function normalizeOptions(options = []) {
  return options.map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option
  );
}

export default function Select({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select…',
  className = '',
  isClearable = false,
  isSearchable = false,
  menuPlacement = 'auto',
  instanceId,
}) {
  const normalizedOptions = normalizeOptions(options);
  const selected = normalizedOptions.find((option) => option.value === value) ?? null;

  return (
    <div className={`w-full ${className}`}>
      {label ? (
        <label className="mb-1.5 block text-sm font-medium text-portfolio-gray">{label}</label>
      ) : null}
      <ReactSelect
        unstyled
        instanceId={instanceId}
        classNamePrefix="app-select"
        styles={selectStyles}
        options={normalizedOptions}
        value={selected}
        onChange={(option) => onChange(option?.value ?? '')}
        placeholder={placeholder}
        isClearable={isClearable}
        isSearchable={isSearchable}
        menuPlacement={menuPlacement}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        menuPosition="fixed"
      />
    </div>
  );
}
