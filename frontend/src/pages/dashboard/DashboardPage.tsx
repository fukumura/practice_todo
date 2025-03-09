import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { handleLogout, fetchCurrentUser } = useAuth();

  useEffect(() => {
    // 必要に応じてユーザー情報を再取得
    fetchCurrentUser();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="flex items-center justify-between h-16 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {user?.name || 'ユーザー'}さん
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow p-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900">ようこそ!</h2>
          <p className="mt-1 text-gray-600">
            ここにタスク管理インターフェースが表示されます。実装中です...
          </p>
        </div>
      </main>
      
      <footer className="py-4 bg-white shadow">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <p className="text-sm text-center text-gray-500">
            &copy; 2025 TODOアプリ
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;