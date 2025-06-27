import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

/**
 * fields: Array of { key, label, type, ...extraProps }
 * onApply: (filters) => void
 *
 * Supported types: 'text', 'number', 'range', 'select'
 */
const FilterButton = ({ fields, onApply, initial = {} }) => {
  const [show, setShow] = useState(false);
  const [filters, setFilters] = useState(initial);
  const filterRef = useRef();

  useEffect(() => {
    if (!show) return;
    function handleClick(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShow(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [show]);

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(filters);
    setShow(false);
  };

  const handleReset = () => {
    setFilters({});
    onApply({});
    setShow(false);
  };

  return (
    <div className="relative inline-block">
      <button
        className="focus:outline-none"
        onClick={() => setShow((v) => !v)}
        aria-label="Afficher les filtres"
        type="button"
      >
        <FontAwesomeIcon icon={faFilter} className={`text-4xl text-black transition-transform duration-300 ${show ? 'rotate-90 scale-110' : ''}`} />
      </button>
      {show && (
        <div
          ref={filterRef}
          className="absolute left-0 top-14 z-50 w-[320px] bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 animate-fade-in-up"
          style={{ minWidth: 260 }}
        >
          <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
            <FontAwesomeIcon icon={faFilter} className="text-xl text-[#ff5c5c]" /> Filtres
          </h3>
          <div className="flex flex-col gap-4">
            {fields.filter(field => field.key !== 'status').map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{field.label}</label>
                {field.type === 'text' && (
                  <input
                    type="text"
                    value={filters[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#ff5c5c]"
                    placeholder={field.placeholder || ''}
                  />
                )}
                {field.type === 'number' && (
                  <input
                    type="number"
                    value={filters[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#ff5c5c]"
                    placeholder={field.placeholder || ''}
                  />
                )}
                {field.type === 'range' && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={filters[field.key + '_min'] || ''}
                      onChange={e => handleChange(field.key + '_min', e.target.value)}
                      className="w-1/2 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#ff5c5c]"
                      placeholder={field.placeholderMin || 'Min'}
                    />
                    <input
                      type="number"
                      value={filters[field.key + '_max'] || ''}
                      onChange={e => handleChange(field.key + '_max', e.target.value)}
                      className="w-1/2 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#ff5c5c]"
                      placeholder={field.placeholderMax || 'Max'}
                    />
                  </div>
                )}
                {field.type === 'select' && (
                  <select
                    value={filters[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#ff5c5c]"
                  >
                    <option value="">Tous</option>
                    {field.options && field.options.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-6">
            <button
              className="flex-1 bg-[#ff5c5c] hover:bg-[#ff7e7e] text-white rounded-lg py-2 text-base font-semibold shadow transition"
              onClick={handleApply}
            >
              Appliquer
            </button>
            <button
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg py-2 text-base font-semibold shadow transition"
              onClick={handleReset}
            >
              Réinitialiser
            </button>
          </div>
          <style>{`
            .animate-fade-in-up {
              animation: fadeInUp 0.35s cubic-bezier(.4,1.7,.6,.95);
            }
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(30px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default FilterButton;