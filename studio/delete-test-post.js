import { getCliClient } from 'sanity/cli'

const client = getCliClient()

async function deleteTestPosts() {
  try {
    const posts = await client.fetch(`*[_type == "blogPost" && title match "测试文章"]`)
    console.log(`Found ${posts.length} test posts to delete:`, posts.map(p => p.title))
    
    for (const post of posts) {
      await client.delete(post._id)
      console.log(`Deleted post ID: ${post._id} (${post.title})`)
    }
  } catch (err) {
    console.error('Error deleting test posts:', err.message)
  }
}

deleteTestPosts()
