import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface JsonViewProps {
  data: any;
  level?: number;
  isReadableView?: boolean;
  isDark?: boolean;
}

const JsonView: React.FC<JsonViewProps> = ({ data, level = 0, isReadableView = false, isDark = false }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const indent = level * 20;

  if (isReadableView) {
    if (data === null) return <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>null</span>;
    if (typeof data === 'undefined') return <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>undefined</span>;
    if (typeof data === 'string') {
      const isImportant = data.includes('most') || data.includes('least');
      return (
        <span className={`${
          isImportant 
            ? isDark 
              ? 'text-white font-semibold bg-blue-900/30 px-1 rounded' 
              : 'text-blue-800 font-semibold bg-blue-100 px-1 rounded'
            : isDark 
              ? 'text-gray-100' 
              : 'text-gray-900'
        }`}>
          {data}
        </span>
      );
    }
    if (typeof data === 'number') return <span className="text-blue-500 font-semibold">{data}</span>;
    if (typeof data === 'boolean') return <span className="text-purple-500 font-semibold">{data ? 'Yes' : 'No'}</span>;

    if (Array.isArray(data)) {
      if (data.length === 0) return <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Empty list</span>;
      return (
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className={`${isDark ? 'text-gray-500' : 'text-gray-400'} min-w-[24px]`}>{index + 1}.</span>
              <JsonView data={item} level={level + 1} isReadableView={true} isDark={isDark} />
            </div>
          ))}
        </div>
      );
    }

    if (typeof data === 'object') {
      const keys = Object.keys(data);
      if (keys.length === 0) return <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Empty object</span>;
      return (
        <div className="space-y-2">
          {keys.map((key) => (
            <div key={key} className="flex flex-col">
              <span className={`${
                key === 'most' || key === 'least'
                  ? isDark 
                    ? 'text-yellow-300 font-semibold' 
                    : 'text-yellow-600 font-semibold'
                  : isDark 
                    ? 'text-gray-300' 
                    : 'text-gray-700'
              } font-medium`}>
                {key}:
              </span>
              <div className="ml-4">
                <JsonView data={data[key]} level={level + 1} isReadableView={true} isDark={isDark} />
              </div>
            </div>
          ))}
        </div>
      );
    }
  }

  // Vista tipo VSCode para el panel izquierdo
  if (data === null) return <span className="text-purple-500">null</span>;
  if (typeof data === 'undefined') return <span className="text-gray-500">undefined</span>;
  if (typeof data === 'string') return <span className="text-green-500">"{data}"</span>;
  if (typeof data === 'number') return <span className="text-blue-500">{data}</span>;
  if (typeof data === 'boolean') return <span className="text-purple-500">{data.toString()}</span>;

  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-gray-400">[]</span>;
    return (
      <div>
        <div
          className="inline-flex items-center cursor-pointer hover:bg-gray-100 rounded px-1"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ marginLeft: `${indent}px` }}
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <span className="text-gray-400">[</span>
        </div>
        {isExpanded && (
          <>
            <div className="ml-4">
              {data.map((item, index) => (
                <div key={index} className="flex items-start">
                  <JsonView data={item} level={level + 1} isDark={isDark} />
                  {index < data.length - 1 && <span className="text-gray-400">,</span>}
                </div>
              ))}
            </div>
            <div style={{ marginLeft: `${indent}px` }} className="text-gray-400">]</div>
          </>
        )}
      </div>
    );
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data);
    if (keys.length === 0) return <span className="text-gray-400">{}</span>;
    return (
      <div>
        <div
          className="inline-flex items-center cursor-pointer hover:bg-gray-100 rounded px-1"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ marginLeft: `${indent}px` }}
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <span className="text-gray-400">{'{'}</span>
        </div>
        {isExpanded && (
          <>
            <div className="ml-4">
              {keys.map((key, index) => (
                <div key={key} className="flex items-start">
                  <span className="text-blue-400">"{key}"</span>
                  <span className="text-gray-400 mx-1">:</span>
                  <JsonView data={data[key]} level={level + 1} isDark={isDark} />
                  {index < keys.length - 1 && <span className="text-gray-400">,</span>}
                </div>
              ))}
            </div>
            <div style={{ marginLeft: `${indent}px` }} className="text-gray-400">{'}'}</div>
          </>
        )}
      </div>
    );
  }

  return null;
};

export default JsonView; 