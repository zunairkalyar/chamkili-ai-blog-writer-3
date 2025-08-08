
import React from 'react';
import { InternalLink } from '../types';

interface InternalLinkerProps {
    url: string;
    setUrl: (url: string) => void;
    links: InternalLink[];
    isLoading: boolean;
    error: string | null;
    onFetch: () => void;
}

const InternalLinker: React.FC<InternalLinkerProps> = ({ url, setUrl, links, isLoading, error, onFetch }) => {
    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-500">
                Fetch links from your blog's sitemap to automatically include them as internal links in new articles.
            </p>
            <div>
                <label htmlFor="sitemapUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    Sitemap XML URL
                </label>
                <input
                    type="url"
                    id="sitemapUrl"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://your-site.com/sitemap.xml"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    disabled={isLoading}
                />
            </div>
            <button
                onClick={onFetch}
                disabled={isLoading || !url.trim()}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
            >
                {isLoading ? 'Fetching...' : 'Fetch Links'}
            </button>
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
            {links.length > 0 && !isLoading && (
                <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Found {links.length} Links for Internal Linking
                    </h4>
                    <div className="max-h-48 overflow-y-auto custom-scrollbar border rounded-lg p-2 space-y-1">
                        {links.map((link, index) => (
                            <div key={index} className="text-xs p-1.5 bg-gray-50 rounded truncate">
                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" title={link.url}>
                                    {link.title}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InternalLinker;
