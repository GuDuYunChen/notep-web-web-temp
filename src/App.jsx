import { useState, useEffect } from 'react'
import LoginPage from './components/LoginPage'
import { checkLoginStatus } from './utils/api'
import './App.css'

/**
 * 万象生活主应用组件 - Web版本
 * 功能：管理用户登录状态和页面路由，Web版本增强功能
 * 返回值：React组件
 */
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * 检查用户登录状态
   * 功能：在组件挂载时检查本地存储的登录信息和token有效性
   */
  useEffect(() => {
    const initializeApp = () => {
      try {
        const isValid = checkLoginStatus();
        const savedUserInfo = localStorage.getItem('userInfo');
        
        if (isValid && savedUserInfo) {
          setUserInfo(JSON.parse(savedUserInfo));
          setIsLoggedIn(true);
        } else {
          // 清除无效的本地存储
          localStorage.removeItem('userToken');
          localStorage.removeItem('userInfo');
          localStorage.removeItem('tokenExpiration');
        }
      } catch (error) {
        console.error('初始化应用失败:', error);
        // 清除所有本地存储
        localStorage.clear();
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    // Web版本添加页面可见性检查
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 页面重新可见时检查登录状态
        const isValid = checkLoginStatus();
        if (!isValid && isLoggedIn) {
          handleLogout();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLoggedIn]);

  /**
   * 处理用户登出
   * 功能：清除登录状态和本地存储，Web版本增强处理
   */
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('tokenExpiration');
    setIsLoggedIn(false);
    setUserInfo(null);
    
    // Web版本添加登出提示
    alert('已安全退出登录');
  };

  /**
   * 处理功能模块点击
   * 功能：Web版本的功能模块导航
   */
  const handleModuleClick = (moduleName) => {
    alert(`${moduleName}功能开发中，敬请期待！`);
  };

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载万象生活...</p>
        </div>
      </div>
    );
  }

  // 如果未登录，显示登录页面
  if (!isLoggedIn) {
    return <LoginPage />;
  }

  // 已登录，显示主应用界面
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">万</span>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">万象生活 - Web</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>在线</span>
              </div>
              <span className="text-sm text-gray-600">
                欢迎，{userInfo?.nickname || userInfo?.username || '用户'}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 欢迎区域 */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-8 mb-8 text-white">
            <h2 className="text-3xl font-bold mb-2">
              欢迎使用万象生活 Web 版
            </h2>
            <p className="text-indigo-100 mb-4">
              整合智慧，洞察人生。在浏览器中享受完整的万象生活体验。
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <span>🌐</span>
                <span>Web平台</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>⚡</span>
                <span>实时同步</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>🔒</span>
                <span>安全可靠</span>
              </div>
            </div>
          </div>

          {/* 功能模块网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div 
              onClick={() => handleModuleClick('笔记管理')}
              className="p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition-all cursor-pointer transform hover:scale-105"
            >
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">笔记管理</h3>
              <p className="text-sm text-gray-600">记录想法，整理思路，知识管理更高效</p>
            </div>

            <div 
              onClick={() => handleModuleClick('个人理财')}
              className="p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition-all cursor-pointer transform hover:scale-105"
            >
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">个人理财</h3>
              <p className="text-sm text-gray-600">收支记录，投资分析，财富增值有道</p>
            </div>

            <div 
              onClick={() => handleModuleClick('运动健身')}
              className="p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition-all cursor-pointer transform hover:scale-105"
            >
              <div className="text-4xl mb-4">🏃</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">运动健身</h3>
              <p className="text-sm text-gray-600">健康管理，运动计划，身体状态监控</p>
            </div>

            <div 
              onClick={() => handleModuleClick('学习成长')}
              className="p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition-all cursor-pointer transform hover:scale-105"
            >
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">学习成长</h3>
              <p className="text-sm text-gray-600">知识积累，技能提升，持续学习进步</p>
            </div>

            <div 
              onClick={() => handleModuleClick('心理健康')}
              className="p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition-all cursor-pointer transform hover:scale-105"
            >
              <div className="text-4xl mb-4">🧘</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">心理健康</h3>
              <p className="text-sm text-gray-600">情绪管理，压力释放，心理状态调节</p>
            </div>

            <div 
              onClick={() => handleModuleClick('娱乐文化')}
              className="p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition-all cursor-pointer transform hover:scale-105"
            >
              <div className="text-4xl mb-4">🎭</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">娱乐文化</h3>
              <p className="text-sm text-gray-600">传统文化，娱乐休闲，丰富精神生活</p>
            </div>

            <div 
              onClick={() => handleModuleClick('社交网络')}
              className="p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition-all cursor-pointer transform hover:scale-105"
            >
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">社交网络</h3>
              <p className="text-sm text-gray-600">朋友圈子，社交互动，人际关系管理</p>
            </div>

            <div 
              onClick={() => handleModuleClick('设置中心')}
              className="p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition-all cursor-pointer transform hover:scale-105"
            >
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">设置中心</h3>
              <p className="text-sm text-gray-600">个人设置，隐私安全，系统配置管理</p>
            </div>
          </div>

          {/* 底部信息 */}
          <div className="mt-12 text-center text-sm text-gray-500">
            <p>万象生活 Web 版 v1.0.0 | 整合智慧，洞察人生</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App
