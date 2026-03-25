import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import logoMakyp from './assets/Logomakyp.png'
import coverMakyp from './assets/makyp.jpeg'
import logoPdfImg from './assets/sinfondo.png'
import { legacyImageMap } from './catalogImages'
import {
  accentOptions,
  additionalCategoryLabels,
  createEmptyAdditionalForm,
  createEmptyProductForm,
  fallbackProducts,
  productCategoryLabels,
} from './fallbackCatalog'
import './App.css'
import type {
  AdditionalCategory,
  AdditionalFormState,
  AdditionalOption,
  AdminUser,
  Product,
  ProductCategory,
  ProductFormState,
  Quantities,
  SocialLink,
  View,
} from './types'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:8000'

const ACCESS_TOKEN_KEY = 'makyp_admin_access'
const REFRESH_TOKEN_KEY = 'makyp_admin_refresh'

const socialLinks: SocialLink[] = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/makyp_creations/',
    iconClass: 'instagram',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4.25" y="4.25" width="15.5" height="15.5" rx="4.5" />
        <circle cx="12" cy="12" r="3.45" />
        <circle cx="17.15" cy="6.9" r="1.05" />
      </svg>
    ),
  },
  {
    name: 'WhatsApp',
    href: 'https://wa.me/573203684500',
    iconClass: 'whatsapp',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 11.8a8 8 0 0 1-11.8 7.02L4 20l1.24-4.06A8 8 0 1 1 20 11.8Z" />
        <path d="M9.3 8.7c.12-.27.25-.3.47-.3h.4c.12 0 .3.04.38.24l.66 1.6c.06.14.05.26-.04.38l-.37.6c-.08.13-.05.24.01.34.15.25.66 1.05 1.58 1.44.27.12.4.1.54-.04l.64-.66c.1-.1.24-.14.38-.08l1.7.7c.17.07.26.17.28.27.03.1.03.61-.14.96-.17.36-.99.71-1.37.75-.35.04-.78.05-2.27-.54-1.8-.71-2.97-2.46-3.06-2.57-.08-.12-.73-.98-.73-1.86 0-.9.48-1.33.64-1.5Z" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@makyp_creations',
    iconClass: 'tiktok',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.76 4c.36 1.87 1.48 3.19 3.24 3.54v2.28a5.83 5.83 0 0 1-3.08-1.03v5.1c0 2.57-1.58 4.77-4.72 4.77A4.6 4.6 0 0 1 5.6 14.1a4.7 4.7 0 0 1 5.44-4.57v2.41a2.28 2.28 0 0 0-.72-.1 2.08 2.08 0 0 0-2.2 2.2 2.07 2.07 0 0 0 2.17 2.2c1.73 0 2.16-1.2 2.16-2.92V4h2.31Z" />
      </svg>
    ),
  },
]

const getViewFromHash = (): View => {
  const hash = window.location.hash

  if (hash.startsWith('#/catalogo')) {
    return 'catalogo'
  }

  if (hash.startsWith('#/admin')) {
    return 'admin'
  }

  return 'home'
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)

const imageUrlToDataUrl = async (url: string) => {
  const response = await fetch(url)
  const blob = await response.blob()

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

const getProductImage = (product: Product) =>
  product.image_url || legacyImageMap[product.name] || null

const getProductImageStyle = (productName: string) => {
  if (productName === 'Bouquet Liritu') {
    return {
      objectFit: 'cover' as const,
      objectPosition: 'center 84%',
    }
  }

  return undefined
}

const getColorOptionNames = (
  colorOptions: Array<string | { name: string }> | undefined,
) =>
  (colorOptions ?? [])
    .map((option) => (typeof option === 'string' ? option : option?.name ?? ''))
    .filter(Boolean)

const hydrateProductForm = (product?: Product): ProductFormState => {
  if (!product) {
    return createEmptyProductForm()
  }

  return {
    id: product.id,
    name: product.name,
    category: product.category,
    description: product.description,
    includes: product.includes,
    price: String(product.price),
    accent: product.accent,
    is_active: product.is_active ?? true,
    display_order: String(product.display_order ?? ''),
    color_option_names_text: getColorOptionNames(
      product.color_options as Array<string | { name: string }>,
    ).join(', '),
    additional_option_ids: product.additional_options.map((option) => option.id),
    image: null,
    image_url: product.image_url,
  }
}

const hydrateAdditionalForm = (option?: AdditionalOption): AdditionalFormState => {
  if (!option) {
    return createEmptyAdditionalForm()
  }

  return {
    id: option.id,
    name: option.name,
    description: option.description,
    price: String(option.price),
    category: option.category,
    is_active: option.is_active,
    display_order: String(option.display_order),
  }
}

function App() {
  const [view, setView] = useState<View>(getViewFromHash)
  const [products, setProducts] = useState<Product[]>(fallbackProducts)
  const [catalogSection, setCatalogSection] = useState<ProductCategory>('limpiapipas')
  const [catalogError, setCatalogError] = useState('')
  const [isCatalogLoading, setIsCatalogLoading] = useState(true)
  const [activeProductId, setActiveProductId] = useState<number | null>(null)
  const [selectedColor, setSelectedColor] = useState('')
  const [quantities, setQuantities] = useState<Quantities>({})

  const [accessToken, setAccessToken] = useState<string>(
    () => localStorage.getItem(ACCESS_TOKEN_KEY) ?? '',
  )
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [authError, setAuthError] = useState('')
  const [isAuthLoading, setIsAuthLoading] = useState(false)

  const [adminProducts, setAdminProducts] = useState<Product[]>([])
  const [adminAdditionalOptions, setAdminAdditionalOptions] = useState<AdditionalOption[]>(
    [],
  )
  const [dashboardError, setDashboardError] = useState('')
  const [isDashboardLoading, setIsDashboardLoading] = useState(false)
  const [isSavingProduct, setIsSavingProduct] = useState(false)
  const [isSavingAdditional, setIsSavingAdditional] = useState(false)
  const [adminSection, setAdminSection] = useState<'products' | 'details' | 'additionals'>(
    'products',
  )
  const [productForm, setProductForm] = useState<ProductFormState>(createEmptyProductForm())
  const [additionalForm, setAdditionalForm] = useState<AdditionalFormState>(
    createEmptyAdditionalForm(),
  )
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isAdditionalModalOpen, setIsAdditionalModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [successDialog, setSuccessDialog] = useState<{ title: string; message: string } | null>(
    null,
  )
  const [deleteDialog, setDeleteDialog] = useState<{
    kind: 'product' | 'additional'
    id: number
    title: string
    message: string
  } | null>(null)
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  const activeProduct =
    products.find((product) => product.id === activeProductId) ?? null

  useEffect(() => {
    const handleHashChange = () => {
      setView(getViewFromHash())
      setActiveProductId(null)
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    void loadPublicCatalog()
  }, [])

  useEffect(() => {
    if (!accessToken) {
      setAdminUser(null)
      return
    }

    void loadCurrentAdmin()
  }, [accessToken])

  useEffect(() => {
    if (!activeProduct) {
      setSelectedColor('')
      setQuantities({})
      return
    }

    setSelectedColor(activeProduct.color_options[0] ?? '')
    setQuantities({})
  }, [activeProduct])

  useEffect(() => {
    if (view === 'admin' && adminUser) {
      void loadAdminDashboard()
    }
  }, [view, adminUser])

  useEffect(() => {
    setActiveProductId(null)
  }, [catalogSection])

  const activeAdditionalGroups = useMemo(() => {
    if (!activeProduct) {
      return { bouquet: [], flower: [] } as Record<AdditionalCategory, AdditionalOption[]>
    }

    return {
      bouquet: activeProduct.additional_options.filter(
        (option) => option.is_active && option.category === 'bouquet',
      ),
      flower: activeProduct.additional_options.filter(
        (option) => option.is_active && option.category === 'flower',
      ),
    }
  }, [activeProduct])

  const selectedAdditionalRows = useMemo(() => {
    if (!activeProduct) {
      return []
    }

    return activeProduct.additional_options.filter((option) => (quantities[option.id] ?? 0) > 0)
  }, [activeProduct, quantities])

  const extrasTotal = useMemo(
    () =>
      selectedAdditionalRows.reduce(
        (total, option) => total + option.price * (quantities[option.id] ?? 0),
        0,
      ),
    [quantities, selectedAdditionalRows],
  )

  const orderTotal = activeProduct ? activeProduct.price + extrasTotal : 0

  const exportText = useMemo(() => {
    if (!activeProduct) {
      return ''
    }

    const lines = [
      'Pedido makyp_creations',
      `Producto: ${activeProduct.name}`,
      `Valor base: ${formatCurrency(activeProduct.price)}`,
    ]

    if (selectedColor) {
      lines.push(`Color elegido: ${selectedColor}`)
    }

    if (selectedAdditionalRows.length > 0) {
      lines.push('Adicionales:')
      selectedAdditionalRows.forEach((option) => {
        const quantity = quantities[option.id] ?? 0
        lines.push(
          `- ${option.name} x${quantity}: ${formatCurrency(option.price * quantity)}`,
        )
      })
    } else {
      lines.push('Adicionales: ninguno')
    }

    lines.push(`Total estimado: ${formatCurrency(orderTotal)}`)
    return lines.join('\n')
  }, [activeProduct, selectedColor, selectedAdditionalRows, quantities, orderTotal])

  const catalogProducts = useMemo(
    () =>
      [...products]
        .filter((product) => product.is_active ?? true)
        .filter((product) => product.category === catalogSection)
        .sort((first, second) => (first.display_order ?? 0) - (second.display_order ?? 0)),
    [catalogSection, products],
  )

  const adminProductsByCategory = useMemo(
    () => ({
      limpiapipas: adminProducts.filter((item) => item.category === 'limpiapipas'),
      details: adminProducts.filter((item) => item.category === 'details'),
    }),
    [adminProducts],
  )

  const groupedAdminAdditionalOptions = useMemo(
    () => ({
      bouquet: adminAdditionalOptions.filter((item) => item.category === 'bouquet'),
      flower: adminAdditionalOptions.filter((item) => item.category === 'flower'),
    }),
    [adminAdditionalOptions],
  )

  const currentAdminProductCategory: ProductCategory =
    adminSection === 'details' ? 'details' : 'limpiapipas'

  const currentAdminProducts =
    adminSection === 'additionals'
      ? []
      : adminProductsByCategory[currentAdminProductCategory]

  async function apiRequest<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
    const headers = new Headers(init?.headers)

    if (!(init?.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json')
    }

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })

    if (!response.ok) {
      const responseText = await response.text()
      throw new Error(responseText || 'No se pudo completar la solicitud.')
    }

    if (response.status === 204) {
      return undefined as T
    }

    return (await response.json()) as T
  }

  async function loadPublicCatalog() {
    setIsCatalogLoading(true)
    setCatalogError('')

    try {
      const apiProducts = await apiRequest<Product[]>('/api/catalog/products/')
      setProducts(apiProducts.length > 0 ? apiProducts : fallbackProducts)
    } catch {
      setProducts(fallbackProducts)
      setCatalogError(
        'Mostrando el catálogo base. Cuando el backend esté encendido, aquí aparecerán los cambios del panel admin.',
      )
    } finally {
      setIsCatalogLoading(false)
    }
  }

  async function loadCurrentAdmin() {
    try {
      const user = await apiRequest<AdminUser>('/api/auth/me/', undefined, accessToken)
      setAdminUser(user)
      setAuthError('')
    } catch {
      handleLogout()
    }
  }

  async function loadAdminDashboard() {
    setIsDashboardLoading(true)
    setDashboardError('')

    try {
      const data = await apiRequest<{
        products: Product[]
        additional_options: AdditionalOption[]
      }>('/api/admin/dashboard/', undefined, accessToken)

      setAdminProducts(data.products)
      setAdminAdditionalOptions(data.additional_options)
      setProductForm((current) =>
        current.id ? hydrateProductForm(data.products.find((item) => item.id === current.id)) : current,
      )
      setAdditionalForm((current) =>
        current.id
          ? hydrateAdditionalForm(
              data.additional_options.find((item) => item.id === current.id),
            )
          : current,
      )
    } catch {
      setDashboardError(
        'No pude cargar el panel admin. Revisa que el backend Django esté corriendo en localhost:8000.',
      )
    } finally {
      setIsDashboardLoading(false)
    }
  }

  function persistTokens(nextAccessToken: string, nextRefreshToken: string) {
    setAccessToken(nextAccessToken)
    localStorage.setItem(ACCESS_TOKEN_KEY, nextAccessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, nextRefreshToken)
  }

  function handleLogout() {
    setAccessToken('')
    setAdminUser(null)
    setIsAdminMenuOpen(false)
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }

  function openCreateProductModal() {
    setProductForm({
      ...createEmptyProductForm(),
      category: adminSection === 'details' ? 'details' : 'limpiapipas',
    })
    setIsProductModalOpen(true)
  }

  function openEditProductModal(product: Product) {
    setProductForm(hydrateProductForm(product))
    setIsProductModalOpen(true)
  }

  function openCreateAdditionalModal() {
    setAdditionalForm(createEmptyAdditionalForm())
    setIsAdditionalModalOpen(true)
  }

  function openEditAdditionalModal(option: AdditionalOption) {
    setAdditionalForm(hydrateAdditionalForm(option))
    setIsAdditionalModalOpen(true)
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsAuthLoading(true)
    setAuthError('')

    try {
      const data = await apiRequest<{ access: string; refresh: string; user: AdminUser }>(
        '/api/auth/login/',
        {
          method: 'POST',
          body: JSON.stringify(loginForm),
        },
      )

      persistTokens(data.access, data.refresh)
      setAdminUser(data.user)
      setLoginForm({ username: '', password: '' })
      window.location.hash = '#/admin'
    } catch {
      setAuthError('No pudimos iniciar sesión. Revisa usuario y contraseña.')
    } finally {
      setIsAuthLoading(false)
    }
  }

  function toggleProductAdditional(optionId: number) {
    setProductForm((current) => ({
      ...current,
      additional_option_ids: current.additional_option_ids.includes(optionId)
        ? current.additional_option_ids.filter((id) => id !== optionId)
        : [...current.additional_option_ids, optionId],
    }))
  }

  function handleProductFieldChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const target = event.target
    const { name, value } = target

    setProductForm((current) => ({
      ...current,
      [name]:
        target instanceof HTMLInputElement && target.type === 'checkbox'
          ? target.checked
          : value,
    }))
  }

  function handleAdditionalFieldChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const target = event.target
    const { name, value } = target

    setAdditionalForm((current) => ({
      ...current,
      [name]:
        target instanceof HTMLInputElement && target.type === 'checkbox'
          ? target.checked
          : value,
    }))
  }

  function handleProductImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setProductForm((current) => ({ ...current, image: file }))
  }

  async function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSavingProduct(true)
    setDashboardError('')

    try {
      const formData = new FormData()
      const colors = productForm.color_option_names_text
        .split(/[,\n]/)
        .map((value) => value.trim())
        .filter(Boolean)

      formData.append('name', productForm.name)
      formData.append('category', productForm.category)
      formData.append('description', productForm.description)
      formData.append('includes', productForm.includes)
      formData.append('price', productForm.price || '0')
      formData.append('accent', productForm.accent)
      formData.append('is_active', String(productForm.is_active))
      formData.append('display_order', productForm.display_order || '0')
      formData.append('color_option_names', JSON.stringify(colors))
      formData.append(
        'additional_option_ids',
        JSON.stringify(productForm.additional_option_ids),
      )

      if (productForm.image) {
        formData.append('image', productForm.image)
      }

      const path = productForm.id
        ? `/api/admin/products/${productForm.id}/`
        : '/api/admin/products/'

      await apiRequest(
        path,
        {
          method: productForm.id ? 'PUT' : 'POST',
          body: formData,
        },
        accessToken,
      )

      setProductForm(createEmptyProductForm())
      setIsProductModalOpen(false)
      await loadAdminDashboard()
      await loadPublicCatalog()
      setSuccessDialog({
        title: productForm.id ? 'Producto actualizado' : 'Producto creado',
        message: productForm.id
          ? 'Los cambios del producto se guardaron correctamente en el catálogo.'
          : 'El nuevo producto ya quedó guardado y disponible en el panel.',
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No pude guardar el producto. Revisa los datos e intenta otra vez.'
      setDashboardError(message)
    } finally {
      setIsSavingProduct(false)
    }
  }

  function requestDeleteProduct(productId: number) {
    setDeleteDialog({
      kind: 'product',
      id: productId,
      title: 'Eliminar producto',
      message: 'Esta acción eliminará el producto del panel y del catálogo público.',
    })
  }

  function requestDeleteAdditional(optionId: number) {
    setDeleteDialog({
      kind: 'additional',
      id: optionId,
      title: 'Eliminar adicional',
      message: 'Esta acción eliminará el adicional y dejará de estar disponible para los productos.',
    })
  }

  async function executeDeleteProduct(productId: number) {
    try {
      await apiRequest(`/api/admin/products/${productId}/`, { method: 'DELETE' }, accessToken)
      setProductForm(createEmptyProductForm())
      await loadAdminDashboard()
      await loadPublicCatalog()
      setSuccessDialog({
        title: 'Producto eliminado',
        message: 'El producto fue eliminado correctamente del catálogo.',
      })
    } catch {
      setDashboardError('No pude eliminar el producto.')
    }
  }

  async function executeDeleteAdditional(optionId: number) {
    try {
      await apiRequest(
        `/api/admin/additional-options/${optionId}/`,
        { method: 'DELETE' },
        accessToken,
      )
      setAdditionalForm(createEmptyAdditionalForm())
      await loadAdminDashboard()
      await loadPublicCatalog()
      setSuccessDialog({
        title: 'Adicional eliminado',
        message: 'El adicional fue eliminado correctamente.',
      })
    } catch {
      setDashboardError('No pude eliminar el adicional.')
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteDialog) {
      return
    }

    const currentDialog = deleteDialog
    setDeleteDialog(null)

    if (currentDialog.kind === 'product') {
      await executeDeleteProduct(currentDialog.id)
      return
    }

    await executeDeleteAdditional(currentDialog.id)
  }

  async function handleDeleteProduct(productId: number) {
    if (!window.confirm('¿Seguro que quieres eliminar este producto?')) {
      return
    }

    try {
      await apiRequest(`/api/admin/products/${productId}/`, { method: 'DELETE' }, accessToken)
      setProductForm(createEmptyProductForm())
      await loadAdminDashboard()
      await loadPublicCatalog()
    } catch {
      setDashboardError('No pude eliminar el producto.')
    }
  }

  async function handleAdditionalSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSavingAdditional(true)
    setDashboardError('')

    try {
      const payload = {
        name: additionalForm.name,
        description: additionalForm.description,
        price: Number(additionalForm.price || 0),
        category: additionalForm.category,
        is_active: additionalForm.is_active,
        display_order: Number(additionalForm.display_order || 0),
      }

      const path = additionalForm.id
        ? `/api/admin/additional-options/${additionalForm.id}/`
        : '/api/admin/additional-options/'

      await apiRequest(
        path,
        {
          method: additionalForm.id ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        },
        accessToken,
      )

      setAdditionalForm(createEmptyAdditionalForm())
      setIsAdditionalModalOpen(false)
      await loadAdminDashboard()
      await loadPublicCatalog()
      setSuccessDialog({
        title: additionalForm.id ? 'Adicional actualizado' : 'Adicional creado',
        message: additionalForm.id
          ? 'Los cambios del adicional se guardaron correctamente.'
          : 'El nuevo adicional ya quedó guardado en el catálogo.',
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No pude guardar el adicional.'
      setDashboardError(message)
    } finally {
      setIsSavingAdditional(false)
    }
  }

  async function handleDeleteAdditional(optionId: number) {
    if (!window.confirm('¿Seguro que quieres eliminar este adicional?')) {
      return
    }

    try {
      await apiRequest(
        `/api/admin/additional-options/${optionId}/`,
        { method: 'DELETE' },
        accessToken,
      )
      setAdditionalForm(createEmptyAdditionalForm())
      await loadAdminDashboard()
      await loadPublicCatalog()
    } catch {
      setDashboardError('No pude eliminar el adicional.')
    }
  }

  void handleDeleteProduct
  void handleDeleteAdditional

  function updateQuantity(optionId: number, nextValue: number) {
    setQuantities((current) => ({
      ...current,
      [optionId]: Math.max(0, nextValue),
    }))
  }

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSavingPassword(true)
    setPasswordError('')
    setPasswordSuccess('')

    try {
      const data = await apiRequest<{ detail: string }>(
        '/api/auth/change-password/',
        {
          method: 'POST',
          body: JSON.stringify(passwordForm),
        },
        accessToken,
      )

      setPasswordSuccess(data.detail)
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      })
      setIsPasswordModalOpen(false)
      setPasswordSuccess('')
      setSuccessDialog({
        title: 'Contraseña actualizada',
        message: 'Tu contraseña se cambió correctamente y la cuenta sigue activa.',
      })
    } catch {
      setPasswordError('No pude cambiar la contraseña. Revisa los datos e intenta de nuevo.')
    } finally {
      setIsSavingPassword(false)
    }
  }

  async function downloadOrder() {
    if (!activeProduct || !exportText) {
      return
    }

    const { default: jsPDF } = await import('jspdf')

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 16
    let y = 22

    pdf.setFillColor(252, 245, 251)
    pdf.rect(0, 0, pageWidth, pageHeight, 'F')

    pdf.setFillColor(236, 219, 249)
    pdf.circle(22, 18, 12, 'F')
    pdf.setFillColor(244, 197, 223)
    pdf.circle(pageWidth - 20, 26, 16, 'F')

    pdf.setDrawColor(215, 189, 234)
    pdf.setLineWidth(0.5)
    pdf.roundedRect(margin, 12, pageWidth - margin * 2, pageHeight - 24, 8, 8)

    pdf.setTextColor(145, 91, 185)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(22)
    pdf.text('Pedido makyp_creations', margin + 4, y)

    try {
      const logoData = await imageUrlToDataUrl(logoPdfImg)
      pdf.addImage(logoData, 'PNG', pageWidth - 54, 8, 28, 34)
    } catch {
      // ignore logo errors
    }

    y += 8

    pdf.setTextColor(126, 101, 147)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    pdf.text('Resumen estimado del pedido', margin + 4, y)
    y += 10

    try {
      const imageSource = getProductImage(activeProduct)
      if (!imageSource) {
        throw new Error('No image')
      }
      const imageData = await imageUrlToDataUrl(imageSource)
      pdf.addImage(imageData, 'PNG', margin + 4, y, 56, 56)
    } catch {
      pdf.setFillColor(245, 234, 252)
      pdf.roundedRect(margin + 4, y, 56, 56, 6, 6, 'F')
      pdf.setTextColor(145, 122, 164)
      pdf.setFontSize(10)
      pdf.text('Foto no disponible', margin + 13, y + 30)
    }

    const detailX = margin + 66
    let detailY = y + 10

    pdf.setTextColor(103, 70, 132)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(18)
    pdf.text(activeProduct.name, detailX, detailY, { maxWidth: 110 })
    detailY += 12

    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(143, 88, 180)
    pdf.text(`Valor base: ${formatCurrency(activeProduct.price)}`, detailX, detailY)

    y += 66

    pdf.setFillColor(255, 255, 255)
    pdf.roundedRect(margin + 4, y, pageWidth - (margin + 4) * 2, 34, 5, 5, 'F')
    pdf.setDrawColor(226, 208, 238)
    pdf.roundedRect(margin + 4, y, pageWidth - (margin + 4) * 2, 34, 5, 5)

    pdf.setTextColor(106, 72, 138)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.text('Incluye', margin + 10, y + 8)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    const includesLines = pdf.splitTextToSize(activeProduct.includes, pageWidth - 40)
    pdf.text(includesLines, margin + 10, y + 15)

    y += 44

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(12)
    pdf.setTextColor(123, 78, 156)
    pdf.text('Detalle del pedido', margin + 4, y)
    y += 8

    const rows: Array<[string, string]> = [['Producto', activeProduct.name]]

    if (selectedColor) {
      rows.push(['Color', selectedColor])
    }

    rows.push(['Valor base', formatCurrency(activeProduct.price)])

    selectedAdditionalRows.forEach((option) => {
      const quantity = quantities[option.id] ?? 0
      rows.push([`${option.name} x${quantity}`, formatCurrency(option.price * quantity)])
    })

    if (selectedAdditionalRows.length === 0) {
      rows.push(['Adicionales', 'Ninguno'])
    }

    rows.push(['Total estimado', formatCurrency(orderTotal)])

    rows.forEach(([label, value], index) => {
      const rowTop = y + index * 10
      const isTotal = index === rows.length - 1

      pdf.setFillColor(isTotal ? 240 : 255, isTotal ? 231 : 255, isTotal ? 248 : 255)
      pdf.roundedRect(margin + 4, rowTop - 5, pageWidth - (margin + 4) * 2, 8, 3, 3, 'F')

      pdf.setFont('helvetica', isTotal ? 'bold' : 'normal')
      pdf.setTextColor(isTotal ? 143 : 110, isTotal ? 88 : 92, isTotal ? 180 : 132)
      pdf.text(label, margin + 10, rowTop)
      pdf.text(value, pageWidth - margin - 10, rowTop, { align: 'right' })
    })

    pdf.save(`${activeProduct.name.toLowerCase().replace(/\s+/g, '-')}-pedido.pdf`)
  }

  if (view === 'admin') {
    return (
      <main className="page page--admin">
        <section className="admin-shell">
          <div className="admin-shell__header">
            <div>
              <p className="catalog-brand">makyp_creations</p>
              <h1>Panel administrativo</h1>
              <p className="catalog-copy">
                Desde aquí puedes iniciar sesión, crear productos, editar los
                existentes y manejar los adicionales del catálogo.
              </p>
            </div>

            <div className="admin-shell__actions">
              <a className="ghost-link" href="#/catalogo">
                Ver catálogo
              </a>
              <a className="ghost-link" href="#/">
                Inicio
              </a>
              {adminUser ? (
                <div className="admin-account">
                  <button
                    className="admin-profile-trigger"
                    type="button"
                    onClick={() => setIsAdminMenuOpen((current) => !current)}
                    aria-label="Abrir opciones de cuenta"
                  >
                    <img src={logoMakyp} alt="Logo de makyp_creations" />
                  </button>

                  {isAdminMenuOpen ? (
                    <div className="admin-profile-menu">
                      <button
                        type="button"
                        onClick={() => {
                          setIsPasswordModalOpen(true)
                          setIsAdminMenuOpen(false)
                        }}
                      >
                        Cambiar contraseña
                      </button>
                      <button type="button" onClick={handleLogout}>
                        Cerrar sesión
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          {!adminUser ? (
            <section className="admin-login-card">
              <div className="admin-login-card__side">
                <img src={logoPdfImg} alt="Logo de makyp_creations" />
                <h2>Acceso admin</h2>
                <p>
                  Inicia sesión para editar el catálogo sin volver a tocar el
                  código.
                </p>
              </div>

              <form className="admin-login-form" onSubmit={handleLogin}>
                <label>
                  Usuario
                  <input
                    name="username"
                    type="text"
                    value={loginForm.username}
                    onChange={(event) =>
                      setLoginForm((current) => ({
                        ...current,
                        username: event.target.value,
                      }))
                    }
                    placeholder="admin"
                    required
                  />
                </label>

                <label>
                  Contraseña
                  <input
                    name="password"
                    type="password"
                    value={loginForm.password}
                    onChange={(event) =>
                      setLoginForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    placeholder="Tu contraseña"
                    required
                  />
                </label>

                {authError ? <p className="form-error">{authError}</p> : null}

                <button className="primary-button" type="submit" disabled={isAuthLoading}>
                  {isAuthLoading ? 'Ingresando...' : 'Entrar al panel'}
                </button>
              </form>
            </section>
          ) : (
            <>
              <section className="admin-summary-strip">
                <article className="admin-summary-pill">
                  <span>Productos visibles</span>
                  <strong>{adminProducts.filter((item) => item.is_active).length}</strong>
                </article>
                <article className="admin-summary-pill">
                  <span>Adicionales registrados</span>
                  <strong>{adminAdditionalOptions.length}</strong>
                </article>
                <article className="admin-summary-pill">
                  <span>Sesión activa</span>
                  <strong>{adminUser?.username}</strong>
                </article>
              </section>

              {dashboardError ? <p className="form-error">{dashboardError}</p> : null}

              <section className="admin-workspace">
                <div className="admin-tabs" role="tablist" aria-label="Secciones de gesti?n">
                  <button
                    className={`admin-tab ${adminSection === 'products' ? 'admin-tab--active' : ''}`}
                    type="button"
                    role="tab"
                    aria-selected={adminSection === 'products'}
                    onClick={() => setAdminSection('products')}
                  >
                    Productos
                  </button>
                  <button
                    className={`admin-tab ${adminSection === 'details' ? 'admin-tab--active' : ''}`}
                    type="button"
                    role="tab"
                    aria-selected={adminSection === 'details'}
                    onClick={() => setAdminSection('details')}
                  >
                    Detalles
                  </button>
                  <button
                    className={`admin-tab ${adminSection === 'additionals' ? 'admin-tab--active' : ''}`}
                    type="button"
                    role="tab"
                    aria-selected={adminSection === 'additionals'}
                    onClick={() => setAdminSection('additionals')}
                  >
                    Adicionales
                  </button>
                </div>

                {adminSection === 'additionals' ? (
                  <div className="admin-panel">
                    <div className="admin-panel__heading">
                      <div>
                        <p className="section-kicker">Adicionales</p>
                        <h2>Gestiona los extras</h2>
                        <p className="catalog-copy">
                          Separa y organiza todo lo que puedes sumar a cada arreglo.
                        </p>
                      </div>

                      <button className="primary-button admin-inline-button" type="button" onClick={openCreateAdditionalModal}>
                        Crear adicional
                      </button>
                    </div>

                    <div className="admin-card-grid admin-card-grid--compact">
                      {(['bouquet', 'flower'] as AdditionalCategory[]).map((category) => (
                        <section className="admin-subpanel" key={category}>
                          <div className="admin-subpanel__header">
                            <h3>{additionalCategoryLabels[category]}</h3>
                            <span>{groupedAdminAdditionalOptions[category].length} items</span>
                          </div>

                          <div className="admin-list admin-list--cards">
                            {groupedAdminAdditionalOptions[category].map((option) => (
                              <article className="admin-list-card" key={option.id}>
                                <div className="admin-list-card__main">
                                  <p className="section-kicker">{formatCurrency(option.price)}</p>
                                  <strong>{option.name}</strong>
                                  <span>{option.description}</span>
                                </div>

                                <div className="admin-list-card__actions">
                                  <button
                                    className="ghost-button admin-inline-button admin-inline-button--soft"
                                    type="button"
                                    onClick={() => openEditAdditionalModal(option)}
                                  >
                                    Editar
                                  </button>

                                  <button
                                    className="danger-link"
                                    type="button"
                                    onClick={() => requestDeleteAdditional(option.id)}
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </article>
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="admin-panel">
                    <div className="admin-panel__heading">
                      <div>
                        <p className="section-kicker">{productCategoryLabels[currentAdminProductCategory]}</p>
                        <h2>
                          {adminSection === 'details'
                            ? 'Gestiona la secci?n de detalles'
                            : 'Gestiona los productos de limpiapipas'}
                        </h2>
                        <p className="catalog-copy">
                          Crea, edita y organiza los productos que se mostrar?n en esta pesta?a p?blica.
                        </p>
                      </div>

                      <button className="primary-button admin-inline-button" type="button" onClick={openCreateProductModal}>
                        {adminSection === 'details' ? 'Crear detalle' : 'Crear producto'}
                      </button>
                    </div>

                    <div className="admin-card-grid">
                      {isDashboardLoading ? (
                        <p className="empty-copy">Cargando productos...</p>
                      ) : currentAdminProducts.length === 0 ? (
                        <div className="empty-admin-state">
                          <p className="section-kicker">{productCategoryLabels[currentAdminProductCategory]}</p>
                          <h3>A?n no hay elementos en esta secci?n.</h3>
                          <p>Cuando crees uno, aparecer? aqu? con sus adicionales y opciones de color.</p>
                        </div>
                      ) : (
                        currentAdminProducts.map((product) => (
                          <article className="admin-product-card" key={product.id}>
                            <div className="admin-product-card__photo">
                              {getProductImage(product) ? (
                                <img
                                  src={getProductImage(product)!}
                                  alt={product.name}
                                  style={getProductImageStyle(product.name)}
                                />
                              ) : (
                                <div className="photo-fallback">Sin imagen</div>
                              )}
                            </div>

                            <div className="admin-product-card__content">
                              <p className="section-kicker">
                                {product.is_active ? 'Visible en cat?logo' : 'Oculto del cat?logo'}
                              </p>
                              <h3 className="admin-product-card__title">{product.name}</h3>
                              <p>{product.description}</p>

                              <div className="admin-chip-row">
                                <span className="admin-muted-chip">{formatCurrency(product.price)}</span>
                                <span className="admin-muted-chip">{product.color_options.length} colores</span>
                                <span className="admin-muted-chip">
                                  {product.additional_options.length} adicionales
                                </span>
                              </div>

                              <div className="admin-product-card__footer">
                                <button
                                  className="primary-button admin-inline-button"
                                  type="button"
                                  onClick={() => openEditProductModal(product)}
                                >
                                  Editar
                                </button>

                                <button
                                  className="danger-link"
                                  type="button"
                                  onClick={() => requestDeleteProduct(product.id)}
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          </article>
                        ))
                      )}
                    </div>
                  </div>
                )}
                {isProductModalOpen ? (
                  <div className="modal-backdrop" role="presentation">
                    <section className="admin-modal" role="dialog" aria-modal="true">
                      <button
                        className="modal-close"
                        type="button"
                        onClick={() => setIsProductModalOpen(false)}
                        aria-label="Cerrar"
                      />
                      <div className="admin-modal__body">
                        <p className="section-kicker">Producto</p>
                        <h2>{productForm.id ? 'Editar producto' : 'Nuevo producto'}</h2>
                        <p className="admin-form-note">
                          Se guardará en: {productCategoryLabels[productForm.category]}
                        </p>
                        <form className="admin-form" onSubmit={handleProductSubmit}>
                          <div className="form-grid">
                            <label>
                              Nombre
                              <input
                                name="name"
                                value={productForm.name}
                                onChange={handleProductFieldChange}
                                required
                              />
                            </label>

                            <label>
                              Precio base
                              <input
                                name="price"
                                type="number"
                                min="0"
                                value={productForm.price}
                                onChange={handleProductFieldChange}
                                required
                              />
                            </label>

                            <label>
                              Orden
                              <input
                                name="display_order"
                                type="number"
                                min="0"
                                value={productForm.display_order}
                                onChange={handleProductFieldChange}
                              />
                            </label>

                            <label>
                              Acento visual
                              <select
                                name="accent"
                                value={productForm.accent}
                                onChange={handleProductFieldChange}
                              >
                                {accentOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>

                          <label>
                            Descripción
                            <textarea
                              name="description"
                              rows={3}
                              value={productForm.description}
                              onChange={handleProductFieldChange}
                            />
                          </label>

                          <label>
                            Incluye
                            <textarea
                              name="includes"
                              rows={4}
                              value={productForm.includes}
                              onChange={handleProductFieldChange}
                            />
                          </label>

                          <label>
                            Colores disponibles
                            <input
                              name="color_option_names_text"
                              value={productForm.color_option_names_text}
                              onChange={handleProductFieldChange}
                              placeholder="Rosa, Morado, Azul, Amarillo"
                            />
                          </label>

                          <label>
                            Imagen del producto
                            <input type="file" accept="image/*" onChange={handleProductImageChange} />
                          </label>

                          {productForm.image_url || productForm.image ? (
                            <div className="image-preview">
                              <img
                                src={
                                  productForm.image
                                    ? URL.createObjectURL(productForm.image!)
                                    : productForm.image_url || ''
                                }
                                alt="Vista previa"
                              />
                            </div>
                          ) : null}

                          <label className="checkbox-row">
                            <input
                              name="is_active"
                              type="checkbox"
                              checked={productForm.is_active}
                              onChange={handleProductFieldChange}
                            />
                            Mostrar producto en el catálogo
                          </label>

                          <div className="option-groups">
                            {(['bouquet', 'flower'] as AdditionalCategory[]).map((category) => (
                              <div className="option-group" key={category}>
                                <h3>{additionalCategoryLabels[category]}</h3>
                                <div className="checkbox-grid">
                                  {groupedAdminAdditionalOptions[category].map((option) => (
                                    <label className="choice-card" key={option.id}>
                                      <input
                                        type="checkbox"
                                        checked={productForm.additional_option_ids.includes(option.id)}
                                        onChange={() => toggleProductAdditional(option.id)}
                                      />
                                      <span>
                                        <strong>{option.name}</strong>
                                        <small>{formatCurrency(option.price)}</small>
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>

                          <button className="primary-button" type="submit" disabled={isSavingProduct}>
                            {isSavingProduct
                              ? 'Guardando producto...'
                              : productForm.id
                                ? 'Actualizar producto'
                                : 'Crear producto'}
                          </button>
                        </form>
                      </div>
                    </section>
                  </div>
                ) : null}

                {isAdditionalModalOpen ? (
                  <div className="modal-backdrop" role="presentation">
                    <section className="admin-modal admin-modal--narrow" role="dialog" aria-modal="true">
                      <button
                        className="modal-close"
                        type="button"
                        onClick={() => setIsAdditionalModalOpen(false)}
                        aria-label="Cerrar"
                      />
                      <div className="admin-modal__body">
                        <p className="section-kicker">Adicional</p>
                        <h2>{additionalForm.id ? 'Editar adicional' : 'Nuevo adicional'}</h2>
                        <form className="admin-form" onSubmit={handleAdditionalSubmit}>
                          <div className="form-grid">
                            <label>
                              Nombre
                              <input
                                name="name"
                                value={additionalForm.name}
                                onChange={handleAdditionalFieldChange}
                                required
                              />
                            </label>

                            <label>
                              Precio
                              <input
                                name="price"
                                type="number"
                                min="0"
                                value={additionalForm.price}
                                onChange={handleAdditionalFieldChange}
                                required
                              />
                            </label>

                            <label>
                              Orden
                              <input
                                name="display_order"
                                type="number"
                                min="0"
                                value={additionalForm.display_order}
                                onChange={handleAdditionalFieldChange}
                              />
                            </label>

                            <label>
                              Categoría
                              <select
                                name="category"
                                value={additionalForm.category}
                                onChange={handleAdditionalFieldChange}
                              >
                                <option value="bouquet">Ramo</option>
                                <option value="flower">Flor individual</option>
                              </select>
                            </label>
                          </div>

                          <label>
                            Descripción
                            <textarea
                              name="description"
                              rows={3}
                              value={additionalForm.description}
                              onChange={handleAdditionalFieldChange}
                            />
                          </label>

                          <label className="checkbox-row">
                            <input
                              name="is_active"
                              type="checkbox"
                              checked={additionalForm.is_active}
                              onChange={handleAdditionalFieldChange}
                            />
                            Mostrar adicional en el catálogo
                          </label>

                          <button
                            className="primary-button"
                            type="submit"
                            disabled={isSavingAdditional}
                          >
                            {isSavingAdditional
                              ? 'Guardando adicional...'
                              : additionalForm.id
                                ? 'Actualizar adicional'
                                : 'Crear adicional'}
                          </button>
                        </form>
                      </div>
                    </section>
                  </div>
                ) : null}
              </section>

              {false ? (
                <>
              <section className="admin-summary-grid">
                <article className="admin-summary-card">
                  <span>Productos activos</span>
                  <strong>{adminProducts.filter((item) => item.is_active).length}</strong>
                </article>
                <article className="admin-summary-card">
                  <span>Adicionales</span>
                  <strong>{adminAdditionalOptions.length}</strong>
                </article>
                <article className="admin-summary-card">
                  <span>Usuario</span>
                  <strong>{adminUser?.username}</strong>
                </article>
              </section>

              {dashboardError ? <p className="form-error">{dashboardError}</p> : null}

              <section className="admin-grid">
                <div className="admin-panel">
                  <div className="admin-panel__heading">
                    <div>
                      <p className="section-kicker">Productos</p>
                      <h2>Gestiona el catálogo</h2>
                    </div>

                    <button className="ghost-button" type="button" onClick={openCreateProductModal}>
                      Nuevo producto
                    </button>
                  </div>

                  <div className="admin-list">
                    {isDashboardLoading ? (
                      <p className="empty-copy">Cargando productos...</p>
                    ) : (
                      adminProducts.map((product) => (
                        <article
                          className={`admin-list-card ${
                            productForm.id === product.id ? 'admin-list-card--active' : ''
                          }`}
                          key={product.id}
                        >
                          <button
                            className="admin-list-card__button"
                            type="button"
                            onClick={() => openEditProductModal(product)}
                          >
                            <div>
                              <strong>{product.name}</strong>
                              <span>{formatCurrency(product.price)}</span>
                            </div>
                            <small>{product.is_active ? 'Activo' : 'Oculto'}</small>
                          </button>

                          <button
                            className="danger-link"
                            type="button"
                            onClick={() => requestDeleteProduct(product.id)}
                          >
                            Eliminar
                          </button>
                        </article>
                      ))
                    )}
                  </div>

                  {isProductModalOpen ? (
                    <div className="modal-backdrop" role="presentation">
                      <section className="admin-modal" role="dialog" aria-modal="true">
                        <button
                          className="modal-close"
                          type="button"
                          onClick={() => setIsProductModalOpen(false)}
                          aria-label="Cerrar"
                        />
                        <div className="admin-modal__body">
                          <p className="section-kicker">Producto</p>
                          <h2>{productForm.id ? 'Editar producto' : 'Nuevo producto'}</h2>
                          <form className="admin-form" onSubmit={handleProductSubmit}>
                    <div className="form-grid">
                      <label>
                        Nombre
                        <input
                          name="name"
                          value={productForm.name}
                          onChange={handleProductFieldChange}
                          required
                        />
                      </label>

                      <label>
                        Precio base
                        <input
                          name="price"
                          type="number"
                          min="0"
                          value={productForm.price}
                          onChange={handleProductFieldChange}
                          required
                        />
                      </label>

                      <label>
                        Orden
                        <input
                          name="display_order"
                          type="number"
                          min="0"
                          value={productForm.display_order}
                          onChange={handleProductFieldChange}
                        />
                      </label>

                      <label>
                        Acento visual
                        <select
                          name="accent"
                          value={productForm.accent}
                          onChange={handleProductFieldChange}
                        >
                          {accentOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label>
                      Descripción
                      <textarea
                        name="description"
                        rows={3}
                        value={productForm.description}
                        onChange={handleProductFieldChange}
                      />
                    </label>

                    <label>
                      Incluye
                      <textarea
                        name="includes"
                        rows={4}
                        value={productForm.includes}
                        onChange={handleProductFieldChange}
                      />
                    </label>

                    <label>
                      Colores disponibles
                      <input
                        name="color_option_names_text"
                        value={productForm.color_option_names_text}
                        onChange={handleProductFieldChange}
                        placeholder="Rosa, Morado, Azul, Amarillo"
                      />
                    </label>

                    <label>
                      Imagen del producto
                      <input type="file" accept="image/*" onChange={handleProductImageChange} />
                    </label>

                    {productForm.image_url || productForm.image ? (
                      <div className="image-preview">
                        <img
                          src={
                            productForm.image
                              ? URL.createObjectURL(productForm.image!)
                              : productForm.image_url || ''
                          }
                          alt="Vista previa"
                        />
                      </div>
                    ) : null}

                    <label className="checkbox-row">
                      <input
                        name="is_active"
                        type="checkbox"
                        checked={productForm.is_active}
                        onChange={handleProductFieldChange}
                      />
                      Mostrar producto en el catálogo
                    </label>

                    <div className="option-groups">
                      {(['bouquet', 'flower'] as AdditionalCategory[]).map((category) => (
                        <div className="option-group" key={category}>
                          <h3>{additionalCategoryLabels[category]}</h3>
                          <div className="checkbox-grid">
                            {groupedAdminAdditionalOptions[category].map((option) => (
                              <label className="choice-card" key={option.id}>
                                <input
                                  type="checkbox"
                                  checked={productForm.additional_option_ids.includes(option.id)}
                                  onChange={() => toggleProductAdditional(option.id)}
                                />
                                <span>
                                  <strong>{option.name}</strong>
                                  <small>{formatCurrency(option.price)}</small>
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button className="primary-button" type="submit" disabled={isSavingProduct}>
                      {isSavingProduct
                        ? 'Guardando producto...'
                        : productForm.id
                          ? 'Actualizar producto'
                          : 'Crear producto'}
                    </button>
                          </form>
                        </div>
                      </section>
                    </div>
                  ) : null}
                </div>

                <div className="admin-panel">
                  <div className="admin-panel__heading">
                    <div>
                      <p className="section-kicker">Adicionales</p>
                      <h2>Configura los extras</h2>
                    </div>

                    <button className="ghost-button" type="button" onClick={openCreateAdditionalModal}>
                      Nuevo adicional
                    </button>
                  </div>

                  <div className="option-groups">
                    {(['bouquet', 'flower'] as AdditionalCategory[]).map((category) => (
                      <div className="option-group" key={category}>
                        <h3>{additionalCategoryLabels[category]}</h3>

                        <div className="admin-list">
                          {groupedAdminAdditionalOptions[category].map((option) => (
                            <article
                              className={`admin-list-card ${
                                additionalForm.id === option.id ? 'admin-list-card--active' : ''
                              }`}
                              key={option.id}
                            >
                              <button
                                className="admin-list-card__button"
                                type="button"
                                onClick={() => openEditAdditionalModal(option)}
                              >
                                <div>
                                  <strong>{option.name}</strong>
                                  <span>{formatCurrency(option.price)}</span>
                                </div>
                                <small>{option.is_active ? 'Activo' : 'Oculto'}</small>
                              </button>

                              <button
                                className="danger-link"
                                type="button"
                                onClick={() => requestDeleteAdditional(option.id)}
                              >
                                Eliminar
                              </button>
                            </article>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {isAdditionalModalOpen ? (
                    <div className="modal-backdrop" role="presentation">
                      <section className="admin-modal admin-modal--narrow" role="dialog" aria-modal="true">
                        <button
                          className="modal-close"
                          type="button"
                          onClick={() => setIsAdditionalModalOpen(false)}
                          aria-label="Cerrar"
                        />
                        <div className="admin-modal__body">
                          <p className="section-kicker">Adicional</p>
                          <h2>{additionalForm.id ? 'Editar adicional' : 'Nuevo adicional'}</h2>
                          <form className="admin-form" onSubmit={handleAdditionalSubmit}>
                    <div className="form-grid">
                      <label>
                        Nombre
                        <input
                          name="name"
                          value={additionalForm.name}
                          onChange={handleAdditionalFieldChange}
                          required
                        />
                      </label>

                      <label>
                        Precio
                        <input
                          name="price"
                          type="number"
                          min="0"
                          value={additionalForm.price}
                          onChange={handleAdditionalFieldChange}
                          required
                        />
                      </label>

                      <label>
                        Orden
                        <input
                          name="display_order"
                          type="number"
                          min="0"
                          value={additionalForm.display_order}
                          onChange={handleAdditionalFieldChange}
                        />
                      </label>

                      <label>
                        Categoría
                        <select
                          name="category"
                          value={additionalForm.category}
                          onChange={handleAdditionalFieldChange}
                        >
                          <option value="bouquet">Ramo</option>
                          <option value="flower">Flor individual</option>
                        </select>
                      </label>
                    </div>

                    <label>
                      Descripción
                      <textarea
                        name="description"
                        rows={3}
                        value={additionalForm.description}
                        onChange={handleAdditionalFieldChange}
                      />
                    </label>

                    <label className="checkbox-row">
                      <input
                        name="is_active"
                        type="checkbox"
                        checked={additionalForm.is_active}
                        onChange={handleAdditionalFieldChange}
                      />
                      Mostrar adicional en el catálogo
                    </label>

                    <button
                      className="primary-button"
                      type="submit"
                      disabled={isSavingAdditional}
                    >
                      {isSavingAdditional
                        ? 'Guardando adicional...'
                        : additionalForm.id
                          ? 'Actualizar adicional'
                          : 'Crear adicional'}
                    </button>
                          </form>
                        </div>
                      </section>
                    </div>
                  ) : null}
                </div>
              </section>

              <button
                className="admin-profile-trigger"
                type="button"
                onClick={() => setIsAdminMenuOpen((current) => !current)}
                aria-label="Abrir opciones de cuenta"
              >
                <span />
                <span />
                <span />
              </button>

              {isAdminMenuOpen ? (
                <div className="admin-profile-menu">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPasswordModalOpen(true)
                      setIsAdminMenuOpen(false)
                    }}
                  >
                    Cambiar contraseña
                  </button>
                  <button type="button" onClick={handleLogout}>
                    Cerrar sesión
                  </button>
                </div>
              ) : null}
                </>
              ) : null}

              {isPasswordModalOpen ? (
                <div className="modal-backdrop" role="presentation">
                  <section className="admin-modal admin-modal--narrow" role="dialog" aria-modal="true">
                    <button
                      className="modal-close"
                      type="button"
                      onClick={() => {
                        setIsPasswordModalOpen(false)
                        setPasswordError('')
                        setPasswordSuccess('')
                      }}
                      aria-label="Cerrar"
                    />
                    <div className="admin-modal__body">
                      <p className="section-kicker">Seguridad</p>
                      <h2>Cambiar contraseña</h2>
                      <form className="admin-form" onSubmit={handlePasswordChange}>
                        <label>
                          Contraseña actual
                          <input
                            type="password"
                            value={passwordForm.current_password}
                            onChange={(event) =>
                              setPasswordForm((current) => ({
                                ...current,
                                current_password: event.target.value,
                              }))
                            }
                            required
                          />
                        </label>

                        <label>
                          Nueva contraseña
                          <input
                            type="password"
                            value={passwordForm.new_password}
                            onChange={(event) =>
                              setPasswordForm((current) => ({
                                ...current,
                                new_password: event.target.value,
                              }))
                            }
                            required
                          />
                        </label>

                        <label>
                          Confirmar nueva contraseña
                          <input
                            type="password"
                            value={passwordForm.confirm_password}
                            onChange={(event) =>
                              setPasswordForm((current) => ({
                                ...current,
                                confirm_password: event.target.value,
                              }))
                            }
                            required
                          />
                        </label>

                        {passwordError ? <p className="form-error">{passwordError}</p> : null}
                        {passwordSuccess ? <p className="form-success">{passwordSuccess}</p> : null}

                        <button className="primary-button" type="submit" disabled={isSavingPassword}>
                          {isSavingPassword ? 'Actualizando...' : 'Guardar nueva contraseña'}
                        </button>
                      </form>
                    </div>
                  </section>
                </div>
              ) : null}

              {successDialog ? (
                <div className="modal-backdrop" role="presentation">
                  <section
                    className="admin-modal admin-modal--narrow admin-confirmation"
                    role="dialog"
                    aria-modal="true"
                  >
                    <button
                      className="modal-close"
                      type="button"
                      onClick={() => setSuccessDialog(null)}
                      aria-label="Cerrar"
                    />
                    <div className="admin-modal__body admin-confirmation__body">
                      <div className="admin-confirmation__badge" aria-hidden="true">
                        ✓
                      </div>
                      <p className="section-kicker">Confirmación</p>
                      <h2>{successDialog.title}</h2>
                      <p>{successDialog.message}</p>
                      <button
                        className="primary-button admin-confirmation__button"
                        type="button"
                        onClick={() => setSuccessDialog(null)}
                      >
                        Entendido
                      </button>
                    </div>
                  </section>
                </div>
              ) : null}

              {deleteDialog ? (
                <div className="modal-backdrop" role="presentation">
                  <section
                    className="admin-modal admin-modal--narrow admin-confirmation"
                    role="dialog"
                    aria-modal="true"
                  >
                    <button
                      className="modal-close"
                      type="button"
                      onClick={() => setDeleteDialog(null)}
                      aria-label="Cerrar"
                    />
                    <div className="admin-modal__body admin-confirmation__body">
                      <div className="admin-confirmation__badge admin-confirmation__badge--warning" aria-hidden="true">
                        !
                      </div>
                      <p className="section-kicker">Confirmación</p>
                      <h2>{deleteDialog.title}</h2>
                      <p>{deleteDialog.message}</p>
                      <div className="admin-confirmation__actions">
                        <button
                          className="ghost-button admin-confirmation__button"
                          type="button"
                          onClick={() => setDeleteDialog(null)}
                        >
                          Cancelar
                        </button>
                        <button
                          className="primary-button admin-confirmation__button"
                          type="button"
                          onClick={handleDeleteConfirm}
                        >
                          Sí, eliminar
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              ) : null}
            </>
          )}
        </section>
      </main>
    )
  }

  if (view === 'catalogo') {
    return (
      <main className="page page--catalog">
        <section className="catalog-card catalog-card--products">
          <div className="catalog-topbar">
            <a className="catalog-home-button" href="#/" aria-label="Volver al inicio">
              ←
            </a>
          </div>

          <div className="catalog-header">
            <img className="catalog-logo" src={logoMakyp} alt="Logo de makyp_creations" />
            <div>
              <p className="catalog-brand">makyp_creations</p>
              <h1>Nuestro catálogo</h1>
              <p className="catalog-copy">
                Abre cada producto para ver su detalle, sumar adicionales y descargar
                el pedido con el total actualizado.
              </p>
              {catalogError ? <p className="catalog-notice">{catalogError}</p> : null}
            </div>
          </div>

          <div className="catalog-tabs" role="tablist" aria-label="Categorías del catálogo">
            {(['limpiapipas', 'details'] as ProductCategory[]).map((category) => (
              <button
                key={category}
                className={`catalog-tab ${
                  catalogSection === category ? 'catalog-tab--active' : ''
                }`}
                type="button"
                role="tab"
                aria-selected={catalogSection === category}
                onClick={() => setCatalogSection(category)}
              >
                {productCategoryLabels[category]}
              </button>
            ))}
          </div>

          {isCatalogLoading ? (
            <p className="empty-copy">Cargando catálogo...</p>
          ) : catalogProducts.length === 0 ? (
            <div className="empty-catalog-state">
              <p className="section-kicker">{productCategoryLabels[catalogSection]}</p>
              <h2>Esta sección estará disponible muy pronto.</h2>
              <p className="catalog-copy">
                Aquí aparecerán los productos que cargues para esta categoría desde el panel
                admin.
              </p>
            </div>
          ) : (
            <div className="products-grid">
              {catalogProducts.map((product) => (
                <article
                  className={`product-card product-card--${product.accent}`}
                  key={product.id}
                >
                  <div className="product-card__photo">
                    {getProductImage(product) ? (
                      <img
                        src={getProductImage(product)!}
                        alt={product.name}
                        style={getProductImageStyle(product.name)}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="photo-fallback">Sin imagen</div>
                    )}
                  </div>

                  <div className="product-card__content">
                    <h2>{product.name}</h2>
                    <div className="product-card__copy">
                      <p className="product-card__description">{product.description}</p>
                      <p className="product-card__includes">
                        <strong>Incluye:</strong> {product.includes}
                      </p>
                    </div>
                    <div className="product-card__footer">
                      <strong>{formatCurrency(product.price)}</strong>
                      <button
                        className="detail-button"
                        type="button"
                        onClick={() => setActiveProductId(product.id)}
                      >
                        Ver detalle
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <a className="back-link" href="#/">
            Volver al inicio
          </a>
        </section>

        {activeProduct ? (
          <div className="modal-backdrop" role="presentation">
            <section
              className="product-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="product-modal-title"
            >
              <button
                className="modal-close"
                type="button"
                onClick={() => setActiveProductId(null)}
                aria-label="Cerrar"
              />

              <div className="product-modal__photo">
                {getProductImage(activeProduct) ? (
                  <img
                    src={getProductImage(activeProduct)!}
                    alt={activeProduct.name}
                    style={getProductImageStyle(activeProduct.name)}
                  />
                ) : (
                  <div className="photo-fallback">Sin imagen</div>
                )}
              </div>

              <div className="product-modal__body product-modal__body--stacked">
                <p className="catalog-brand">makyp_creations</p>
                <h2 id="product-modal-title">{activeProduct.name}</h2>
                <p className="product-modal__description">{activeProduct.description}</p>
                <p className="product-modal__includes">
                  <strong>Incluye:</strong> {activeProduct.includes}
                </p>
                <p className="product-modal__price">{formatCurrency(activeProduct.price)}</p>

                {activeProduct.color_options.length > 0 ? (
                  <div className="modal-section">
                    <h3>Elige color</h3>
                    <div className="chip-group">
                      {activeProduct.color_options.map((color) => (
                        <button
                          key={color}
                          className={`choice-chip ${
                            selectedColor === color ? 'choice-chip--active' : ''
                          }`}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="modal-section">
                  <h3>Adicionales</h3>

                  {(['bouquet', 'flower'] as AdditionalCategory[]).map((category) => (
                    <div className="option-group option-group--modal" key={category}>
                      <h4>{additionalCategoryLabels[category]}</h4>
                      <div className="extras-stack">
                        {activeAdditionalGroups[category].map((option) => {
                          const quantity = quantities[option.id] ?? 0

                          return (
                            <article className="extra-quantity-card" key={option.id}>
                              <div className="extra-quantity-card__info">
                                <strong>{option.name}</strong>
                                <small>{option.description}</small>
                                <span>{formatCurrency(option.price)}</span>
                              </div>

                              <div className="quantity-stepper">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(option.id, quantity - 1)}
                                >
                                  -
                                </button>
                                <strong>{quantity}</strong>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(option.id, quantity + 1)}
                                >
                                  +
                                </button>
                              </div>
                            </article>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <aside className="order-summary order-summary--full">
                  <div className="summary-row">
                    <span>Valor base</span>
                    <strong>{formatCurrency(activeProduct.price)}</strong>
                  </div>

                  {selectedColor ? (
                    <div className="summary-row">
                      <span>Color elegido</span>
                      <strong>{selectedColor}</strong>
                    </div>
                  ) : null}

                  {selectedAdditionalRows.map((option) => {
                    const quantity = quantities[option.id] ?? 0

                    return (
                      <div className="summary-row" key={option.id}>
                        <span>
                          {option.name} x{quantity}
                        </span>
                        <strong>{formatCurrency(option.price * quantity)}</strong>
                      </div>
                    )
                  })}

                  <div className="summary-row summary-row--total">
                    <span>Total estimado</span>
                    <strong>{formatCurrency(orderTotal)}</strong>
                  </div>

                  <div className="summary-actions">
                    <button className="summary-button" type="button" onClick={downloadOrder}>
                      Descargar pedido
                    </button>
                  </div>

                  <pre className="export-preview">{exportText}</pre>
                </aside>
              </div>
            </section>
          </div>
        ) : null}
      </main>
    )
  }

  return (
    <main className="page">
      <a className="admin-access-link admin-access-link--home" href="#/admin">
        <span className="admin-access-link__dot" />
        <span>Admin</span>
      </a>

      <section className="landing-card">
        <div
          className="cover-photo"
          aria-hidden="true"
          style={{
            backgroundImage: `linear-gradient(rgba(255,245,249,0.18), rgba(255,245,249,0.3)), url(${coverMakyp})`,
          }}
        />

        <div className="profile-logo">
          <img src={logoMakyp} alt="Logo de makyp_creations" />
        </div>

        <div className="landing-content">
          <p className="brand-name">makyp_creations</p>
          <h1>Catálogo de Flores</h1>
          <p className="landing-copy">
            Explora nuestra colección, personaliza el pedido y ahora administra el
            catálogo desde tu propio panel.
          </p>

          <a className="catalog-button" href="#/catalogo">
            <span className="catalog-button__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M8 7.2h2.1l1-1.65c.16-.28.47-.45.8-.45h2.2c.34 0 .65.17.82.45l1 1.65H18a2.8 2.8 0 0 1 2.8 2.8v6a2.8 2.8 0 0 1-2.8 2.8H6a2.8 2.8 0 0 1-2.8-2.8v-6A2.8 2.8 0 0 1 6 7.2h2Zm4 9.1a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6Zm0-1.8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm5.05-4.95a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Z" />
              </svg>
            </span>
            Ver Catálogo
          </a>

          <div className="social-links">
            {socialLinks.map((item) => (
              <a
                key={item.name}
                className="social-link"
                href={item.href}
                target="_blank"
                rel="noreferrer"
              >
                <span className={`social-link__icon ${item.iconClass}`} aria-hidden="true">
                  {item.icon}
                </span>
                <span className="social-link__label">{item.name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
