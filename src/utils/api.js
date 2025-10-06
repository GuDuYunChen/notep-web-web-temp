import axios from 'axios';

/**
 * API基础配置 - Web版本
 * 功能：配置axios实例，设置基础URL和拦截器
 */
const api = axios.create({
  baseURL: '/api', // 通过Vite代理到后端服务
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 请求拦截器
 * 功能：在请求发送前添加认证token和请求日志
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Web版本添加更多请求头信息
    config.headers['X-Platform'] = 'web';
    config.headers['X-Client-Version'] = '1.0.0';
    
    console.log('发送API请求:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 * 功能：统一处理响应数据和错误，Web版本增强错误处理
 */
api.interceptors.response.use(
  (response) => {
    console.log('收到API响应:', response.status, response.config.url, response.data);
    return response.data;
  },
  (error) => {
    console.error('响应拦截器错误:', error);
    
    // 处理网络错误
    if (!error.response) {
      const networkError = {
        success: false,
        message: '网络连接失败，请检查网络设置',
        code: 'NETWORK_ERROR'
      };
      
      // Web版本显示用户友好的错误提示
      if (window.confirm('网络连接失败，是否重试？')) {
        window.location.reload();
      }
      
      return Promise.reject(networkError);
    }

    // 处理HTTP状态码错误
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        // 未授权，清除本地存储并跳转到登录页
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        alert('登录已过期，请重新登录');
        window.location.reload();
        return Promise.reject({
          success: false,
          message: '登录已过期，请重新登录',
          code: 'UNAUTHORIZED'
        });
      
      case 403:
        alert('没有权限访问该资源');
        return Promise.reject({
          success: false,
          message: '没有权限访问该资源',
          code: 'FORBIDDEN'
        });
      
      case 404:
        return Promise.reject({
          success: false,
          message: '请求的资源不存在',
          code: 'NOT_FOUND'
        });
      
      case 500:
        alert('服务器内部错误，请稍后重试');
        return Promise.reject({
          success: false,
          message: '服务器内部错误，请稍后重试',
          code: 'SERVER_ERROR'
        });
      
      default:
        return Promise.reject({
          success: false,
          message: data?.message || '请求失败，请重试',
          code: data?.code || 'UNKNOWN_ERROR'
        });
    }
  }
);

/**
 * 用户登录API - Web版本
 * 功能：发送登录请求到后端服务，增加Web特有的处理逻辑
 * 参数：loginData - 包含account、password、loginType的对象
 * 返回值：Promise<{success: boolean, data?: any, message?: string}>
 */
export const loginUser = async (loginData) => {
  try {
    // Web版本添加浏览器信息
    const browserInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    };
    
    const response = await api.post('/user/login', {
      account: loginData.account,
      password: loginData.password,
      login_type: loginData.loginType, // 'phone' or 'email'
      browser_info: browserInfo,
      platform: 'web'
    });
    
    // Web版本成功后的额外处理
    if (response.data?.token) {
      // 设置token过期时间
      const expirationTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24小时
      localStorage.setItem('tokenExpiration', expirationTime.toString());
    }
    
    return {
      success: true,
      data: response.data,
      message: response.message || '登录成功'
    };
  } catch (error) {
    console.error('登录API错误:', error);
    return {
      success: false,
      message: error.message || '登录失败，请重试',
      code: error.code
    };
  }
};

/**
 * 用户注册API - Web版本
 * 功能：发送注册请求到后端服务
 * 参数：registerData - 包含用户注册信息的对象
 * 返回值：Promise<{success: boolean, data?: any, message?: string}>
 */
export const registerUser = async (registerData) => {
  try {
    const response = await api.post('/user/register', {
      ...registerData,
      platform: 'web',
      register_source: 'web_form'
    });
    
    return {
      success: true,
      data: response.data,
      message: response.message || '注册成功'
    };
  } catch (error) {
    console.error('注册API错误:', error);
    return {
      success: false,
      message: error.message || '注册失败，请重试',
      code: error.code
    };
  }
};

/**
 * 获取用户信息API - Web版本
 * 功能：获取当前登录用户的详细信息
 * 返回值：Promise<{success: boolean, data?: any, message?: string}>
 */
export const getUserInfo = async () => {
  try {
    // 检查token是否过期
    const expirationTime = localStorage.getItem('tokenExpiration');
    if (expirationTime && new Date().getTime() > parseInt(expirationTime)) {
      throw new Error('Token已过期');
    }
    
    const response = await api.get('/user/info');
    
    return {
      success: true,
      data: response.data,
      message: response.message || '获取用户信息成功'
    };
  } catch (error) {
    console.error('获取用户信息API错误:', error);
    return {
      success: false,
      message: error.message || '获取用户信息失败',
      code: error.code
    };
  }
};

/**
 * 发送验证码API - Web版本
 * 功能：发送短信或邮箱验证码
 * 参数：data - 包含account和type的对象
 * 返回值：Promise<{success: boolean, data?: any, message?: string}>
 */
export const sendVerificationCode = async (data) => {
  try {
    const response = await api.post('/sms/send', {
      account: data.account,
      type: data.type, // 'login', 'register', 'reset'
      platform: 'web'
    });
    
    return {
      success: true,
      data: response.data,
      message: response.message || '验证码发送成功'
    };
  } catch (error) {
    console.error('发送验证码API错误:', error);
    return {
      success: false,
      message: error.message || '验证码发送失败',
      code: error.code
    };
  }
};

/**
 * 重置密码API - Web版本
 * 功能：通过验证码重置用户密码
 * 参数：data - 包含account、code、newPassword的对象
 * 返回值：Promise<{success: boolean, data?: any, message?: string}>
 */
export const resetPassword = async (data) => {
  try {
    const response = await api.post('/user/reset-password', {
      account: data.account,
      verification_code: data.code,
      new_password: data.newPassword,
      platform: 'web'
    });
    
    return {
      success: true,
      data: response.data,
      message: response.message || '密码重置成功'
    };
  } catch (error) {
    console.error('重置密码API错误:', error);
    return {
      success: false,
      message: error.message || '密码重置失败',
      code: error.code
    };
  }
};

/**
 * 检查登录状态
 * 功能：检查用户是否已登录且token未过期
 * 返回值：boolean
 */
export const checkLoginStatus = () => {
  const token = localStorage.getItem('userToken');
  const expirationTime = localStorage.getItem('tokenExpiration');
  
  if (!token) return false;
  
  if (expirationTime && new Date().getTime() > parseInt(expirationTime)) {
    // Token已过期，清除本地存储
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('tokenExpiration');
    return false;
  }
  
  return true;
};

export default api;