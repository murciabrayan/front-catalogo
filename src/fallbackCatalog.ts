import type {
  AdditionalCategory,
  AdditionalFormState,
  AdditionalOption,
  Product,
  ProductFormState,
} from './types'

export const additionalCategoryLabels: Record<AdditionalCategory, string> = {
  bouquet: 'Adicionales para ramos',
  flower: 'Adicionales florales',
}

export const accentOptions = [
  { value: 'lila', label: 'Lila' },
  { value: 'gold', label: 'Dorado' },
  { value: 'pink', label: 'Rosa' },
  { value: 'berry', label: 'Carmesí' },
  { value: 'blue', label: 'Azul' },
  { value: 'mint', label: 'Menta' },
] as const

export const fallbackAdditionalOptions: AdditionalOption[] = [
  { id: 1, name: 'Coronita', description: 'Coronita decorativa para ramo.', price: 4000, category: 'bouquet', is_active: true, display_order: 1 },
  { id: 2, name: '3 Mariposas', description: 'Tres mariposas decorativas.', price: 2000, category: 'bouquet', is_active: true, display_order: 2 },
  { id: 3, name: 'Luces LED', description: 'Luces decorativas para iluminar el ramo.', price: 3000, category: 'bouquet', is_active: true, display_order: 3 },
  { id: 4, name: 'Fotito tipo polaroid', description: 'Una foto tipo polaroid.', price: 2000, category: 'bouquet', is_active: true, display_order: 4 },
  { id: 5, name: 'Pack 3 fotitos polaroid', description: 'Tres fotos tipo polaroid.', price: 5000, category: 'bouquet', is_active: true, display_order: 5 },
  { id: 6, name: 'Pétalos extra', description: 'Pétalos adicionales para dar volumen y detalle.', price: 3000, category: 'flower', is_active: true, display_order: 6 },
  { id: 7, name: 'Margaritas extra', description: 'Margaritas adicionales para complementar el arreglo.', price: 5000, category: 'flower', is_active: true, display_order: 7 },
  { id: 8, name: 'Un lirio adicional', description: 'Añade un lirio adicional al ramo.', price: 6000, category: 'flower', is_active: true, display_order: 8 },
  { id: 9, name: 'Ramitas extra', description: 'Más ramitas decorativas para el bouquet.', price: 2000, category: 'flower', is_active: true, display_order: 9 },
  { id: 10, name: 'Tulipán adicional', description: 'Tulipán extra para personalizar el arreglo.', price: 5500, category: 'flower', is_active: true, display_order: 10 },
]

const productDefinitions = [
  { id: 1, name: 'Bouquet Liritu', description: 'Puedes elegir el color de tu preferencia: rosa, morado, azul, amarillo.', includes: '1 lirio con borde blanco, 1 tulipán de 4 puntas, 3 margaritas y tarjeta personalizada.', price: 25000, accent: 'lila', colors: ['Rosa', 'Morado', 'Azul', 'Amarillo'] },
  { id: 2, name: 'Bouquet Alianza de Oro', description: 'Los girasoles y las rosas poseen una armonía natural; una combinación clásica que nunca deja de cautivar.', includes: '1 lirio girasol grande, 1 rosa, 4 margaritas y tarjeta personalizada.', price: 35000, accent: 'gold', colors: [] },
  { id: 3, name: 'Bouquet Valle de Tulipanes', description: 'Puedes elegir el color de tu preferencia: rosa, morado, azul, amarillo.', includes: '7 tulipanes rellenitos, 6 margaritas y tarjeta personalizada.', price: 65000, accent: 'pink', colors: ['Rosa', 'Morado', 'Azul', 'Amarillo'] },
  { id: 4, name: 'Bouquet Valentía Eterna', description: 'Tulipanes rojos con espíritu heroico y lleno de alegría.', includes: '6 tulipanes rellenitos con detalles temáticos, acompañado de 5 margaritas y una tarjeta personalizada.', price: 55000, accent: 'berry', colors: [] },
  { id: 5, name: 'Maceta Rayito de Sol', description: 'Un pequeño detalle lleno de luz y felicidad.', includes: '1 girasol decorativo en una macetita artesanal con hojas verdes, un detalle tierno y lleno de alegría para cualquier ocasión.', price: 15000, accent: 'gold', colors: [] },
  { id: 6, name: 'Bouquet Sulli', description: 'Inspirado en los tonos del personaje Sullivan, perfecto para cualquier ocasión.', includes: '3 tulipanes de 4 puntas, 3 lirios con borde en blanco, 8 margaritas, ramita y tarjeta personalizada.', price: 65000, accent: 'blue', colors: [] },
  { id: 7, name: 'Bouquet Noche de Mariposas', description: 'Arreglo luminoso con mariposas decorativas, ideal para sorprender con un regalo único y especial.', includes: '21 mariposas, luces decorativas, personaje y tarjeta personalizada.', price: 65000, accent: 'lila', colors: [] },
  { id: 8, name: 'Macetas Pequeño Jardín', description: 'Detalle pequeño y encantador que alegra cualquier espacio.', includes: '1 flor decorativa, hojas verdes, base tipo materita y tarjeta personalizada.', price: 15000, accent: 'mint', colors: [] },
  { id: 9, name: 'Mini figura Dulce Presencia', description: 'Ternura hecha a mano para acompañar momentos especiales.', includes: 'Figura hecha a mano con corazón decorativo y tarjeta personalizada.', price: 35000, accent: 'pink', colors: [] },
  { id: 10, name: 'Mini figura Amigo Inseparable', description: 'Un compañero que ilumina cualquier momento.', includes: 'Figura hecha a mano a tu medida y tarjeta personalizada.', price: 45000, accent: 'blue', colors: [] },
  { id: 11, name: 'Bouquet Amanecer Dorado', description: 'La armonía del amarillo y el naranja crea un detalle alegre y memorable.', includes: '4 tulipanes de 3 puntas, 3 lirios con borde en blanco, 6 margaritas, ramita y tarjeta personalizada.', price: 65000, accent: 'gold', colors: [] },
  { id: 12, name: 'Bouquet Jardín de Lavanda', description: 'Puedes elegir el color de tu preferencia.', includes: '4 tulipanes de 3 puntas, 3 lirios con borde en blanco, 8 margaritas, ramita, 3 mariposas decorativas y tarjeta personalizada.', price: 65000, accent: 'lila', colors: ['Rosa', 'Morado', 'Azul', 'Amarillo'] },
  { id: 13, name: 'Mini Bouquet Encanto Carmesí', description: 'Un arreglo delicado y lleno de cariño, ideal para expresar amor y agradecimiento.', includes: '1 tulipán de 4 puntas, 1 lirio con borde en blanco, 3 margaritas, ramita, 1 mariposa decorativa y tarjeta personalizada.', price: 25000, accent: 'berry', colors: [] },
  { id: 14, name: 'Ramo Pequeño Gran Logro', description: 'Un detalle que celebra el esfuerzo y el inicio de nuevos sueños.', includes: 'Figura temática hecha a mano, 3 tulipanes de 4 puntas, envoltura especial y tarjeta personalizada.', price: 65000, accent: 'mint', colors: [] },
  { id: 15, name: 'Bouquet Gala de Primavera', description: 'Puedes elegir el color de tu preferencia: rosa, morado, azul, amarillo.', includes: '4 tulipanes rellenitos, 3 lirios con borde en blanco, 8 margaritas, mariposas y tarjeta personalizada.', price: 68000, accent: 'pink', colors: ['Rosa', 'Morado', 'Azul', 'Amarillo'] },
  { id: 16, name: 'Bouquet Pequeña Ilusión', description: 'El detalle perfecto para celebrar momentos especiales.', includes: 'Peluche decorativo, 1 lirio con borde en blanco, 4 tulipanes de 4 puntas, ramitas y tarjeta personalizada.', price: 70000, accent: 'lila', colors: [] },
  { id: 17, name: 'Bouquet Quinteto de Sol', description: 'Un detalle perfecto para traer alegría.', includes: '5 girasoles medianos, 4 ramitas, 5 margaritas y tarjeta personalizada.', price: 80000, accent: 'gold', colors: [] },
] as const

export const fallbackProducts: Product[] = productDefinitions.map((item) => ({
  ...item,
  image_url: null,
  color_options: [...item.colors],
  additional_options: fallbackAdditionalOptions,
  is_active: true,
  display_order: item.id,
}))

export const createEmptyProductForm = (): ProductFormState => ({
  id: null,
  name: '',
  description: '',
  includes: '',
  price: '',
  accent: 'lila',
  is_active: true,
  display_order: '',
  color_option_names_text: '',
  additional_option_ids: [],
  image: null,
  image_url: null,
})

export const createEmptyAdditionalForm = (): AdditionalFormState => ({
  id: null,
  name: '',
  description: '',
  price: '',
  category: 'bouquet',
  is_active: true,
  display_order: '',
})
