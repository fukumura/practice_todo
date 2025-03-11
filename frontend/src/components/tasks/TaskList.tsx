// frontend/src/components/tasks/TaskList.tsx
import React, { useEffect, useState } from 'react';
import { taskApi } from '../../services/api';
import TaskFormModal from './TaskFormModal';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import TaskFilters from './TaskFilters';

interface TaskListProps {
  onRefreshNeeded?: () => void;
}

const TaskList = ({ onRefreshNeeded }: TaskListProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState([]);
  
  // フィルター用の状態
  const [status, setStatus] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'dueDate' | 'priority'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // 編集モーダル用の状態
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // 削除確認ダイアログ用の状態
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [deletingTaskTitle, setDeletingTaskTitle] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      
      // フィルターパラメータを構築
      const params: any = {
        sortBy,
        sortOrder,
      };
      
      if (status !== 'all') {
        params.status = status;
      }
      
      if (search) {
        params.search = search;
      }
      
      const response = await taskApi.getTasks(params);
      if (response.status === 'success') {
        setTasks(response.data.tasks);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'タスクの取得中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [status, search, sortBy, sortOrder]);

  const handleToggleCompletion = async (taskId: string) => {
    try {
      await taskApi.toggleTaskCompletion(taskId);
      fetchTasks();
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (error: any) {
      setError(error.response?.data?.message || 'タスクの更新中にエラーが発生しました');
    }
  };
  
  const handleEditClick = (task: any) => {
    setEditingTaskId(task.id);
    setShowEditModal(true);
  };
  
  const handleDeleteClick = (task: any) => {
    setDeletingTaskId(task.id);
    setDeletingTaskTitle(task.title);
    setShowDeleteDialog(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!deletingTaskId) return;
    
    try {
      setIsDeleting(true);
      await taskApi.deleteTask(deletingTaskId);
      setShowDeleteDialog(false);
      fetchTasks();
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (error: any) {
      setError(error.response?.data?.message || 'タスクの削除中にエラーが発生しました');
    } finally {
      setIsDeleting(false);
      setDeletingTaskId(null);
      setDeletingTaskTitle('');
    }
  };
  
  const handleTaskSaved = () => {
    fetchTasks();
    if (onRefreshNeeded) onRefreshNeeded();
  };
  
  const handleStatusChange = (newStatus: 'all' | 'completed' | 'incomplete') => {
    setStatus(newStatus);
  };
  
  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
  };
  
  const handleSortChange = (newSortBy: 'createdAt' | 'dueDate' | 'priority', newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };
  
  const handleReset = () => {
    setStatus('all');
    setSearch('');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  return (
    <>
      {/* フィルター */}
      <TaskFilters
        status={status}
        search={search}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onStatusChange={handleStatusChange}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onReset={handleReset}
      />
      
      {/* ローディング状態 */}
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        // エラー表示
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">エラー: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : tasks.length === 0 ? (
        // タスクが存在しない場合
        <div className="text-center py-10">
          <p className="text-gray-500">
            {search ? 
              `"${search}"に一致するタスクはありません` : 
              status === 'completed' ? 
                '完了済みのタスクはありません' : 
                status === 'incomplete' ? 
                  '未完了のタスクはありません' : 
                  'タスクがありません。新しいタスクを追加しましょう！'
            }
          </p>
        </div>
      ) : (
        // タスク一覧
        <div className="space-y-4">
          {tasks.map((task: any) => (
            <div
              key={task.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleCompletion(task.id)}
                    className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div>
                    <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className={`mt-1 text-sm ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                        {task.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center space-x-2">
                      {task.priority && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.priority === 'HIGH' ? 'bg-red-100 text-red-800' : 
                          task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {task.priority === 'HIGH' ? '高' : task.priority === 'MEDIUM' ? '中' : '低'}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="text-xs text-gray-500">
                          期限: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => handleEditClick(task)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    className="text-gray-400 hover:text-red-600"
                    onClick={() => handleDeleteClick(task)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 編集モーダル */}
      <TaskFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onTaskSaved={handleTaskSaved}
        taskId={editingTaskId || undefined}
      />
      
      {/* 削除確認ダイアログ */}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title={deletingTaskTitle}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default TaskList;