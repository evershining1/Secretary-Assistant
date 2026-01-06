import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

/**
 * Free Location Autocomplete using OpenStreetMap / Photon API
 * @param {string} value - Current input value
 * @param {function} onChange - Callback when input changes
 * @param {function} onSelect - Callback when a suggestion is selected
 */
export function LocationAutocomplete({ value, onChange, onSelect }) {
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSuggestions = async (text) => {
        if (text.length < 3) {
            setSuggestions([]);
            return;
        }

        try {
            // Photon API (Free, based on OpenStreetMap)
            const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(text)}&limit=5`);
            const data = await response.json();

            const results = data.features.map(f => {
                const p = f.properties;
                const city = p.city || p.town || '';
                const state = p.state || '';
                const country = p.country || '';
                const name = p.name || '';

                const label = [name, city, state, country].filter(x => x).join(', ');
                return { label, ...p };
            });

            setSuggestions(results);
            setShowDropdown(true);
        } catch (error) {
            console.error('Location search failed:', error);
        }
    };

    const handleInputChange = (e) => {
        const text = e.target.value;
        onChange(text);

        // Debounce search
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(() => fetchSuggestions(text), 300);
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div className="bg-slate-50 hover:bg-slate-100 transition-colors rounded-2xl p-3 flex items-center gap-3 border border-slate-200/50 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-500 shadow-sm">
                    <MapPin size={16} />
                </div>
                <input
                    type="text"
                    placeholder="Search address (e.g. Starbucks London)"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                    className="bg-transparent border-none p-0 text-sm font-medium text-slate-700 w-full focus:ring-0 placeholder:text-slate-400"
                />
            </div>

            {showDropdown && suggestions.length > 0 && (
                <div className="absolute z-[110] left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {suggestions.map((s, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => {
                                onSelect(s.label);
                                setShowDropdown(false);
                            }}
                            className="w-full text-left px-5 py-3 hover:bg-slate-50 text-sm font-medium text-slate-700 border-b border-slate-50 last:border-none transition-colors"
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
