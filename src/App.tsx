import { useEffect, useMemo, useState, type ReactNode } from 'react'
import logoMakyp from './assets/Logomakyp.png'
import coverMakyp from './assets/makyp.jpeg'
import './App.css'

type View = 'home' | 'catalogo'

type SocialLink = {
  name: string
  href: string
  iconClass: string
  icon: ReactNode
}

type AdditionalOption = {
  id: string
  name: string
  price: number
  description: string
}

type Product = {
  id: string
  name: string
  description: string
  includes: string
  price: number
  accent: string
  image: string
  colorOptions?: string[]
}

type Quantities = Record<string, number>

const getViewFromHash = (): View =>
  window.location.hash === '#/catalogo' ? 'catalogo' : 'home'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)

const products: Product[] = [
  {
    id: 'bouquet-liritu',
    name: 'Bouquet Liritu',
    description:
      'Puedes elegir el color de tu preferencia: rosa, morado, azul, amarillo.',
    includes:
      '1 lirio con borde blanco, 1 tulipan de 4 puntas, 3 margaritas y tarjeta personalizada.',
    price: 25000,
    accent: 'lila',
    image: '/assets',
    colorOptions: ['Rosa', 'Morado', 'Azul', 'Amarillo'],
  },
  {
    id: 'alianza-de-oro',
    name: 'Bouquet Alianza de Oro',
    description:
      'Los girasoles y las rosas poseen una armonia natural; una combinacion clasica que nunca deja de cautivar.',
    includes:
      '1 lirio girasol grande, 1 rosa, 4 margaritas y tarjeta personalizada.',
    price: 35000,
    accent: 'gold',
    image: '/assets/productos/bouquet-alianza-de-oro.jpg',
  },
  {
    id: 'valle-de-tulipanes',
    name: 'Bouquet Valle de Tulipanes',
    description:
      'Puedes elegir el color de tu preferencia: rosa, morado, azul, amarillo.',
    includes: '7 tulipanes rellenitos, 6 margaritas y tarjeta personalizada.',
    price: 65000,
    accent: 'pink',
    image: '/assets/productos/bouquet-valle-de-tulipanes.jpg',
    colorOptions: ['Rosa', 'Morado', 'Azul', 'Amarillo'],
  },
  {
    id: 'valentia-eterna',
    name: 'Bouquet Valentia Eterna',
    description: 'Tulipanes rojos con espiritu heroico y lleno de alegria.',
    includes:
      '6 tulipanes rellenitos con detalles tematicos, acompanado de 5 margaritas y una tarjeta personalizada.',
    price: 55000,
    accent: 'berry',
    image: '/assets/productos/bouquet-valentia-eterna.jpg',
  },
  {
    id: 'rayito-de-sol',
    name: 'Maceta Rayito de Sol',
    description: 'Un pequeno detalle lleno de luz y felicidad.',
    includes:
      '1 girasol decorativo en una macetita artesanal con hojas verdes, un detalle tierno y lleno de alegria para cualquier ocasion.',
    price: 15000,
    accent: 'gold',
    image: '/assets/productos/maceta-rayito-de-sol.jpg',
  },
  {
    id: 'bouquet-sulli',
    name: 'Bouquet Sulli',
    description:
      'Inspirado en los tonos del personaje Sullivan, perfecto para cualquier ocasion.',
    includes:
      '3 tulipanes de 4 puntas, 3 lirios con borde en blanco, 8 margaritas, ramita y tarjeta personalizada.',
    price: 65000,
    accent: 'blue',
    image: '/assets/productos/bouquet-sulli.jpg',
  },
  {
    id: 'noche-de-mariposas',
    name: 'Bouquet Noche de Mariposas',
    description:
      'Arreglo luminoso con mariposas decorativas, ideal para sorprender con un regalo unico y especial.',
    includes:
      '21 mariposas, luces decorativas, personaje y tarjeta personalizada.',
    price: 65000,
    accent: 'lila',
    image: '/assets/productos/bouquet-noche-de-mariposas.jpg',
  },
  {
    id: 'pequeno-jardin',
    name: 'Macetas Pequeno Jardin',
    description:
      'Detalle pequeno y encantador que alegra cualquier espacio.',
    includes:
      '1 flor decorativa, hojas verdes, base tipo materita y tarjeta personalizada.',
    price: 15000,
    accent: 'mint',
    image: '/assets/productos/maceta-pequeno-jardin.jpg',
  },
  {
    id: 'dulce-presencia',
    name: 'Mini figura Dulce Presencia',
    description:
      'Ternura hecha a mano para acompanar momentos especiales.',
    includes:
      'Figura hecha a mano con corazon decorativo y tarjeta personalizada.',
    price: 35000,
    accent: 'pink',
    image: '/assets/productos/mini-figura-dulce-presencia.jpg',
  },
  {
    id: 'amigo-inseparable',
    name: 'Mini figura Amigo Inseparable',
    description: 'Un companero que ilumina cualquier momento.',
    includes: 'Figura hecha a mano a tu medida y tarjeta personalizada.',
    price: 45000,
    accent: 'blue',
    image: '/assets/productos/mini-figura-amigo-inseparable.jpg',
  },
  {
    id: 'amanecer-dorado',
    name: 'Bouquet Amanecer Dorado',
    description:
      'La armonia del amarillo y el naranja crea un detalle alegre y memorable.',
    includes:
      '4 tulipanes de 3 puntas, 3 lirios con borde en blanco, 6 margaritas, ramita y tarjeta personalizada.',
    price: 65000,
    accent: 'gold',
    image: '/assets/productos/bouquet-amanecer-dorado.jpg',
  },
  {
    id: 'jardin-de-lavanda',
    name: 'Bouquet Jardin de Lavanda',
    description: 'Puedes elegir el color de tu preferencia.',
    includes:
      '4 tulipanes de 3 puntas, 3 lirios con borde en blanco, 8 margaritas, ramita, 3 mariposas decorativas y tarjeta personalizada.',
    price: 65000,
    accent: 'lila',
    image: '/assets/productos/bouquet-jardin-de-lavanda.jpg',
    colorOptions: ['Rosa', 'Morado', 'Azul', 'Amarillo'],
  },
  {
    id: 'encanto-carmesi',
    name: 'Mini Bouquet Encanto Carmesi',
    description:
      'Un arreglo delicado y lleno de carino, ideal para expresar amor y agradecimiento.',
    includes:
      '1 tulipan de 4 puntas, 1 lirio con borde en blanco, 3 margaritas, ramita, 1 mariposa decorativa y tarjeta personalizada.',
    price: 25000,
    accent: 'berry',
    image: '/assets/productos/mini-bouquet-encanto-carmesi.jpg',
  },
  {
    id: 'pequeno-gran-logro',
    name: 'Ramo Pequeno Gran Logro',
    description:
      'Un detalle que celebra el esfuerzo y el inicio de nuevos suenos.',
    includes:
      'Figura tematica hecha a mano, 3 tulipanes de 4 puntas, envoltura especial y tarjeta personalizada.',
    price: 65000,
    accent: 'mint',
    image: '/assets/productos/ramo-pequeno-gran-logro.jpg',
  },
  {
    id: 'gala-de-primavera',
    name: 'Bouquet Gala de Primavera',
    description:
      'Puedes elegir el color de tu preferencia: rosa, morado, azul, amarillo.',
    includes:
      '4 tulipanes rellenitos, 3 lirios con borde en blanco, 8 margaritas, mariposas y tarjeta personalizada.',
    price: 68000,
    accent: 'pink',
    image: '/assets/productos/bouquet-gala-de-primavera.jpg',
    colorOptions: ['Rosa', 'Morado', 'Azul', 'Amarillo'],
  },
  {
    id: 'pequena-ilusion',
    name: 'Bouquet Pequena Ilusion',
    description: 'El detalle perfecto para celebrar momentos especiales.',
    includes:
      'Peluche decorativo, 1 lirio con borde en blanco, 4 tulipanes de 4 puntas, ramitas y tarjeta personalizada.',
    price: 70000,
    accent: 'lila',
    image: '/assets/productos/bouquet-pequena-ilusion.jpg',
  },
  {
    id: 'quinteto-de-sol',
    name: 'Bouquet Quinteto de Sol',
    description: 'Un detalle perfecto para traer alegria.',
    includes:
      '5 girasoles medianos, 4 ramitas, 5 margaritas y tarjeta personalizada.',
    price: 80000,
    accent: 'gold',
    image: '/assets/productos/bouquet-quinteto-de-sol.jpg',
  },
]

const additionalOptions: AdditionalOption[] = [
  {
    id: 'coronita',
    name: 'Coronita',
    price: 4000,
    description: 'Coronita decorativa.',
  },
  {
    id: 'mariposas',
    name: '3 Mariposas',
    price: 2000,
    description: '3 mariposas decorativas.',
  },
  {
    id: 'luces-led',
    name: 'Luces LED',
    price: 3000,
    description: 'Luces LED.',
  },
  {
    id: 'polaroid-1',
    name: 'Fotito tipo polaroid',
    price: 2000,
    description: '1 foto tipo polaroid.',
  },
  {
    id: 'polaroid-3',
    name: 'Pack 3 fotitos polaroid',
    price: 5000,
    description: '3 fotos tipo polaroid.',
  },
]

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

function App() {
  const [view, setView] = useState<View>(getViewFromHash)
  const [activeProductId, setActiveProductId] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [quantities, setQuantities] = useState<Quantities>({})
  const [copied, setCopied] = useState(false)

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
    if (!activeProduct) {
      setSelectedColor('')
      setQuantities({})
      setCopied(false)
      return
    }

    setSelectedColor(activeProduct.colorOptions?.[0] ?? '')
    setQuantities({})
    setCopied(false)
  }, [activeProduct])

  useEffect(() => {
    if (!activeProduct) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveProductId(null)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [activeProduct])

  const selectedAdditionalRows = useMemo(
    () =>
      additionalOptions.filter((option) => (quantities[option.id] ?? 0) > 0),
    [quantities],
  )

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

  const updateQuantity = (optionId: string, nextValue: number) => {
    setQuantities((current) => ({
      ...current,
      [optionId]: Math.max(0, nextValue),
    }))
  }

  const copyOrder = async () => {
    if (!exportText) {
      return
    }

    try {
      await navigator.clipboard.writeText(exportText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  const downloadOrder = () => {
    if (!exportText || !activeProduct) {
      return
    }

    const file = new Blob([exportText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = `${activeProduct.id}-pedido.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (view === 'catalogo') {
    return (
      <main className="page page--catalog">
        <section className="catalog-card catalog-card--products">
          <div className="catalog-header">
            <img
              className="catalog-logo"
              src={logoMakyp}
              alt="Logo de makyp_creations"
            />
            <div>
              <p className="catalog-brand">makyp_creations</p>
              <h1>Nuestro catalogo</h1>
              <p className="catalog-copy">
                Abre cada producto para ver su detalle, sumar adicionales y
                exportar el pedido con el total actualizado.
              </p>
            </div>
          </div>

          <div className="products-grid">
            {products.map((product) => (
              <article
                className={`product-card product-card--${product.accent}`}
                key={product.id}
              >
                <div className="product-card__photo">
                  <img
                    src={product.image}
                    alt={product.name}
                    onError={(event) => {
                      event.currentTarget.style.display = 'none'
                    }}
                  />
                  <span>Espacio para foto</span>
                </div>

                <div className="product-card__content">
                  <h2>{product.name}</h2>
                  <p>{product.description}</p>
                  <p className="product-card__includes">
                    <strong>Incluye:</strong> {product.includes}
                  </p>
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

          <a className="back-link" href="#/">
            Volver al inicio
          </a>
        </section>

        {activeProduct ? (
          <div
            className="modal-backdrop"
            onClick={() => setActiveProductId(null)}
            role="presentation"
          >
            <section
              className="product-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="product-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="modal-close"
                type="button"
                onClick={() => setActiveProductId(null)}
                aria-label="Cerrar"
              >
                ×
              </button>

              <div className="product-modal__photo">
                <img
                  src={activeProduct.image}
                  alt={activeProduct.name}
                  onError={(event) => {
                    event.currentTarget.style.display = 'none'
                  }}
                />
                <span>Espacio para foto</span>
              </div>

              <div className="product-modal__body product-modal__body--stacked">
                <p className="catalog-brand">makyp_creations</p>
                <h2 id="product-modal-title">{activeProduct.name}</h2>
                <p className="product-modal__description">{activeProduct.description}</p>
                <p className="product-modal__includes">
                  <strong>Incluye:</strong> {activeProduct.includes}
                </p>
                <p className="product-modal__price">{formatCurrency(activeProduct.price)}</p>

                {activeProduct.colorOptions ? (
                  <div className="modal-section">
                    <h3>Elige color</h3>
                    <div className="chip-group">
                      {activeProduct.colorOptions.map((color) => (
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
                  <div className="extras-stack">
                    {additionalOptions.map((option) => {
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

                <aside className="order-summary order-summary--full">
                  <div className="summary-row">
                    <span>Valor base</span>
                    <strong>{formatCurrency(activeProduct.price)}</strong>
                  </div>

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
                    <button className="summary-button" type="button" onClick={copyOrder}>
                      {copied ? 'Copiado' : 'Copiar pedido'}
                    </button>
                    <button
                      className="summary-button summary-button--secondary"
                      type="button"
                      onClick={downloadOrder}
                    >
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
          <h1>Catalogo de Flores</h1>
          <p className="landing-copy">
            Explora nuestra coleccion de hermosos arreglos florales.
          </p>

          <a className="catalog-button" href="#/catalogo">
            <span className="catalog-button__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M8 7.2h2.1l1-1.65c.16-.28.47-.45.8-.45h2.2c.34 0 .65.17.82.45l1 1.65H18a2.8 2.8 0 0 1 2.8 2.8v6a2.8 2.8 0 0 1-2.8 2.8H6a2.8 2.8 0 0 1-2.8-2.8v-6A2.8 2.8 0 0 1 6 7.2h2Zm4 9.1a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6Zm0-1.8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm5.05-4.95a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Z" />
              </svg>
            </span>
            Ver Catalogo
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
