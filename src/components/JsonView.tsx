import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Edit2, Check, X, Copy } from 'lucide-react';

interface JsonViewProps {
  data: unknown;
  level?: number;
  isReadableView?: boolean;
  isDark?: boolean;
  onUpdate?: (newData: unknown) => void;
  parentKey?: string;
  isArrayItem?: boolean;
  arrayIndex?: number;
  onDelete?: () => void;
  onAddSibling?: () => void;
  path?: string;
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

// Editable value component
interface EditableValueProps {
  value: JsonValue;
  onSave: (newValue: JsonValue) => void;
  isDark: boolean;
  isKey?: boolean;
}

const EditableValue: React.FC<EditableValueProps> = ({ value, onSave, isDark, isKey = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [editType, setEditType] = useState<'string' | 'number' | 'boolean' | 'null'>('string');
  const inputRef = useRef<HTMLInputElement>(null);

  const getValueType = (val: JsonValue): 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array' => {
    if (val === null) return 'null';
    if (Array.isArray(val)) return 'array';
    return typeof val as 'string' | 'number' | 'boolean' | 'object';
  };

  const startEditing = () => {
    const type = getValueType(value);
    if (type === 'object' || type === 'array') return;

    setEditType(type as 'string' | 'number' | 'boolean' | 'null');
    setEditValue(value === null ? '' : String(value));
    setIsEditing(true);
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    let newValue: JsonValue;

    if (editType === 'null') {
      newValue = null;
    } else if (editType === 'boolean') {
      newValue = editValue.toLowerCase() === 'true';
    } else if (editType === 'number') {
      const num = parseFloat(editValue);
      if (isNaN(num)) {
        newValue = editValue; // Fall back to string if not a valid number
      } else {
        newValue = num;
      }
    } else {
      newValue = editValue;
    }

    onSave(newValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const getValueColor = () => {
    if (isKey) {
      return isDark ? 'text-blue-300' : 'text-blue-600';
    }
    const type = getValueType(value);
    switch (type) {
      case 'string':
        return isDark ? 'text-emerald-400' : 'text-emerald-600';
      case 'number':
        return isDark ? 'text-amber-400' : 'text-amber-600';
      case 'boolean':
        return isDark ? 'text-purple-400' : 'text-purple-600';
      case 'null':
        return isDark ? 'text-gray-400' : 'text-gray-500';
      default:
        return isDark ? 'text-gray-100' : 'text-gray-900';
    }
  };

  if (isEditing) {
    return (
      <span className="inline-flex items-center gap-1">
        <select
          value={editType}
          onChange={(e) => setEditType(e.target.value as typeof editType)}
          className={`text-xs px-1 py-0.5 rounded border ${
            isDark
              ? 'bg-gray-700 border-gray-600 text-gray-200'
              : 'bg-white border-gray-300 text-gray-700'
          }`}
        >
          <option value="string">String</option>
          <option value="number">Number</option>
          <option value="boolean">Boolean</option>
          <option value="null">Null</option>
        </select>
        {editType === 'boolean' ? (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            ref={inputRef as unknown as React.RefObject<HTMLSelectElement>}
            className={`text-sm px-2 py-0.5 rounded border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-gray-200'
                : 'bg-white border-gray-300 text-gray-700'
            }`}
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        ) : editType === 'null' ? (
          <span className={`text-sm px-2 py-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            null
          </span>
        ) : (
          <input
            ref={inputRef}
            type={editType === 'number' ? 'number' : 'text'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`text-sm px-2 py-0.5 rounded border min-w-[100px] ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-gray-200'
                : 'bg-white border-gray-300 text-gray-700'
            }`}
          />
        )}
        <button
          onClick={handleSave}
          className={`p-0.5 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
          title="Save"
        >
          <Check className="w-3.5 h-3.5 text-green-500" />
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className={`p-0.5 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
          title="Cancel"
        >
          <X className="w-3.5 h-3.5 text-red-500" />
        </button>
      </span>
    );
  }

  const displayValue = () => {
    if (value === null) return 'null';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'string') return `"${value}"`;
    return String(value);
  };

  return (
    <span
      className={`${getValueColor()} cursor-pointer hover:underline decoration-dotted group inline-flex items-center gap-1`}
      onClick={startEditing}
      title="Click to edit"
    >
      {displayValue()}
      <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
    </span>
  );
};

// Add new property/item dialog
interface AddPropertyDialogProps {
  isArray: boolean;
  onAdd: (key: string | null, value: JsonValue) => void;
  onCancel: () => void;
  isDark: boolean;
}

const AddPropertyDialog: React.FC<AddPropertyDialogProps> = ({ isArray, onAdd, onCancel, isDark }) => {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [valueType, setValueType] = useState<'string' | 'number' | 'boolean' | 'null' | 'object' | 'array'>('string');
  const keyRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isArray && keyRef.current) {
      keyRef.current.focus();
    }
  }, [isArray]);

  const handleAdd = () => {
    if (!isArray && !key.trim()) return;

    let parsedValue: JsonValue;
    switch (valueType) {
      case 'number':
        parsedValue = parseFloat(value) || 0;
        break;
      case 'boolean':
        parsedValue = value.toLowerCase() === 'true';
        break;
      case 'null':
        parsedValue = null;
        break;
      case 'object':
        parsedValue = {};
        break;
      case 'array':
        parsedValue = [];
        break;
      default:
        parsedValue = value;
    }

    onAdd(isArray ? null : key, parsedValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const inputClasses = `text-sm px-2 py-1 rounded border ${
    isDark
      ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-700 placeholder-gray-400'
  }`;

  return (
    <div className={`flex flex-wrap items-center gap-2 p-2 rounded-lg border ${
      isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
    }`}>
      {!isArray && (
        <input
          ref={keyRef}
          type="text"
          placeholder="Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`${inputClasses} w-24`}
        />
      )}
      <select
        value={valueType}
        onChange={(e) => setValueType(e.target.value as typeof valueType)}
        className={inputClasses}
      >
        <option value="string">String</option>
        <option value="number">Number</option>
        <option value="boolean">Boolean</option>
        <option value="null">Null</option>
        <option value="object">Object {'{}'}</option>
        <option value="array">Array []</option>
      </select>
      {valueType !== 'null' && valueType !== 'object' && valueType !== 'array' && (
        valueType === 'boolean' ? (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={inputClasses}
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        ) : (
          <input
            type={valueType === 'number' ? 'number' : 'text'}
            placeholder="Value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`${inputClasses} flex-1 min-w-[100px]`}
          />
        )
      )}
      <button
        onClick={handleAdd}
        className="p-1.5 rounded bg-green-500 hover:bg-green-600 text-white transition-colors"
        title="Add"
      >
        <Check className="w-4 h-4" />
      </button>
      <button
        onClick={onCancel}
        className={`p-1.5 rounded ${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'} transition-colors`}
        title="Cancel"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const JsonView: React.FC<JsonViewProps> = ({
  data,
  level = 0,
  isReadableView = false,
  isDark = false,
  onUpdate,
  parentKey,
  isArrayItem = false,
  arrayIndex,
  onDelete,
  path = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(level < 3);
  const [isAdding, setIsAdding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleValueUpdate = useCallback((newValue: JsonValue) => {
    if (onUpdate) {
      onUpdate(newValue);
    }
  }, [onUpdate]);

  const handleObjectPropertyUpdate = useCallback((key: string, newValue: JsonValue) => {
    if (onUpdate && typeof data === 'object' && data !== null && !Array.isArray(data)) {
      const newData = { ...data as Record<string, JsonValue>, [key]: newValue };
      onUpdate(newData);
    }
  }, [data, onUpdate]);

  const handleArrayItemUpdate = useCallback((index: number, newValue: JsonValue) => {
    if (onUpdate && Array.isArray(data)) {
      const newData = [...data];
      newData[index] = newValue;
      onUpdate(newData);
    }
  }, [data, onUpdate]);

  const handleDeleteProperty = useCallback((key: string) => {
    if (onUpdate && typeof data === 'object' && data !== null && !Array.isArray(data)) {
      const newData = { ...data as Record<string, JsonValue> };
      delete newData[key];
      onUpdate(newData);
    }
  }, [data, onUpdate]);

  const handleDeleteArrayItem = useCallback((index: number) => {
    if (onUpdate && Array.isArray(data)) {
      const newData = data.filter((_, i) => i !== index);
      onUpdate(newData);
    }
  }, [data, onUpdate]);

  const handleAddProperty = useCallback((key: string | null, value: JsonValue) => {
    if (onUpdate) {
      if (Array.isArray(data)) {
        onUpdate([...data, value]);
      } else if (typeof data === 'object' && data !== null && key) {
        onUpdate({ ...data as Record<string, JsonValue>, [key]: value });
      }
    }
    setIsAdding(false);
  }, [data, onUpdate]);

  const handleKeyRename = useCallback((oldKey: string, newKey: string) => {
    if (onUpdate && typeof data === 'object' && data !== null && !Array.isArray(data)) {
      const entries = Object.entries(data as Record<string, JsonValue>);
      const newData: Record<string, JsonValue> = {};
      entries.forEach(([k, v]) => {
        newData[k === oldKey ? newKey : k] = v;
      });
      onUpdate(newData);
    }
  }, [data, onUpdate]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  }, [data]);

  // Editable readable view
  if (isReadableView) {
    const renderPrimitive = (value: unknown) => {
      if (value === null) {
        return <span className={isDark ? 'text-gray-400 italic' : 'text-gray-500 italic'}>null</span>;
      }
      if (typeof value === 'undefined') {
        return <span className={isDark ? 'text-gray-400 italic' : 'text-gray-500 italic'}>undefined</span>;
      }
      if (typeof value === 'string') {
        return (
          <EditableValue
            value={value}
            onSave={handleValueUpdate}
            isDark={isDark}
          />
        );
      }
      if (typeof value === 'number') {
        return (
          <EditableValue
            value={value}
            onSave={handleValueUpdate}
            isDark={isDark}
          />
        );
      }
      if (typeof value === 'boolean') {
        return (
          <EditableValue
            value={value}
            onSave={handleValueUpdate}
            isDark={isDark}
          />
        );
      }
      return null;
    };

    // Primitive values
    if (data === null || typeof data !== 'object') {
      return renderPrimitive(data);
    }

    // Arrays
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return (
          <div
            className={`flex items-center gap-2 group ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <span className="italic">Empty array</span>
            {onUpdate && (
              <button
                onClick={() => setIsAdding(true)}
                className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
                title="Add item"
              >
                <Plus className="w-3.5 h-3.5 text-green-500" />
              </button>
            )}
            {isAdding && (
              <AddPropertyDialog
                isArray={true}
                onAdd={handleAddProperty}
                onCancel={() => setIsAdding(false)}
                isDark={isDark}
              />
            )}
          </div>
        );
      }

      return (
        <div className="space-y-1">
          {data.map((item, index) => (
            <div
              key={index}
              className={`flex items-start gap-2 group py-1 px-2 -mx-2 rounded transition-colors ${
                isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
              }`}
            >
              <span className={`${isDark ? 'text-gray-500' : 'text-gray-400'} min-w-[28px] font-mono text-sm`}>
                {index + 1}.
              </span>
              <div className="flex-1">
                <JsonView
                  data={item}
                  level={level + 1}
                  isReadableView={true}
                  isDark={isDark}
                  onUpdate={onUpdate ? (newValue) => handleArrayItemUpdate(index, newValue as JsonValue) : undefined}
                  isArrayItem={true}
                  arrayIndex={index}
                  path={`${path}[${index}]`}
                />
              </div>
              {onUpdate && (
                <button
                  onClick={() => handleDeleteArrayItem(index)}
                  className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                  }`}
                  title="Delete item"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              )}
            </div>
          ))}
          {onUpdate && (
            <div className="mt-2">
              {isAdding ? (
                <AddPropertyDialog
                  isArray={true}
                  onAdd={handleAddProperty}
                  onCancel={() => setIsAdding(false)}
                  isDark={isDark}
                />
              ) : (
                <button
                  onClick={() => setIsAdding(true)}
                  className={`flex items-center gap-1 px-2 py-1 text-sm rounded transition-colors ${
                    isDark
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add item
                </button>
              )}
            </div>
          )}
        </div>
      );
    }

    // Objects
    if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data as Record<string, unknown>);

      if (keys.length === 0) {
        return (
          <div
            className={`flex items-center gap-2 group ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          >
            <span className="italic">Empty object</span>
            {onUpdate && (
              <button
                onClick={() => setIsAdding(true)}
                className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
                title="Add property"
              >
                <Plus className="w-3.5 h-3.5 text-green-500" />
              </button>
            )}
            {isAdding && (
              <AddPropertyDialog
                isArray={false}
                onAdd={handleAddProperty}
                onCancel={() => setIsAdding(false)}
                isDark={isDark}
              />
            )}
          </div>
        );
      }

      return (
        <div className="space-y-1">
          {keys.map((key) => (
            <div
              key={key}
              className={`group py-1 px-2 -mx-2 rounded transition-colors ${
                isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`p-0.5 rounded transition-colors ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                  }`}
                >
                  {typeof (data as Record<string, unknown>)[key] === 'object' && (data as Record<string, unknown>)[key] !== null ? (
                    isExpanded ? (
                      <ChevronDown className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    ) : (
                      <ChevronRight className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    )
                  ) : (
                    <span className="w-4 h-4 inline-block" />
                  )}
                </button>
                <span className={`font-medium ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                  {key}
                </span>
                <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>:</span>
                {typeof (data as Record<string, unknown>)[key] !== 'object' || (data as Record<string, unknown>)[key] === null ? (
                  <JsonView
                    data={(data as Record<string, unknown>)[key]}
                    level={level + 1}
                    isReadableView={true}
                    isDark={isDark}
                    onUpdate={onUpdate ? (newValue) => handleObjectPropertyUpdate(key, newValue as JsonValue) : undefined}
                    parentKey={key}
                    path={`${path}.${key}`}
                  />
                ) : (
                  <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {Array.isArray((data as Record<string, unknown>)[key])
                      ? `[${((data as Record<string, unknown>)[key] as unknown[]).length} items]`
                      : `{${Object.keys((data as Record<string, unknown>)[key] as object).length} properties}`
                    }
                  </span>
                )}
                {onUpdate && (
                  <button
                    onClick={() => handleDeleteProperty(key)}
                    className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ml-auto ${
                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                    }`}
                    title="Delete property"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                )}
              </div>
              {typeof (data as Record<string, unknown>)[key] === 'object' &&
               (data as Record<string, unknown>)[key] !== null &&
               isExpanded && (
                <div className="ml-6 mt-1 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                  <JsonView
                    data={(data as Record<string, unknown>)[key]}
                    level={level + 1}
                    isReadableView={true}
                    isDark={isDark}
                    onUpdate={onUpdate ? (newValue) => handleObjectPropertyUpdate(key, newValue as JsonValue) : undefined}
                    parentKey={key}
                    path={`${path}.${key}`}
                  />
                </div>
              )}
            </div>
          ))}
          {onUpdate && (
            <div className="mt-2">
              {isAdding ? (
                <AddPropertyDialog
                  isArray={false}
                  onAdd={handleAddProperty}
                  onCancel={() => setIsAdding(false)}
                  isDark={isDark}
                />
              ) : (
                <button
                  onClick={() => setIsAdding(true)}
                  className={`flex items-center gap-1 px-2 py-1 text-sm rounded transition-colors ${
                    isDark
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add property
                </button>
              )}
            </div>
          )}
        </div>
      );
    }
  }

  // VSCode-style tree view (non-editable, for raw display)
  const indent = level * 16;

  if (data === null) return <span className={isDark ? 'text-purple-400' : 'text-purple-600'}>null</span>;
  if (typeof data === 'undefined') return <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>undefined</span>;
  if (typeof data === 'string') return <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>"{data}"</span>;
  if (typeof data === 'number') return <span className={isDark ? 'text-amber-400' : 'text-amber-600'}>{data}</span>;
  if (typeof data === 'boolean') return <span className={isDark ? 'text-purple-400' : 'text-purple-600'}>{data.toString()}</span>;

  if (Array.isArray(data)) {
    if (data.length === 0) return <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>[]</span>;
    return (
      <div>
        <div
          className={`inline-flex items-center cursor-pointer rounded px-1 transition-colors ${
            isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ marginLeft: `${indent}px` }}
        >
          {isExpanded
            ? <ChevronDown className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            : <ChevronRight className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          }
          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>[</span>
          {!isExpanded && (
            <span className={`ml-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {data.length} items
            </span>
          )}
        </div>
        {isExpanded && (
          <>
            <div className="ml-4">
              {data.map((item, index) => (
                <div key={index} className="flex items-start">
                  <JsonView data={item} level={level + 1} isDark={isDark} />
                  {index < data.length - 1 && <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>,</span>}
                </div>
              ))}
            </div>
            <div style={{ marginLeft: `${indent}px` }} className={isDark ? 'text-gray-500' : 'text-gray-400'}>]</div>
          </>
        )}
      </div>
    );
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data as Record<string, unknown>);
    if (keys.length === 0) return <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>{'{}'}</span>;
    return (
      <div>
        <div
          className={`inline-flex items-center cursor-pointer rounded px-1 transition-colors ${
            isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ marginLeft: `${indent}px` }}
        >
          {isExpanded
            ? <ChevronDown className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            : <ChevronRight className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          }
          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{'{'}</span>
          {!isExpanded && (
            <span className={`ml-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {keys.length} properties
            </span>
          )}
        </div>
        {isExpanded && (
          <>
            <div className="ml-4">
              {keys.map((key, index) => (
                <div key={key} className="flex items-start">
                  <span className={isDark ? 'text-blue-300' : 'text-blue-500'}>"{key}"</span>
                  <span className={`mx-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>:</span>
                  <JsonView data={(data as Record<string, unknown>)[key]} level={level + 1} isDark={isDark} />
                  {index < keys.length - 1 && <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>,</span>}
                </div>
              ))}
            </div>
            <div style={{ marginLeft: `${indent}px` }} className={isDark ? 'text-gray-500' : 'text-gray-400'}>{'}'}</div>
          </>
        )}
      </div>
    );
  }

  return null;
};

export default JsonView;
