import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Sparkles, Phone } from 'lucide-react';
import { loginUser } from '../utils/api';

/**
 * 万象生活登录页面组件 - Web版本
 * 功能：支持手机号/邮箱登录、密码显示切换、第三方登录
 * 参数：无
 * 返回值：React组件
 */
const LoginPage = () => {
  // 状态管理
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState('phone'); // 'phone' or 'email'
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 八卦图案装饰
  const trigrams = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'];

  /**
   * 处理登录提交
   * 功能：验证表单并调用登录API
   */
  const handleLogin = async () => {
    setError('');
    
    // 表单验证
    const account = loginMethod === 'phone' ? phone : email;
    if (!account || !password) {
      setError('请填写完整的登录信息');
      return;
    }

    // 手机号格式验证
    if (loginMethod === 'phone' && !/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号格式');
      return;
    }

    // 邮箱格式验证
    if (loginMethod === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('请输入正确的邮箱格式');
      return;
    }

    setLoading(true);
    try {
      const result = await loginUser({
        account,
        password,
        loginType: loginMethod
      });
      
      if (result.success) {
        // 登录成功，保存用户信息
        localStorage.setItem('userToken', result.data.token);
        localStorage.setItem('userInfo', JSON.stringify(result.data.userInfo));
        alert('登录成功！');
        // 刷新页面以更新登录状态
        window.location.reload();
      } else {
        setError(result.message || '登录失败，请重试');
      }
    } catch (err) {
      setError('网络错误，请检查网络连接');
      console.error('登录错误:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理第三方登录
   * 功能：处理微信、Apple、短信登录
   * 参数：type - 登录类型
   */
  const handleThirdPartyLogin = (type) => {
    alert(`${type}登录功能开发中...`);
  };

  /**
   * 处理键盘事件
   * 功能：支持回车键登录
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center relative overflow-hidden">
      {/* 装饰性八卦图案背景 */}
      <div className="absolute inset-0 opacity-5">
        {trigrams.map((trigram, index) => (
          <div
            key={index}
            className="absolute text-6xl text-indigo-900 animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          >
            {trigram}
          </div>
        ))}
      </div>

      {/* 主登录容器 */}
      <div className="relative z-10 w-full max-w-md mx-auto px-8">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Logo和标题区域 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl mb-6 shadow-lg transform hover:scale-105 transition-transform">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              万象生活
            </h1>
            <p className="text-gray-500 text-sm">整合智慧 · 洞察人生 · Web版</p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-shake">
              {error}
            </div>
          )}

          {/* 登录方式切换 */}
          <div className="flex bg-gray-100 rounded-2xl p-1.5 mb-6">
            <button
              onClick={() => setLoginMethod('phone')}
              className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                loginMethod === 'phone'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md transform scale-105'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              手机号登录
            </button>
            <button
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                loginMethod === 'email'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md transform scale-105'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              邮箱登录
            </button>
          </div>

          {/* 登录表单 */}
          <div className="space-y-4 mb-6">
            {/* 手机号/邮箱输入 */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors group-focus-within:text-indigo-500">
                {loginMethod === 'phone' ? (
                  <Phone className="w-5 h-5 text-gray-400" />
                ) : (
                  <Mail className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <input
                type={loginMethod === 'phone' ? 'tel' : 'email'}
                placeholder={loginMethod === 'phone' ? '请输入手机号' : '请输入邮箱'}
                value={loginMethod === 'phone' ? phone : email}
                onChange={(e) =>
                  loginMethod === 'phone'
                    ? setPhone(e.target.value)
                    : setEmail(e.target.value)
                }
                onKeyPress={handleKeyPress}
                className="w-full pl-14 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition-all duration-200 text-gray-800 hover:border-gray-300"
                disabled={loading}
              />
            </div>

            {/* 密码输入 */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors group-focus-within:text-indigo-500">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-14 pr-14 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition-all duration-200 text-gray-800 hover:border-gray-300"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* 忘记密码 */}
          <div className="flex justify-end mb-6">
            <button 
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              onClick={() => alert('忘记密码功能开发中...')}
            >
              忘记密码？
            </button>
          </div>

          {/* 登录按钮 */}
          <button 
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 active:scale-98 mb-6 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                登录中...
              </div>
            ) : (
              '登录'
            )}
          </button>

          {/* 第三方登录 */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">其他登录方式</span>
            </div>
          </div>

          <div className="flex justify-center space-x-6 mb-6">
            <button 
              onClick={() => handleThirdPartyLogin('微信')}
              className="w-14 h-14 bg-white rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center active:scale-95 transform hover:scale-110"
              title="微信登录"
            >
              <span className="text-2xl">💬</span>
            </button>
            <button 
              onClick={() => handleThirdPartyLogin('Apple')}
              className="w-14 h-14 bg-white rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center active:scale-95 transform hover:scale-110"
              title="Apple登录"
            >
              <span className="text-2xl">🍎</span>
            </button>
            <button 
              onClick={() => handleThirdPartyLogin('短信')}
              className="w-14 h-14 bg-white rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center active:scale-95 transform hover:scale-110"
              title="短信登录"
            >
              <span className="text-2xl">📱</span>
            </button>
          </div>

          {/* 注册提示 */}
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">
              还没有账号？
              <button 
                className="text-indigo-600 font-semibold ml-1 hover:text-indigo-700 transition-colors"
                onClick={() => alert('注册功能开发中...')}
              >
                立即注册
              </button>
            </p>
          </div>

          {/* 协议声明 */}
          <div className="text-center">
            <p className="text-xs text-gray-400 leading-relaxed">
              登录即表示同意
              <button className="text-indigo-600 mx-1 hover:text-indigo-700 transition-colors">《用户协议》</button>
              和
              <button className="text-indigo-600 mx-1 hover:text-indigo-700 transition-colors">《隐私政策》</button>
            </p>
          </div>
        </div>
      </div>

      {/* 底部装饰 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/30 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default LoginPage;