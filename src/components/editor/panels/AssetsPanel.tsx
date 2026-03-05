import { useState } from 'react';
import { Search, Image, Film, Music, Smile, Shapes } from 'lucide-react';

const ASSET_TABS = [
  { key: 'photos', icon: Image, label: 'Photos' },
  { key: 'icons', icon: Shapes, label: 'Icons' },
  { key: 'gifs', icon: Smile, label: 'GIFs' },
  { key: 'videos', icon: Film, label: 'Videos' },
  { key: 'audio', icon: Music, label: 'Audio' },
];

const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1518173946687-a0770e756780?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=300&h=200&fit=crop',
];

export default function AssetsPanel() {
  const [activeTab, setActiveTab] = useState('photos');
  const [search, setSearch] = useState('');

  function handleDragStart(e: React.DragEvent, src: string) {
    e.dataTransfer.setData('application/gleamio-element', JSON.stringify({
      type: 'image',
      src,
      width: 300,
      height: 200,
      name: 'Image',
    }));
    e.dataTransfer.effectAllowed = 'copy';
  }

  return (
    <div className="p-3">
      {/* Tab bar */}
      <div className="flex gap-1 mb-3">
        {ASSET_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-md text-[10px] font-medium transition-colors
              ${activeTab === tab.key
                ? 'bg-gleam-100 dark:bg-gleam-900/30 text-gleam-600 dark:text-gleam-400'
                : 'text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
              }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400" />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-8 text-xs py-1.5"
        />
      </div>

      {/* Content */}
      {activeTab === 'photos' && (
        <div className="grid grid-cols-2 gap-2">
          {SAMPLE_PHOTOS.map((src, i) => (
            <div
              key={i}
              draggable
              onDragStart={(e) => handleDragStart(e, src)}
              className="aspect-[3/2] rounded-lg overflow-hidden cursor-grab hover:ring-2 hover:ring-gleam-400 transition-all"
            >
              <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      )}

      {activeTab === 'icons' && (
        <div className="text-center py-8">
          <Shapes className="w-10 h-10 text-surface-300 dark:text-surface-600 mx-auto mb-2" />
          <p className="text-xs text-surface-400">
            {search ? `Searching for "${search}"...` : 'Search for icons above'}
          </p>
          <p className="text-[10px] text-surface-500 mt-1">
            Connect Unsplash or Pexels API in .env for stock assets
          </p>
        </div>
      )}

      {(activeTab === 'gifs' || activeTab === 'videos' || activeTab === 'audio') && (
        <div className="text-center py-8">
          <p className="text-xs text-surface-400">
            {search ? `Searching for "${search}"...` : `Search for ${activeTab} above`}
          </p>
          <p className="text-[10px] text-surface-500 mt-1">
            Configure API keys in .env to enable asset search
          </p>
        </div>
      )}

      {/* Upload */}
      <div className="mt-4 border-t border-surface-200 dark:border-surface-800 pt-3">
        <label className="block w-full p-4 border-2 border-dashed border-surface-300 dark:border-surface-700
          rounded-lg text-center cursor-pointer hover:border-gleam-400 dark:hover:border-gleam-600 transition-colors">
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400">
            Drop files here or click to upload
          </p>
          <p className="text-[10px] text-surface-400 mt-1">
            PNG, JPG, SVG, GIF, MP4, MP3
          </p>
          <input type="file" className="hidden" accept="image/*,video/*,audio/*" />
        </label>
      </div>
    </div>
  );
}
