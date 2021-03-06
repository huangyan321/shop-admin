import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

export function getInfo(id) {
  return request({
    url: `/users/${id}`,
    method: 'get'
  })
}
