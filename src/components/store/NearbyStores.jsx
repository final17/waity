import React, { useState, useEffect, useRef } from 'react';
import { API_ENDPOINTS, fetchAPI } from '../../constants/api';

const KEYWORD_LIST = [
    { id: 1, value: '카페'},
    { id: 2, value: '주변맛집'},
];

const NearbyStores = ({ store, radius = 1000 }) => {  // 반경 1km로 수정
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [nearbyStores, setNearbyStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [keyword, setKeyword] = useState('카페');
    const [openMarkerId, setOpenMarkerId] = useState(null);

    useEffect(() => {
        if (!store?.latitude || !store?.longitude) {
            setError('매장의 위치 정보가 없습니다.');
            setLoading(false);
            return;
        }

        const initializeMap = async () => {
            try {
                const { kakao } = window;

                const currentPosition = new kakao.maps.LatLng(store.latitude, store.longitude);

                const mapInstance = new kakao.maps.Map(mapRef.current, {
                    center: currentPosition,
                    level: 3  // 지도 확대 레벨 (1~14, 숫자가 작을수록 더 확대됨)
                });

                setMap(mapInstance);

                // 현재 위치 마커 생성
                const currentMarker = new kakao.maps.Marker({
                    map: mapInstance,
                    position: currentPosition
                });

                // 현재 위치 인포윈도우
                const infowindow = new kakao.maps.InfoWindow({
                    content: `
                        <div style="padding:5px;width:150px;text-align:center;">
                            <strong>${store.title}</strong>
                            <p style="font-size:12px;margin-top:4px;">(현재 위치)</p>
                        </div>
                    `
                });
                infowindow.open(mapInstance, currentMarker);

                // 1km 반경 원 그리기
                const circle = new kakao.maps.Circle({
                    center: currentPosition,
                    radius: radius,
                    strokeWeight: 1,
                    strokeColor: '#00a0e9',
                    strokeOpacity: 0.1,
                    strokeStyle: 'solid',
                    fillColor: '#00a0e9',
                    fillOpacity: 0.1
                });
                circle.setMap(mapInstance);

                // 검색 서비스 객체 생성
                const ps = new kakao.maps.services.Places();

                // 키워드로 장소 검색 (위치 기반)
                ps.keywordSearch(keyword, (data, status) => {
                    if (status === kakao.maps.services.Status.OK) {
                        let markers = [];

                        data.forEach(place => {
                            const placePosition = new kakao.maps.LatLng(place.y, place.x);
                            const distance = calculateDistance(
                                store.latitude,
                                store.longitude,
                                place.y,
                                place.x
                            );

                            // 1km 이내의 장소만 표시
                            if (distance <= radius) {
                                const marker = new kakao.maps.Marker({
                                    map: mapInstance,
                                    position: placePosition
                                });

                                const infowindow = new kakao.maps.InfoWindow({
                                    content: `
                                        <div style="padding:5px;width:150px;text-align:center;">
                                            <strong>${place.place_name}</strong>
                                            <p style="font-size:12px;margin-top:4px;">
                                                ${place.address_name}
                                            </p>
                                        </div>
                                    `
                                });

                                kakao.maps.event.addListener(marker, 'click', () => {
                                    if (openMarkerId === place.id) {
                                        infowindow.close();
                                        setOpenMarkerId(null);
                                    } else {
                                        infowindow.open(mapInstance, marker);
                                        setOpenMarkerId(place.id);
                                    }
                                });

                                markers.push({
                                    marker,
                                    infowindow,
                                    ...place,
                                    distance
                                });
                            }
                        });

                        // 거리순 정렬
                        const sortedStores = markers.sort((a, b) => a.distance - b.distance);
                        setNearbyStores(sortedStores);
                    }
                    setLoading(false);
                }, {
                    // 현재 위치 중심으로 검색
                    location: currentPosition
                });

            } catch (error) {
                console.error('Map initialization error:', error);
                setError('지도를 초기화하는데 실패했습니다.');
                setLoading(false);
            }
        };

        initializeMap();

        return () => {
            if (nearbyStores.length > 0) {
                nearbyStores.forEach(store => {
                    if (store.marker) store.marker.setMap(null);
                });
            }
        };
    }, [store, radius, keyword]);

    // 거리 계산 함수
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3;
        const φ1 = parseFloat(lat1) * Math.PI/180;
        const φ2 = parseFloat(lat2) * Math.PI/180;
        const Δφ = (parseFloat(lat2)-parseFloat(lat1)) * Math.PI/180;
        const Δλ = (parseFloat(lon2)-parseFloat(lon1)) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c;
    };

    return (
        <div className="bg-white">
            <div className="p-4 border-b">
                <div className="flex gap-2">
                    {KEYWORD_LIST.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setKeyword(item.value)}
                            className={`px-4 py-2 rounded-full ${
                                keyword === item.value
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            {item.value}
                        </button>
                    ))}
                </div>
            </div>

            <div ref={mapRef} className="w-full h-96" />

            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">주변 {keyword}</h3>
                    <span className="text-sm text-gray-500">
                        {radius}m 반경
                    </span>
                </div>

                {loading ? (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 py-4">
                        {error}
                    </div>
                ) : nearbyStores.length > 0 ? (
                    <div className="space-y-4">
                        {nearbyStores.map(place => (
                            <div
                                key={place.id}
                                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => {
                                    if (map) {
                                        map.panTo(new window.kakao.maps.LatLng(place.y, place.x));
                                        setOpenMarkerId(place.id);
                                        place.infowindow.open(map, place.marker);
                                    }
                                }}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-medium text-gray-900">{place.place_name}</h4>
                                        <p className="text-sm text-gray-500 mt-1">{place.address_name}</p>
                                    </div>
                                    <span className="text-sm text-blue-500 font-medium">
                                        {Math.round(place.distance)}m
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-4">
                        <p>{radius}m 반경 내에 {keyword}가 없습니다.</p>
                        <p className="text-sm mt-2">다른 키워드로 검색해보세요.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NearbyStores;