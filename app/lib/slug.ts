
import slugify from 'slugify'

export function createSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: 'es'
  })
}

export function generateUniqueSlug(base: string, existingSlugs: string[]): string {
  let slug = createSlug(base)
  let counter = 1
  
  while (existingSlugs.includes(slug)) {
    slug = `${createSlug(base)}-${counter}`
    counter++
  }
  
  return slug
}
