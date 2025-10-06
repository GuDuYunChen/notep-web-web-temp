/**
 * axios请求封装
 * 提供统一的HTTP请求接口，包含请求拦截、响应拦截和错误处理
 */
import axios from 'axios';

// 创建axios实例
const request = axios.create({
  baseURL: process.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 请求拦截器
 * 在发送请求之前做些什么
 */
request.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    
    console.log('请求发送:', config);
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 * 对响应数据做点什么
 */
request.interceptors.response.use(
  (response) => {
    const { data } = response;
    
    // 统一处理响应数据格式
    if (data.code === 200 || data.success) {
      return data.data || data;
    }
    
    // 处理业务错误
    const errorMessage = data.message || '请求失败';
    console.error('业务错误:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  },
  (error) => {
    console.error('响应错误:', error);
    
    // 处理HTTP状态码错误
    if (error.response) {
      const { status, data } = error.response;
      let errorMessage = '请求失败';
      
      switch (status) {
        case 401:
          errorMessage = '未授权，请重新登录';
          // 清除token并跳转到登录页
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          errorMessage = '拒绝访问';
          break;
        case 404:
          errorMessage = '请求地址不存在';
          break;
        case 500:
          errorMessage = '服务器内部错误';
          break;
        default:
          errorMessage = data?.message || `请求失败 (${status})`;
      }
      
      return Promise.reject(new Error(errorMessage));
    }
    
    // 处理网络错误
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('请求超时'));
    }
    
    return Promise.reject(new Error('网络错误'));
  }
);

/**
 * GET请求
 * @param {string} url 请求地址
 * @param {object} params 请求参数
 * @param {object} config 请求配置
 * @returns {Promise} 请求结果
 */
export const get = (url, params = {}, config = {}) => {
  return request.get(url, { params, ...config });
};

/**
 * POST请求
 * @param {string} url 请求地址
 * @param {object} data 请求数据
 * @param {object} config 请求配置
 * @returns {Promise} 请求结果
 */
export const post = (url, data = {}, config = {}) => {
  return request.post(url, data, config);
};

/**
 * PUT请求
 * @param {string} url 请求地址
 * @param {object} data 请求数据
 * @param {object} config 请求配置
 * @returns {Promise} 请求结果
 */
export const put = (url, data = {}, config = {}) => {
  return request.put(url, data, config);
};

/**
 * DELETE请求
 * @param {string} url 请求地址
 * @param {object} config 请求配置
 * @returns {Promise} 请求结果
 */
export const del = (url, config = {}) => {
  return request.delete(url, config);
};

/**
 * 文件上传
 * @param {string} url 上传地址
 * @param {FormData} formData 文件数据
 * @param {function} onUploadProgress 上传进度回调
 * @returns {Promise} 上传结果
 */
export const upload = (url, formData, onUploadProgress) => {
  return request.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
};

export default request;