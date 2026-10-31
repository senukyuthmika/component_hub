import { useState } from 'react';
import { Cpu } from 'lucide-react';
import { getComponentImageSources } from '../utils/componentImages';

export default function ComponentImage({ component, className = '', imgClassName = 'w-full h-full object-contain p-3', alt }) {
  const sources = getComponentImageSources(component);
  const [index, setIndex] = useState(0);
  const src = sources[index];

  if (!src) {
    return (
      <div className={`bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center ${className}`}>
        <Cpu className="w-8 h-8 text-gray-300" />
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt || component?.title || 'Component'}
        className={imgClassName}
        onError={() => setIndex((i) => i + 1)}
      />
    </div>
  );
}
