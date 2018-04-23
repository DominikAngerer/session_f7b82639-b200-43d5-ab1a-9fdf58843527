const fs = require('fs-extra')
const rp = require('request-promise')
const axios = require('axios')
const Promise = require('bluebird')
const apiUrl = 'https://mapi.storyblok.com/v1'
const spaceId = 'YOUR_SPACE_ID'
const token = 'YOUR_MANAGEMENT_TOKEN'
const axiosInst = axios.create({
  baseURL: `${apiUrl}/spaces/${spaceId}`,
  headers: {Authorization: token},
})

module.exports = {
  getStory,
  getStories,
  resolveStory,
  createStory,
  updateStory,
  deleteStory,
  getComponent,
  getComponents,
  resolveComponent,
  createComponent,
  updateComponent,
  deleteComponent,
  uploadAsset,
}
function getStories() {
  return axiosInst
  .get('/stories')
  .then(res => {
console.log(res.data) // this console log works
return Promise.resolve(res.data.stories)
})
  .catch(error => Promise.reject(error))
}
function resolveStory(res) {
  return Promise.resolve(res.data.story)
}
function getStory(storyId) {
  return axiosInst
  .get(`/stories/${storyId}`)
  .then(resolveStory)
  .catch(error => Promise.reject(error))
}
function createStory(storyData) {
  return axiosInst
  .post('/stories', storyData)
  .then(resolveStory)
  .catch(error => Promise.reject(error))
}
function updateStory(storyId, name, content) {
  return axiosInst
  .put(`/stories/${storyId}`, {
    story: {name, content},
  })
  .then(resolveStory)
  .catch(error => Promise.reject(error))
}
// execution of this function fails with 404
function deleteStory(storyId) {
  return axiosInst.delete(`/stories/${storyId}`)
}
function getComponents() {
  return axiosInst
  .get('/components')
  .then(res => Promise.resolve(res.data.components))
  .catch(error => Promise.reject(error))
}
function resolveComponent(res) {
  return Promise.resolve(res.data.component)
}
function getComponent(componentId) {
  return axiosInst
  .get(`/components/${componentId}`)
  .then(resolveComponent)
  .catch(error => Promise.reject(error))
}
function createComponent(componentData) {
  return axiosInst
  .post('/components', componentData)
  .then(resolveComponent)
  .then(component => {
    console.log(`'${component.name}' component created...`)
    return Promise.resolve(component)
  })
  .catch(error => Promise.reject(error))
}
function updateComponent(componentId, componentData) {
  return axiosInst
  .put(`/components/${componentId}`, componentData)
  .then(resolveComponent)
  .catch(error => Promise.reject(error))
}
function deleteComponent(componentId) {
  return axiosInst.delete(`/components/${componentId}`)
}
function uploadAsset(assetPath) {
// check if asset actually existed
let filename = assetPath.split('\\').pop()
return fs
.pathExists(assetPath)
.then(exists => {
  let error = new Error('carousel image does not exist')
  return !exists ? Promise.reject(error) : Promise.resolve()
})
.then(() => {
// sign the asset with storyblok
return rp({
  method: 'post',
  uri: `${apiUrl}/spaces/${spaceId}/assets`,
  body: {filename},
  headers: {Authorization: token},
  json: true,
})
})
.then(signedRequest => {
// actual upload of the asset
let formData = signedRequest.fields
formData.file = {
  value: fs.createReadStream(assetPath),
  options: {
    filename,
    contentType: signedRequest.fields['Content-Type'],
  },
}
return rp({
  method: 'post',
  uri: signedRequest.post_url,
  formData,
}).then(() => {
  console.log(`'${filename}'`, uploaded)
  return Promise.resolve(signedRequest.pretty_url)
})
})
.catch(error => Promise.reject(error))
}