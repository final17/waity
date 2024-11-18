import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import UserStoreListPage from './pages/store/UserStoreListPage';
import UserStoreDetailPage from './pages/store/UserStoreDetailPage';
import StoreManagePage from './pages/store/StoreManagePage';
import StoreCreatePage from './pages/store/StoreCreatePage';
import MenuManagePage from './pages/menu/MenuManagePage';
import ReviewManagePage from './pages/review/ReviewManagePage';
import UserReviewPage from './pages/review/UserReviewPage';
import CreateReviewPage from './pages/review/CreateReviewPage';
import ReservationHistoryPage from './pages/reservation/ReservationHistoryPage';
import WaitingManagePage from './pages/waiting/WaitingManagePage';  // 추가
import StoreSearchPage from './pages/store/StoreSearchPage'
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AuthRoute } from './components/route/ProtectedRoutes';

function App() {
    return (
        <AuthProvider>
                {/* 전역적으로 사용되는 ToastContainer */}
                <ToastContainer position="bottom-left" autoClose={1000} />
                <Routes>
                    {/* 인증 라우트 */}
                    <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
                    <Route path="/signup" element={<AuthRoute><SignupPage /></AuthRoute>} />

                    {/* 공개 라우트 (로그인 불필요) */}
                    <Route path="/stores/search" element={<StoreSearchPage />} />
                    <Route path="/" element={<UserStoreListPage />} />
                    <Route path="/stores/:storeId" element={<UserStoreDetailPage />} />

                    {/* 사용자 보호 라우트 */}
                    <Route element={<ProtectedRoute />}>
                        {/* 예약/웨이팅 */}
                        <Route path="/reservations" element={<ReservationHistoryPage />} />
                        <Route path="/waiting" element={<ReservationHistoryPage type="WAIT" />} />

                        {/* 리뷰 */}
                        <Route path="/user/reviews" element={<UserReviewPage />} />
                        <Route path="/reviews/create/:storeId" element={<CreateReviewPage />} />
                    </Route>

                    {/* 점주 보호 라우트 */}
                    <Route element={<ProtectedRoute />}>
                        {/* 매장 관리 */}
                        <Route path="/owner/stores/create" element={<StoreCreatePage />} />
                        <Route path="/owner/stores" element={<StoreManagePage />} />

                        {/* 메뉴 관리 */}
                        <Route path="/owner/stores/:storeId/menus" element={<MenuManagePage />} />
                        <Route path="/owner/stores/:storeId/menus/create" element={<MenuManagePage />} />
                        <Route path="/owner/stores/:storeId/menus/:menuId/edit" element={<MenuManagePage />} />

                        {/* 웨이팅 관리 */}
                        <Route path="/owner/stores/:storeId/waiting" element={<WaitingManagePage />} />

                        {/* 리뷰 관리 */}
                        <Route path="/reviews/create/:storeId" element={<CreateReviewPage />} />
                        <Route path="/reviews/create/:storeId/:menuId" element={<CreateReviewPage />} />
                    </Route>

                    {/* 404 페이지 */}
                    <Route path="*" element={
                        <div className="min-h-screen flex items-center justify-center">
                            <div className="text-center">
                                <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                                <p className="text-gray-600">페이지를 찾을 수 없습니다.</p>
                            </div>
                        </div>
                    }/>
                </Routes>
        </AuthProvider>
    );
}

export default App;