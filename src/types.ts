export type View = 'home' | 'catalogo' | 'admin'

export type AdditionalCategory = 'bouquet' | 'flower'
export type ProductCategory = 'limpiapipas' | 'details'

export type AdditionalOption = {
  id: number
  name: string
  description: string
  price: number
  category: AdditionalCategory
  is_active: boolean
  display_order: number
}

export type Product = {
  id: number
  name: string
  category: ProductCategory
  description: string
  includes: string
  price: number
  accent: string
  image_url: string | null
  color_options: string[]
  additional_options: AdditionalOption[]
  is_active?: boolean
  display_order?: number
}

export type SocialLink = {
  name: string
  href: string
  iconClass: string
  icon: import('react').ReactNode
}

export type Quantities = Record<number, number>

export type AdminUser = {
  id: number
  username: string
  email: string
  is_staff: boolean
}

export type ProductFormState = {
  id: number | null
  name: string
  category: ProductCategory
  description: string
  includes: string
  price: string
  accent: string
  is_active: boolean
  display_order: string
  color_option_names_text: string
  additional_option_ids: number[]
  image: File | null
  image_url: string | null
}

export type AdditionalFormState = {
  id: number | null
  name: string
  description: string
  price: string
  category: AdditionalCategory
  is_active: boolean
  display_order: string
}
