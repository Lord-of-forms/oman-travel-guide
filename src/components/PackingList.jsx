import React, { useState, useEffect } from 'react';
import { packingTemplates, suggestTemplate } from '../data/packingTemplates';
import { ChevronDown, ChevronRight, Plus, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TEMPLATE_KEYS = Object.keys(packingTemplates);

function getStorageKey(destId) {
  return `travel_guide_${destId}_packing_list`;
}

function buildInitialList(templateKey) {
  const tpl = packingTemplates[templateKey];
  if (!tpl) return [];
  return tpl.items.map(section => ({
    category: section.category,
    items: section.items.map(name => ({ name, checked: false })),
    collapsed: false,
  }));
}

const PackingList = ({ destination, locale = 'de' }) => {
  const destId = destination?.id || 'default';
  const suggestedKey = suggestTemplate(destination);

  const [templateKey, setTemplateKey] = useState(suggestedKey);
  const [sections, setSections] = useState(() => {
    try {
      const raw = localStorage.getItem(getStorageKey(destId));
      if (raw) return JSON.parse(raw);
    } catch (_e) { /* ignore */ }
    return buildInitialList(suggestedKey);
  });
  const [newItemInputs, setNewItemInputs] = useState({});

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem(getStorageKey(destId), JSON.stringify(sections));
    } catch (_e) { /* ignore */ }
  }, [sections, destId]);

  // Reset to template on first load only if no saved state - handled by useState initializer above

  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);
  const checkedItems = sections.reduce((sum, s) => sum + s.items.filter(i => i.checked).length, 0);

  const toggleItem = (sectionIdx, itemIdx) => {
    setSections(prev => prev.map((s, si) =>
      si !== sectionIdx ? s : {
        ...s,
        items: s.items.map((it, ii) => ii === itemIdx ? { ...it, checked: !it.checked } : it)
      }
    ));
  };

  const toggleSection = (sectionIdx) => {
    setSections(prev => prev.map((s, si) =>
      si !== sectionIdx ? s : { ...s, collapsed: !s.collapsed }
    ));
  };

  const addItem = (sectionIdx) => {
    const val = (newItemInputs[sectionIdx] || '').trim();
    if (!val) return;
    setSections(prev => prev.map((s, si) =>
      si !== sectionIdx ? s : { ...s, items: [...s.items, { name: val, checked: false }] }
    ));
    setNewItemInputs(prev => ({ ...prev, [sectionIdx]: '' }));
  };

  const handleReset = () => {
    setSections(buildInitialList(templateKey));
  };

  const handleTemplateChange = (key) => {
    setTemplateKey(key);
    setSections(buildInitialList(key));
  };

  const getTemplateName = (key) => {
    const tpl = packingTemplates[key];
    if (!tpl) return key;
    return locale === 'en' ? tpl.nameEn : tpl.name;
  };

  return (
    <motion.div className="packing-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="packing-header">
        <div className="packing-meta">
          <span className="packing-progress-text">
            {checkedItems}/{totalItems} {locale === 'en' ? 'items packed' : 'Gegenstände eingepackt'}
          </span>
          <div className="packing-progress-bar">
            <div
              className="packing-progress-fill"
              style={{ width: totalItems > 0 ? `${(checkedItems / totalItems) * 100}%` : '0%' }}
            />
          </div>
        </div>
        <div className="packing-controls">
          <select
            value={templateKey}
            onChange={e => handleTemplateChange(e.target.value)}
            className="packing-template-select"
          >
            {TEMPLATE_KEYS.map(k => (
              <option key={k} value={k}>{getTemplateName(k)}</option>
            ))}
          </select>
          <button className="restore-btn" onClick={handleReset} title={locale === 'en' ? 'Reset' : 'Zurücksetzen'}>
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      <div className="packing-sections">
        {sections.map((section, si) => (
          <div key={si} className="packing-section">
            <button
              className="packing-section-header"
              onClick={() => toggleSection(si)}
            >
              {section.collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
              <span>{section.category}</span>
              <span className="packing-section-count">
                {section.items.filter(i => i.checked).length}/{section.items.length}
              </span>
            </button>

            <AnimatePresence>
              {!section.collapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="packing-items">
                    {section.items.map((item, ii) => (
                      <label key={ii} className={`packing-item ${item.checked ? 'checked' : ''}`}>
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleItem(si, ii)}
                        />
                        <span>{item.name}</span>
                      </label>
                    ))}
                    <div className="packing-add-item">
                      <input
                        type="text"
                        placeholder={locale === 'en' ? 'Add item...' : 'Item hinzufügen...'}
                        value={newItemInputs[si] || ''}
                        onChange={e => setNewItemInputs(prev => ({ ...prev, [si]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && addItem(si)}
                      />
                      <button onClick={() => addItem(si)}><Plus size={14} /></button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default PackingList;
