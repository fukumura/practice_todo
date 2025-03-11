// frontend/src/pages/dashboard/DashboardPage.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import TaskList from '../../components/tasks/TaskList';
import AddTaskButton from '../../components/tasks/AddTaskButton';
import TaskFormModal from '../../components/tasks/TaskFormModal';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { handleLogout, fetchCurrentUser } = useAuth();
  const [showAddTask, setShowAddTask] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const handleTaskSaved = () => {
    // タスクリストを更新するためのキーを変更
    setRefreshKey(prevKey => prevKey + 1);
  };

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
      
      <main className="flex-grow p-4 mx-auto w-full max-w-4xl">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">タスク一覧</h2>
          <AddTaskButton onAddClick={() => setShowAddTask(true)} />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <TaskList key={refreshKey} onRefreshNeeded={handleTaskSaved} />
        </div>
      </main>
      
      <footer className="py-4 bg-white shadow">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <p className="text-sm text-center text-gray-500">
            &copy; 2025 TODOアプリ
          </p>
        </div>
      </footer>
      
      {/* タスク追加モーダル */}
      <TaskFormModal
        isOpen={showAddTask}
        onClose={() => setShowAddTask(false)}
        onTaskSaved={handleTaskSaved}
      />
    </div>
  );
};

export default DashboardPage;