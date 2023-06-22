import axiosLib from 'axios'

export const axios = axiosLib.create({})

axios.interceptors.request.use(async (config) => {
  return config
})
