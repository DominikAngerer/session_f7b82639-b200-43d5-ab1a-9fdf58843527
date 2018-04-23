const api = require('./storyblokApi')
module.exports = () => {
  return api
  .getStories()
  .then(stories => {
    console.log(stories);

    let actions = stories.map(story => {
      
      console.log(story.id);
      return api.deleteStory(story.id)
    })

  })
}