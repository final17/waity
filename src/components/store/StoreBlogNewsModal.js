import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { API_ENDPOINTS, fetchAPI } from '../../constants/api';

const StoreBlogNews = ({ store }) => {
    const [activeTab, setActiveTab] = useState('blog');
    const [blogResults, setBlogResults] = useState([]);
    const [newsResults, setNewsResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [keywords, setKeywords] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchKeywordsAndResults = async () => {
            if (!store?.id) return;

            setLoading(true);
            setError(null);

            try {
                // 1. 키워드 생성
                const keywordsResponse = await fetchAPI(`${API_ENDPOINTS.crawler.keywords}/${store.id}`);
                const generatedKeywords = keywordsResponse.data || [store.title];
                setKeywords(generatedKeywords);

                // 2. 키워드로 검색
                const allBlogResults = [];
                const allNewsResults = [];

                for (const keyword of generatedKeywords) {
                    const encodedKeyword = encodeURIComponent(keyword);
                    const [blogRes, newsRes] = await Promise.all([
                        fetchAPI(`${API_ENDPOINTS.crawler.blog}?keyword=${encodedKeyword}&page=1`),
                        fetchAPI(`${API_ENDPOINTS.crawler.news}?keyword=${encodedKeyword}&page=1`)
                    ]);

                    if (blogRes?.data) allBlogResults.push(...blogRes.data);
                    if (newsRes?.data) allNewsResults.push(...newsRes.data);
                }

                // 3. 중복 제거 및 정렬
                setBlogResults(
                    Array.from(new Map(allBlogResults.map(item => [item.link, item])).values())
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                );
                setNewsResults(
                    Array.from(new Map(allNewsResults.map(item => [item.link, item])).values())
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                );

            } catch (error) {
                console.error('데이터 조회 실패:', error);
                setError('데이터를 불러오는 중 문제가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchKeywordsAndResults();
    }, [store?.id]);

    const renderItem = (item) => (
        <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 hover:bg-gray-50 transition-colors"
        >
            <div className="flex gap-4">
                {item.thumbnail && (
                    <div className="w-20 h-20 flex-shrink-0">
                        <img
                            src={item.thumbnail}
                            alt=""
                            className="w-full h-full object-cover rounded"
                            onError={(e) => e.target.style.display = 'none'}
                        />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">{item.description}</p>
                    <div className="flex items-center text-xs text-gray-400 gap-2">
                        <span>{item.date}</span>
                        <ExternalLink className="w-3 h-3" />
                    </div>
                </div>
            </div>
        </a>
    );

    return (
        <div className="bg-white">
            {/* 키워드 섹션 */}
            <div className="p-4 border-b">
                <div className="flex flex-wrap gap-1">
                    {keywords.map((keyword, index) => (
                        <span
                            key={index}
                            className="inline-block px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                        >
                            #{keyword}
                        </span>
                    ))}
                </div>
            </div>

            {/* 블로그/뉴스 탭 */}
            <div className="flex border-b">
                <button
                    onClick={() => setActiveTab('blog')}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'blog'
                            ? 'text-blue-600 border-blue-600'
                            : 'text-gray-500 border-transparent'
                    }`}
                >
                    블로그 ({blogResults.length})
                </button>
                <button
                    onClick={() => setActiveTab('news')}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'news'
                            ? 'text-blue-600 border-blue-600'
                            : 'text-gray-500 border-transparent'
                    }`}
                >
                    뉴스 ({newsResults.length})
                </button>
            </div>

            {/* 컨텐츠 영역 */}
            <div>
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500">
                        {error}
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-2 text-sm text-blue-500 hover:underline block"
                        >
                            다시 시도
                        </button>
                    </div>
                ) : (activeTab === 'blog' ? blogResults : newsResults).length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {(activeTab === 'blog' ? blogResults : newsResults).map((item, index) => (
                            <div key={index}>{renderItem(item)}</div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        {activeTab === 'blog' ? '블로그' : '뉴스'} 검색 결과가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoreBlogNews;