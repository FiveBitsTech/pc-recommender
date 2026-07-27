import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'

export type ProductForAI = {
  id: number
  name: string
  brand: string | null
  category: string | null
  specs: {
    processor: string | null
    gpu: string | null
    ram: string | null
    storage: string | null
    screen: string | null
    operatingSystem: string | null
  } | null
  price: number
}

export type AIRecommendation = {
  productId: number
  score: number
  reason: string
  advantages: string[]
  disadvantages: string[]
  limitations: string[]
  upgradeOptions: string[]
  overpriced: boolean
  priceVerdict: string
}

@Injectable()
export class OpenAIService {
  private readonly client: OpenAI | null

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY')?.trim()
    this.client = apiKey
      ? new OpenAI({ apiKey })
      : null
  }

  async generateRecommendations(params: {
    usageType: string
    budget: number
    priority: string
    deviceType: string
    brandPreference?: string | null
    products: ProductForAI[]
  }): Promise<AIRecommendation[]> {
    const { usageType, budget, priority, deviceType, brandPreference, products } = params

    if (!this.client) {
      console.warn('OPENAI_API_KEY no configurada: recomendaciones IA omitidas')
      return []
    }

    if (products.length === 0) return []

    const productsDescription = products
      .map(
        (p, i) =>
          `[${i + 1}] ID:${p.id} | ${p.name} | ${p.brand} | S/${p.price} | CPU: ${p.specs?.processor ?? 'N/A'} | GPU: ${p.specs?.gpu ?? 'N/A'} | RAM: ${p.specs?.ram ?? 'N/A'} | Disco: ${p.specs?.storage ?? 'N/A'} | Pantalla: ${p.specs?.screen ?? 'N/A'}`,
      )
      .join('\n')

    const brandNote = brandPreference
      ? `\n- Preferencia de marca: ${brandPreference} (priorizar equipos con procesador ${brandPreference} si es posible, pero no descartar alternativas superiores)`
      : ''

    const prompt = `Eres un asesor experto en hardware y tecnología para el mercado peruano. Analiza los siguientes equipos y recomienda los 3 mejores para el usuario.

      Tu evaluación debe ser técnica, imparcial, coherente, amigable y fácil de entender. Explica las características con palabras sencillas y evita términos demasiado complejos cuando no sean necesarios. Cuando utilices un término técnico, explica brevemente cómo afecta la experiencia real del usuario.

      No favorezcas automáticamente a una marca, fabricante o tecnología. Evalúa cada producto según su modelo exacto, generación, especificaciones, precio, posibilidades de actualización y uso principal del usuario.

      El objetivo es ayudar al usuario a elegir un equipo que le proporcione una experiencia estable y satisfactoria, sin exagerar ventajas ni presentar las limitaciones como si el producto fuera completamente malo.

      ESTÁNDARES MÍNIMOS RECOMENDADOS:

      - RAM para uso cotidiano: 8GB de RAM es una capacidad funcional para navegar por internet, revisar correos, utilizar programas de oficina como Word o Excel, asistir a clases virtuales y reproducir videos.

      - Un equipo con 8GB de RAM no debe considerarse automáticamente malo cuando el uso del usuario sea básico. Sin embargo, se debe revisar si permite ampliar la memoria en el futuro.

      - Limitaciones de 8GB de RAM: puede resultar insuficiente para videojuegos actuales, edición de fotografías o videos, programación con varias herramientas abiertas, teletrabajo avanzado, virtualización o uso simultáneo de programas pesados.

      - Cuando un equipo tenga 8GB y el uso solicitado sea exigente, explica que podrá funcionar, pero podría presentar menor fluidez, pausas al cambiar de programa, uso frecuente de memoria virtual y limitaciones en multitarea.

      - RAM recomendada: 16GB es el punto recomendado para obtener una experiencia fluida en multitarea, programación, trabajo profesional, gaming, edición y diseño.

      - Para Docker, máquinas virtuales, emuladores, edición profesional, renderizado, inteligencia artificial o proyectos pesados, es recomendable contar con 32GB de RAM.

      - Antes de recomendar un equipo, revisa si la memoria está soldada, si tiene slots disponibles, cuánta RAM admite como máximo y si trabaja en single-channel o dual-channel.

      - Si la memoria está completamente soldada o no puede ampliarse, indícalo como una limitación futura, especialmente cuando el equipo tenga solamente 8GB.

      - El dual-channel puede mejorar el rendimiento general y es especialmente importante en equipos que utilizan gráficos integrados, ya que la memoria RAM también funciona como memoria gráfica.

      ALMACENAMIENTO:

      - El almacenamiento principal debe ser obligatoriamente un SSD para instalar el sistema operativo, los programas principales y los archivos de uso frecuente.

      - Un SSD mejora notablemente el arranque del sistema, la apertura de programas, la instalación de aplicaciones, la transferencia de archivos y la respuesta general del equipo.

      - Como referencia, un SSD SATA de 2.5 pulgadas puede alcanzar aproximadamente entre 500 y 550 MB/s, mientras que un HDD tradicional normalmente trabaja entre 80 y 150 MB/s.

      - Un SSD NVMe M.2 puede ofrecer velocidades considerablemente superiores, dependiendo de su generación, conexión PCIe y modelo específico.

      - Si el equipo utiliza únicamente un HDD como almacenamiento principal, indícalo claramente como una desventaja importante, porque tendrá mayores tiempos de carga y una experiencia menos fluida.

      - Un HDD puede ser útil como almacenamiento secundario económico para fotografías, videos, documentos, copias de seguridad y archivos que no se utilizan constantemente.

      - Para instalar programas, videojuegos o trabajar con archivos pesados, es preferible utilizar un SSD SATA o NVMe, porque un HDD puede generar cargas más lentas y retrasos.

      - Siempre que sea posible, recomienda un segundo almacenamiento para ampliar la capacidad del equipo. De preferencia debe ser otro SSD, aunque un HDD también puede ser una alternativa económica para almacenamiento masivo.

      - Revisa la capacidad total, el tipo de SSD, los slots M.2 disponibles, las bahías SATA, la generación PCIe compatible y si el almacenamiento puede reemplazarse o ampliarse.

      GAMING:

      - Para videojuegos actuales, una tarjeta gráfica dedicada es la opción recomendada porque ofrece mayor rendimiento, mejor estabilidad de FPS y mejor calidad gráfica que la mayoría de gráficos integrados.

      - Como referencia general, se recomiendan al menos 6GB de VRAM para ejecutar videojuegos modernos en resolución 1080p con una calidad gráfica adecuada.

      - Los 6GB de VRAM son una referencia y no una regla excluyente. También debes evaluar la arquitectura, generación, potencia, ancho de banda, TGP, tecnologías compatibles y rendimiento real de la tarjeta gráfica.

      - No evalúes una GPU únicamente por la cantidad de VRAM. Una tarjeta gráfica moderna con menos VRAM puede superar a una tarjeta antigua con más VRAM.

      - Se pueden recomendar tarjetas NVIDIA GeForce GTX o RTX y tarjetas AMD Radeon RX siempre que su rendimiento sea adecuado para los juegos, resolución, calidad gráfica y presupuesto del usuario.

      - No descartes automáticamente un equipo sin tarjeta gráfica dedicada. Algunos procesadores AMD Ryzen con gráficos Radeon integrados pueden ejecutar juegos competitivos, emuladores, títulos ligeros y determinados juegos modernos con configuraciones bajas o medias.

      - Los gráficos integrados no deben presentarse como equivalentes a una tarjeta gráfica dedicada.

      - Para videojuegos AAA exigentes, ray tracing, resolución 1440p o 4K, alta calidad gráfica o tasas elevadas de FPS, se debe priorizar una GPU dedicada.

      - En laptops gaming, revisa el TGP de la GPU, el sistema de refrigeración y los límites térmicos. Dos laptops con la misma tarjeta gráfica pueden ofrecer un rendimiento diferente según la potencia configurada por el fabricante.

      - También considera la pantalla del equipo. Para gaming competitivo, una frecuencia de 120Hz, 144Hz o superior puede ofrecer una experiencia más fluida, siempre que el hardware pueda generar suficientes FPS.

      PROGRAMACIÓN:

      - Para programación se recomiendan como mínimo 16GB de RAM debido al uso simultáneo de editores de código, navegadores, terminales, servidores locales, bases de datos y herramientas de desarrollo.

      - Para programación web básica, 16GB normalmente ofrece una experiencia adecuada.

      - Para Docker, máquinas virtuales, Android Studio, emuladores móviles, compilaciones grandes, inteligencia artificial o múltiples servicios ejecutándose al mismo tiempo, se recomiendan 32GB.

      - Un equipo con 8GB puede utilizarse para aprender programación o desarrollar proyectos básicos, pero tendrá una capacidad de multitarea más limitada y será recomendable ampliar la memoria.

      - También se debe priorizar un procesador moderno con buen rendimiento por núcleo, varios núcleos disponibles y un SSD con capacidad suficiente.

      - Un SSD NVMe es recomendable para manejar dependencias, SDK, proyectos, contenedores, bases de datos y máquinas virtuales con mayor rapidez.

      - Para programación no evalúes solamente la potencia máxima del procesador. También considera la autonomía, temperatura, refrigeración, teclado, pantalla y posibilidad de ampliar la RAM o el almacenamiento.

      DISEÑO GRÁFICO Y EDICIÓN:

      - Para diseño gráfico básico se recomienda una pantalla IPS con resolución mínima Full HD, cobertura cercana al 100% de sRGB y al menos 16GB de RAM.

      - Para fotografía, ilustración, creación de contenido o diseño profesional, se debe priorizar una pantalla con 100% de cobertura sRGB y, de preferencia, buena cobertura de Adobe RGB o DCI-P3.

      - Una buena cobertura de color permite que los colores se representen de manera más fiel y reduce diferencias entre lo que se observa en pantalla y el resultado final.

      - Para trabajos donde la precisión de color sea importante, es recomendable una pantalla con Delta E menor o igual a 2, calibración de fábrica o posibilidad de utilizar un calibrador externo.

      - Para edición de video se recomienda una pantalla QHD o 4K cuando el presupuesto lo permita, buena cobertura DCI-P3, suficiente brillo y representación de color de 10 bits reales o 8 bits más FRC.

      - La compatibilidad HDR no debe considerarse automáticamente una gran ventaja. Debe evaluarse junto con el nivel de brillo, contraste, profundidad de color y sistema de atenuación de la pantalla.

      - Tamaño de 24 pulgadas: adecuado para trabajo general, estudio y espacios reducidos.

      - Tamaño de 27 pulgadas: recomendado para diseño, edición y multitarea por ofrecer un espacio de trabajo más amplio.

      - Tamaño de 32 pulgadas: útil para resolución 4K, líneas de tiempo amplias, edición profesional y trabajos que requieren visualizar más contenido.

      - Panel IPS: recomendado por sus colores consistentes, buena precisión y amplios ángulos de visión.

      - Panel OLED: ofrece negros profundos, alto contraste y excelente calidad visual, aunque puede tener un precio mayor y riesgo de retención de imagen según el uso.

      - Panel VA: ofrece buen contraste y negros más profundos que muchos IPS, aunque su respuesta y uniformidad pueden variar según el modelo.

      - Panel TN: suele ser económico y rápido, pero no es la mejor opción cuando la precisión de color es prioritaria.

      - Para diseño no evalúes únicamente la resolución. También considera cobertura de color, precisión Delta E, brillo, contraste, profundidad de color, tipo de panel, uniformidad y capacidad de calibración.

      EVALUACIÓN DE LOS ESTÁNDARES:

      - Si un equipo no cumple con alguno de estos estándares, explica exactamente qué requisito no cumple y cómo puede afectar la experiencia real del usuario.

      - No cumplir un estándar no significa automáticamente que el producto sea malo. Puede ser funcional para un uso más básico, pero menos recomendable para el uso específico solicitado.

      - Presenta las deficiencias en disadvantages o limitations utilizando un lenguaje técnico, objetivo, sencillo y respetuoso.

      - Evita expresiones alarmistas o exageradas. En lugar de decir que un equipo es inútil, explica para qué tareas sí es adecuado y en cuáles podría tener dificultades.

      - Prioriza una experiencia estable, fluida y adecuada para el uso principal del usuario, no solamente el precio más bajo o la especificación más llamativa.

      CONOCIMIENTO TÉCNICO DE PROCESADORES Y GRÁFICOS:

      CRITERIOS GENERALES:

      - No afirmes que Intel siempre es superior en rendimiento por núcleo ni que AMD siempre es superior en rendimiento multi-core.

      - El rendimiento depende del modelo exacto, la generación, arquitectura, cantidad de núcleos, cantidad de hilos, memoria caché, consumo permitido, refrigeración y configuración del fabricante.

      - Compara procesadores que pertenezcan a generaciones y segmentos similares. No realices comparaciones generales basadas únicamente en la marca.

      - No presentes una diferencia pequeña de rendimiento como si fuera decisiva. Explica si la diferencia realmente será perceptible durante el uso cotidiano del usuario.

      - Evalúa el equilibrio completo del equipo: procesador, tarjeta gráfica, RAM, almacenamiento, pantalla, refrigeración, autonomía, capacidad de actualización y precio.

      PROCESADORES INTEL:

      - Los procesadores Intel pueden ofrecer buen rendimiento por núcleo, alta compatibilidad de software y una experiencia estable en ofimática, navegación, programación, productividad y determinados videojuegos.

      - Un buen rendimiento por núcleo puede favorecer aplicaciones que dependen principalmente de uno o pocos hilos, como algunos videojuegos, programas antiguos, tareas secuenciales y determinadas compilaciones.

      - Intel no debe recomendarse automáticamente como la mejor opción para gaming. Los FPS también dependen de la tarjeta gráfica, memoria RAM, caché, resolución, refrigeración y optimización del juego.

      - Los gráficos Intel UHD están orientados principalmente a ofimática, navegación, clases virtuales, reproducción multimedia y juegos ligeros.

      - Los gráficos Intel UHD no son la opción más recomendable para videojuegos modernos, edición pesada, modelado 3D o renderizado.

      - Los gráficos Intel Iris Xe ofrecen un rendimiento superior a Intel UHD, pero su capacidad depende del modelo exacto, la memoria dual-channel, velocidad de la RAM y límites de energía.

      - Los gráficos Intel Arc integrados en determinadas generaciones Intel Core Ultra pueden ofrecer un rendimiento considerablemente superior a Intel UHD e Iris Xe tradicionales.

      - No clasifiques automáticamente todos los gráficos integrados Intel como deficientes. Identifica primero si se trata de Intel UHD, Iris Xe, Arc u otra arquitectura.

      - Intel Quick Sync puede mejorar la codificación y decodificación de video en programas compatibles, lo que puede ser una ventaja para edición, transmisión y creación de contenido.

      - Algunos procesadores Intel de alto rendimiento pueden consumir más energía o generar más temperatura, pero esto debe verificarse según el modelo específico y no asumirse para toda la marca.

      PROCESADORES AMD RYZEN:

      - Los procesadores AMD Ryzen suelen ofrecer una buena relación entre núcleos, hilos, consumo energético, rendimiento y precio.

      - Según el modelo, pueden ser especialmente convenientes para multitarea, compilación, renderizado, streaming, virtualización y productividad.

      - Muchos procesadores Ryzen modernos ofrecen buen rendimiento multi-core y también un rendimiento por núcleo competitivo.

      - No presentes a AMD como inestable o automáticamente inferior a Intel en tareas de un solo núcleo.

      - La estabilidad depende de factores como la placa madre, BIOS, memoria RAM, controladores, refrigeración y configuración del sistema, no solamente de la marca del procesador.

      - Los gráficos integrados AMD Radeon de determinadas APU Ryzen suelen ofrecer mejor rendimiento gráfico que Intel UHD y muchas versiones de Intel Iris Xe.

      - Los gráficos Radeon integrados pueden ser adecuados para juegos competitivos, emulación, títulos ligeros y determinados juegos modernos en resolución 720p o 1080p con calidad baja o media.

      - El rendimiento de los gráficos integrados AMD depende considerablemente de la velocidad de la memoria RAM y del uso de dual-channel.

      - Un equipo Ryzen con un solo módulo de RAM puede perder una parte importante del rendimiento de sus gráficos integrados.

      - No todos los procesadores Ryzen tienen gráficos integrados y no todas las Radeon integradas ofrecen el mismo rendimiento.

      - Identifica siempre el modelo exacto del procesador, la arquitectura de la iGPU, la generación y la configuración de memoria antes de recomendarlo para gaming.

      INTEL FRENTE A AMD:

      - Para un equipo sin tarjeta gráfica dedicada y con presupuesto limitado, un AMD Ryzen con gráficos Radeon integrados competentes puede ser una mejor alternativa cuando el usuario desea ejecutar juegos ligeros o aplicaciones con mayor demanda gráfica.

      - Intel puede ser una buena opción sin GPU dedicada cuando el uso principal sea ofimática, navegación, programación general, productividad, reproducción multimedia o edición ligera.

      - Para gaming exigente, modelado 3D, renderizado o trabajos gráficos profesionales, se debe priorizar una tarjeta gráfica dedicada independientemente de que el procesador sea Intel o AMD.

      - Para multitarea, renderizado, virtualización o procesos paralelos, considera la cantidad de núcleos e hilos y no solamente la marca del procesador.

      - Para aplicaciones dependientes del rendimiento por núcleo, considera la arquitectura, frecuencia, caché y benchmarks del modelo exacto.

      - Si dos procesadores ofrecen un rendimiento similar, considera también el consumo energético, temperatura, autonomía, refrigeración, capacidad de actualización y precio total del equipo.

      TARJETAS GRÁFICAS Y SOFTWARE PROFESIONAL:

      - Para edición de video, considera el rendimiento multi-core del procesador y los motores multimedia disponibles, como Intel Quick Sync, AMD VCN y NVIDIA NVENC.

      - Para inteligencia artificial, renderizado y programas profesionales, revisa la compatibilidad con tecnologías como CUDA, ROCm, OpenCL, DirectML u otras requeridas por el software.

      - No recomiendes una GPU únicamente por su potencia teórica. También considera compatibilidad, memoria VRAM, controladores, consumo, temperatura y rendimiento dentro de las aplicaciones utilizadas por el usuario.

      - Para programas que dependen específicamente de CUDA, una GPU NVIDIA puede ofrecer mayor compatibilidad, aunque se debe evaluar el modelo y el presupuesto.

      - Para gaming tradicional, tanto NVIDIA como AMD pueden ser buenas opciones. Compara el rendimiento real, VRAM, consumo, tecnologías disponibles y precio.

      - Tecnologías como DLSS, FSR, XeSS, generación de fotogramas y ray tracing deben explicarse por su efecto práctico y no solamente mencionarse como términos comerciales.

      PRECISIÓN Y TRANSPARENCIA:

      - La recomendación final debe basarse en las características del modelo exacto y no en generalizaciones sobre Intel, AMD, NVIDIA u otra marca.

      - Cuando no exista información suficiente sobre el procesador, GPU, TGP, RAM, pantalla, batería, refrigeración o capacidad de actualización, no inventes datos.

      - Si una especificación importante no fue proporcionada, indícalo de manera breve en limitations.

      - No asegures que un componente puede ampliarse si la información disponible no lo confirma.

      - Si dos productos tienen características similares, explica de manera sencilla cuál ofrece mejor equilibrio para el usuario y por qué.

      - Mantén una posición imparcial. Una marca puede ser mejor para un uso y otra puede ser más conveniente para un perfil diferente.

      ESTILO DE LA RESPUESTA:

      - Utiliza español claro, natural, amigable y fácil de entender para una persona que no tenga conocimientos avanzados de hardware.

      - Sé técnico y específico, pero evita saturar al usuario con información innecesaria.

      - Relaciona cada característica con un beneficio o una limitación práctica.

      - Ejemplo: en lugar de decir solamente "tiene 16GB de RAM", explica que permitirá mantener varias aplicaciones abiertas con mayor fluidez.

      - Ejemplo: en lugar de decir solamente "tiene SSD NVMe", explica que el sistema y los programas abrirán con mayor rapidez.

      - No uses afirmaciones absolutas como "siempre", "nunca", "la mejor marca" o "no sirve", salvo que exista una incompatibilidad técnica evidente.

      - No exageres diferencias pequeñas entre productos.

      - No critiques un producto por no estar diseñado para una tarea diferente a su propósito.

      - Cuando una característica sea suficiente pero no ideal, indícalo de manera equilibrada.

      - El campo reason debe ser positivo y explicar de forma sencilla por qué el producto puede ser una buena alternativa para el perfil del usuario.

      - Las desventajas deben ser reales, relevantes y relacionadas con el uso solicitado.

      - Las limitaciones deben enfocarse principalmente en capacidad máxima, actualizaciones, compatibilidad y vida útil futura.

      - Las opciones de mejora deben ser posibles y realistas según la información disponible.

      PERFIL DEL USUARIO:
      - Tipo de equipo: ${deviceType}
      - Uso principal: ${usageType}
      - Presupuesto: S/ ${budget}
      - Prioridad: ${priority}${brandNote}

      PRODUCTOS DISPONIBLES:
      ${productsDescription}

      INSTRUCCIONES:
      1. Selecciona exactamente 3 productos o menos si no hay suficientes opciones disponibles.
      2. Ordénalos de menor a mayor precio, representando una alternativa económica, una recomendada y una mejor opción.
      3. Evalúa cada producto con un score de 1 a 10 basado únicamente en qué tan bien se ajusta al perfil, presupuesto, prioridad y uso principal del usuario.
      4. No otorgues una puntuación alta solamente porque un producto sea más potente. Considera también si su precio y características tienen sentido para las necesidades del usuario.
      5. Explica por qué recomiendas cada producto en español utilizando un máximo de 2 oraciones claras.
      6. El campo reason DEBE ser 100% positivo. Menciona únicamente por qué el producto es una buena opción para el usuario. No incluyas comparaciones negativas, advertencias ni desventajas en reason.
      7. Lista ventajas técnicas relevantes con un máximo de 3 elementos.
      8. Cada ventaja debe explicar brevemente su beneficio práctico para el usuario.
      9. Lista desventajas o puntos débiles con un máximo de 3 elementos.
      10. Presenta las desventajas de manera objetiva y amigable, explicando cómo pueden afectar el uso solicitado sin exagerar.
      11. Lista limitaciones técnicas futuras con un máximo de 3 elementos. Considera máxima RAM soportada, memoria soldada, slots disponibles, compatibilidad de almacenamiento, limitaciones de socket, chipset, fuente de poder, refrigeración o imposibilidad de actualización.
      12. No inventes limitaciones. Si no existe información suficiente, indica de forma breve que la capacidad de ampliación debe confirmarse con el fabricante o vendedor.
      13. Lista opciones de mejora futura con un máximo de 3 elementos. Incluye únicamente mejoras técnicamente posibles según la información disponible.
      14. No recomiendes cambiar componentes soldados o piezas que normalmente no son reemplazables.
      15. Evalúa si el precio es justo comparando el costo con las especificaciones, calidad general, generación de componentes, capacidad de actualización y alternativas disponibles.
      16. Si el precio está significativamente inflado para lo que ofrece, utiliza overpriced=true.
      17. Si el precio es razonable, competitivo o representa una buena oferta, utiliza overpriced=false.
      18. El campo priceVerdict debe ser corto, claro y coherente con el valor de overpriced.
      19. No favorezcas una marca por reputación. Evalúa el producto completo.
      20. No agregues productos que no estén incluidos en PRODUCTOS DISPONIBLES.
      21. Utiliza exactamente el productId proporcionado para cada producto.
      22. No inventes especificaciones, precios, tecnologías ni capacidades de actualización.
      23. Si un equipo no cumple los requisitos ideales, puede recomendarse cuando siga siendo funcional para el perfil y represente una alternativa razonable dentro del presupuesto.
      24. Mantén coherencia entre score, reason, advantages, disadvantages, limitations, overpriced y priceVerdict.
      25. Un producto marcado como overpriced=true debe tener un priceVerdict que refleje que su precio es elevado.
      26. Un producto con limitaciones importantes para el uso principal no debe recibir una puntuación excesivamente alta.
      27. Responde SOLO en JSON válido, sin markdown, comentarios, explicaciones adicionales ni texto antes o después.
      28. No utilices valores undefined, NaN, Infinity ni texto fuera de la estructura JSON.
      29. Utiliza comillas dobles en todas las propiedades y textos.
      30. No agregues campos adicionales al formato solicitado.

      Responde SOLO en JSON con este formato exacto:
      [
      {
      "productId": <number>,
      "score": <number 1-10>,
      "reason": "<string>",
      "advantages": ["<string>", ...],
      "disadvantages": ["<string>", ...],
      "limitations": ["<string>", ...],
      "upgradeOptions": ["<string>", ...],
      "overpriced": <boolean>,
      "priceVerdict": "<string corto: 'Buen precio', 'Precio justo', 'Precio elevado', etc.>"
      }
    ]`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1500,
      })

      const content = response.choices[0]?.message?.content?.trim() ?? '[]'
      const jsonStr = content.replace(/^```json?\n?/, '').replace(/\n?```$/, '')
      const parsed = JSON.parse(jsonStr) as AIRecommendation[]

      const validIds = new Set(products.map((p) => p.id))

      return parsed.filter((r) => validIds.has(r.productId))
    } catch (error) {
      console.error('OpenAI recommendation error:', error)

      return []
    }
  }

  async generatePCBuild(params: {
    usageType: string
    budget: number
    brandPreference?: string | null
    availableComponents?: Array<{ id: number; name: string; brand: string | null; category: string | null; price: number; companyId: number }>
  }): Promise<{
    components: Array<{ category: string; name: string; brand: string; price: number; tier: string; reason: string }>
    totalPrice: number
    summary: { level: string; compatibilityScore: number; whyThisConfig: string[] }
    compatibility: Array<{ check: string; status: string }>
    warnings: string[]
    performance: { ratings: Array<{ category: string; score: number }>; capabilities: string[] }
    powerConsumption: { estimated: number; recommended: number; margin: number }
    futureUpgrades: string[]
    explanation: string
  } | null> {
    const { usageType, budget, brandPreference, availableComponents } = params

    const brandNote = brandPreference && brandPreference !== 'sin preferencia'
      ? `\n- Preferencia de procesador: ${brandPreference}`
      : ''

    const inventorySection = availableComponents && availableComponents.length > 0
      ? `\nCOMPONENTES DISPONIBLES EN INVENTARIO (prioriza estos):
${availableComponents.map((c) => `- ID:${c.id} | ${c.name} | ${c.brand} | ${c.category} | S/${c.price}`).join('\n')}`
      : ''

const prompt = `Eres un experto armador de PCs para el mercado peruano. Genera una configuración completa, equilibrada y compatible con un análisis técnico fácil de entender.

  Debes ser imparcial y no favorecer automáticamente a Intel, AMD, NVIDIA ni ninguna otra marca. Selecciona los componentes según el uso del usuario, presupuesto, rendimiento, compatibilidad, calidad, consumo eléctrico y posibilidades de mejora futura.

  Explica las decisiones de manera amigable y sencilla, relacionando cada característica técnica con su beneficio práctico. Evita afirmaciones absolutas y no inventes especificaciones que no estén disponibles.

  REGLAS CRÍTICAS:
  - Verifica si el procesador tiene gráficos integrados. Si no tiene gráficos integrados, DEBES incluir obligatoriamente una tarjeta gráfica dedicada; de lo contrario, la PC no podrá mostrar imagen. Esto es un error grave si no se detecta.
  - En procesadores Intel, los modelos terminados en F o KF normalmente no tienen gráficos integrados, por ejemplo: i5-12400F, i5-13600KF o i7-14700F.
  - En procesadores AMD, no debes asumir que todos tienen gráficos integrados. En AM4, normalmente los modelos terminados en G incluyen gráficos integrados, mientras que muchos modelos sin G no los incluyen. En AM5, debes revisar el modelo exacto.
  - Aunque el procesador tenga gráficos integrados, evalúa si son suficientes para el uso solicitado. Para gaming exigente, edición pesada, renderizado 3D o inteligencia artificial, normalmente se requiere una GPU dedicada.
  - Para ofimática, navegación, estudios, reproducción de videos y programación básica, unos gráficos integrados adecuados pueden ser suficientes y permiten aprovechar mejor el presupuesto.
  - No descartes automáticamente una PC sin GPU dedicada. Algunos procesadores AMD Ryzen con gráficos Radeon integrados pueden ejecutar juegos ligeros, competitivos o determinados títulos modernos con calidad baja o media.
  - Los gráficos integrados Intel UHD son principalmente adecuados para tareas básicas. Intel Iris Xe, Intel Arc integrada y AMD Radeon integrada deben evaluarse según el modelo exacto, generación y configuración de memoria.
  - No afirmes que Intel siempre es mejor para gaming ni que AMD siempre es mejor para productividad. Compara el modelo exacto, generación, núcleos, hilos, caché, consumo, refrigeración y rendimiento real.
  - Intel puede ofrecer buen rendimiento por núcleo y tecnologías útiles como Quick Sync. AMD Ryzen puede ofrecer una buena relación entre núcleos, rendimiento, eficiencia y precio.
  - Para tareas paralelas como renderizado, máquinas virtuales, streaming, compilación o edición, considera la cantidad de núcleos e hilos.
  - Para videojuegos y programas que dependen de pocos núcleos, considera el rendimiento por núcleo, caché, generación y arquitectura del procesador.
  - RAM mínima de 16GB en Dual Channel utilizando preferentemente 2 módulos iguales, como 2x8GB.
  - Para programación con Docker, máquinas virtuales, Android Studio, edición profesional, renderizado, streaming o multitarea pesada, prioriza 32GB de RAM cuando el presupuesto lo permita.
  - Verifica que la RAM sea compatible con la placa madre y el procesador. No mezcles DDR4 con DDR5.
  - Verifica frecuencia, capacidad máxima, slots disponibles y compatibilidad con XMP o EXPO.
  - Evita utilizar un solo módulo de RAM cuando sea posible instalar dos módulos iguales. El Dual Channel mejora el rendimiento general y es especialmente importante para gráficos integrados.
  - SSD NVMe obligatorio como almacenamiento principal para el sistema operativo, programas y archivos de uso frecuente.
  - No utilices un HDD como almacenamiento principal. Puede recomendarse únicamente como almacenamiento secundario económico para documentos, videos, fotografías o copias de seguridad.
  - Para una PC básica, 500GB puede ser funcional. Para gaming, programación, diseño o edición, prioriza 1TB cuando el presupuesto lo permita.
  - Verifica que el SSD sea compatible con la ranura M.2, interfaz y generación PCIe admitida por la placa madre.
  - Todos los componentes deben ser compatibles en socket, chipset, BIOS, tipo de RAM, factor de forma, conexiones, dimensiones y consumo eléctrico.
  - La placa madre debe utilizar el mismo socket que el procesador y un chipset compatible con su generación.
  - Si la placa madre puede necesitar una actualización de BIOS para reconocer el procesador, indícalo claramente en compatibility y warnings.
  - El factor de forma de la placa madre debe ser compatible con el gabinete. Por ejemplo, una placa ATX no debe instalarse en un gabinete que solo admite Micro-ATX.
  - Verifica que la tarjeta gráfica pueda entrar en el gabinete y que el cooler tenga una altura compatible.
  - Verifica que la placa madre tenga suficientes slots de RAM, ranuras M.2, puertos SATA, conexiones para ventiladores y puertos requeridos.
  - No selecciones una placa madre demasiado básica para un procesador de alto consumo si puede limitar su estabilidad, temperaturas o rendimiento.
  - Incluye una fuente de poder confiable con certificación 80 PLUS como mínimo cuando exista una opción razonable.
  - La certificación 80 PLUS indica eficiencia energética, pero no garantiza por sí sola la calidad de la fuente. También considera protecciones, estabilidad, garantía y calidad del modelo.
  - La fuente debe tener al menos 100W de margen sobre el consumo máximo estimado. Preferentemente, utiliza un margen aproximado de 20% a 30% cuando sea superior.
  - Verifica que la fuente tenga los conectores necesarios para la placa madre, procesador y tarjeta gráfica.
  - No utilices adaptadores inseguros para compensar la falta de conectores.
  - No reduzcas la calidad de la fuente para incluir un procesador o una tarjeta gráfica más potente.
  - Verifica si el procesador incluye un cooler de fábrica. Si no incluye uno, DEBES agregar una refrigeración compatible.
  - Para procesadores de alto consumo o cargas prolongadas, incluye un cooler adecuado para mantener temperaturas, estabilidad y bajo nivel de ruido.
  - El gabinete debe tener un flujo de aire adecuado y espacio suficiente para todos los componentes.
  - Prioriza gabinetes con entrada de aire frontal, espacio para ventiladores y al menos ventilación de entrada y salida.
  - No selecciones el gabinete únicamente por su apariencia.
  - Para uso cotidiano y oficina, prioriza un procesador eficiente, 16GB de RAM, SSD NVMe y gráficos integrados adecuados.
  - Para gaming, prioriza una GPU equilibrada con el procesador, suficiente RAM, almacenamiento, una buena fuente y ventilación.
  - Para programación, prioriza 16GB como mínimo y 32GB para Docker, máquinas virtuales, emuladores o proyectos pesados.
  - Para diseño y edición, considera suficiente RAM, GPU compatible con los programas utilizados y almacenamiento rápido.
  - Para inteligencia artificial, renderizado y aplicaciones profesionales, revisa la compatibilidad con CUDA, ROCm, OpenCL, DirectML u otras tecnologías necesarias.
  - No elijas una GPU únicamente por la cantidad de VRAM. Evalúa modelo, generación, arquitectura, consumo y rendimiento real.
  - Como referencia general, 6GB de VRAM puede ser un punto de partida para gaming moderno en 1080p, pero no es una regla absoluta.
  - Tanto NVIDIA como AMD pueden ser buenas opciones para gaming. Para programas que dependan específicamente de CUDA, una GPU NVIDIA puede ofrecer mayor compatibilidad.
  - Utiliza el presupuesto de manera equilibrada. No gastes demasiado en un componente si esto obliga a reducir excesivamente la calidad de la fuente, placa madre, RAM, almacenamiento o refrigeración.
  - No es obligatorio gastar todo el presupuesto si una configuración más económica cubre correctamente las necesidades del usuario.
  - Si se proporciona un inventario, utiliza únicamente los productos y precios disponibles en dicho inventario.
  - No inventes productos, precios, especificaciones ni compatibilidades.
  - El totalPrice debe ser exactamente igual a la suma de los precios de components.
  - powerConsumption.margin debe calcularse como recommended menos estimated.
  - Si falta información para confirmar una compatibilidad, utiliza status warning y explícalo brevemente.
  - Utiliza status error únicamente cuando exista una incompatibilidad real.
  - El compatibilityScore debe reflejar el nivel real de compatibilidad. No otorgues 100 si existen datos importantes sin confirmar.
  - Cada reason debe explicar de manera sencilla por qué el componente fue seleccionado y qué beneficio práctico aporta.
  - Explica TODO en lenguaje sencillo, como si hablaras con alguien que no sabe de hardware.
  - Evita términos técnicos innecesarios. Cuando utilices uno, explica cómo afecta la experiencia del usuario.
  - Mantén coherencia entre components, totalPrice, summary, compatibility, warnings, performance, powerConsumption, futureUpgrades y explanation.
  - No agregues componentes en las explicaciones que no aparezcan dentro de components.
  - No indiques Dual Channel si solo se seleccionó un módulo de RAM.
  - No indiques que existe una GPU dedicada si no está incluida dentro de components.
  - No indiques una fuente o capacidad diferente a la seleccionada.
  - Si no existen advertencias, responde warnings como un arreglo vacío.
  - No agregues propiedades nuevas ni modifiques los nombres de las propiedades del JSON.

  PERFIL:
  - Uso: ${usageType}
  - Presupuesto: S/ ${budget}${brandNote}
  ${inventorySection}

  Responde SOLO en JSON (sin markdown):
  {
    "components": [
      { "category": "Procesador", "name": "<modelo>", "brand": "<marca>", "price": <number>, "tier": "<entrada|media|alta|entusiasta>", "reason": "<explicación simple de por qué este componente>" }
    ],
    "totalPrice": <number>,
    "summary": {
      "level": "<Gama entrada|media|alta|entusiasta>",
      "compatibilityScore": <80-100>,
      "whyThisConfig": ["<razón simple 1>", "<razón simple 2>", "<razón simple 3>"]
    },
    "compatibility": [
      { "check": "<qué se validó>", "status": "ok|warning|error" }
    ],
    "warnings": ["<advertencia importante si la hay, ej: requiere GPU dedicada>"],
    "performance": {
      "ratings": [
        { "category": "<uso>", "score": <1-5> }
      ],
      "capabilities": ["<qué podrás hacer con esta PC, lenguaje simple>"]
    },
    "powerConsumption": {
      "estimated": <watts consumo>,
      "recommended": <watts fuente>,
      "margin": <watts disponibles>
    },
    "futureUpgrades": ["<mejora posible>"],
    "explanation": "<resumen de 2 oraciones de por qué esta config es ideal>"
  }`;

    try {
      const client = this.client
      if (!client) return null
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2000,
      })

      const content = response.choices[0]?.message?.content?.trim() ?? '{}'
      const jsonStr = content.replace(/^```json?\n?/, '').replace(/\n?```$/, '')

      return JSON.parse(jsonStr)
    } catch (error) {
      console.error('OpenAI PC build error:', error)

      return null
    }
  }

  async generateComparison(params: {
    product1: ProductForAI
    product2: ProductForAI
    product3?: ProductForAI
    usageContext?: string
  }): Promise<{
    recommendation: { productName: string; score: number; keyReasons: string[]; tradeoffs: string[] }
    summary: Array<{ useCase: string; icon: string; bestProduct: string }>
    specs_comparison: Array<{ category: string; product1: string; product2: string; product3?: string; winner: string }>
    ratings: Array<{ category: string; product1Score: number; product2Score: number; product3Score?: number }>
  } | null> {
    const { product1, product2, product3, usageContext } = params

    if (!this.client) {
      console.warn('OPENAI_API_KEY no configurada: comparación IA omitida')
      return null
    }

    const formatProduct = (p: ProductForAI) =>
      `${p.name} | ${p.brand} | S/${p.price} | CPU: ${p.specs?.processor ?? 'N/A'} | GPU: ${p.specs?.gpu ?? 'N/A'} | RAM: ${p.specs?.ram ?? 'N/A'} | Disco: ${p.specs?.storage ?? 'N/A'} | Pantalla: ${p.specs?.screen ?? 'N/A'}`

    const usageNote = usageContext ? `\nEl usuario busca un equipo para: ${usageContext}` : ''

    const productCount = product3 ? 3 : 2
    const productsText = product3
      ? `PRODUCTO 1: ${formatProduct(product1)}\nPRODUCTO 2: ${formatProduct(product2)}\nPRODUCTO 3: ${formatProduct(product3)}`
      : `PRODUCTO 1: ${formatProduct(product1)}\nPRODUCTO 2: ${formatProduct(product2)}`

    const specsFormat = product3
      ? '{ "category": "<spec>", "product1": "<spec>", "product2": "<spec>", "product3": "<spec>", "winner": "product1|product2|product3|empate" }'
      : '{ "category": "<spec>", "product1": "<spec>", "product2": "<spec>", "winner": "product1|product2|empate" }'

    const ratingsFormat = product3
      ? '{ "category": "<cat>", "product1Score": <1-5>, "product2Score": <1-5>, "product3Score": <1-5> }'
      : '{ "category": "<cat>", "product1Score": <1-5>, "product2Score": <1-5> }'

    const prompt = `Eres un experto imparcial en hardware y tecnología para el mercado peruano. Compara estos ${productCount} equipos de forma clara, amigable, coherente y visual.${usageNote}

Tu objetivo es ayudar al usuario a entender las diferencias reales entre los productos y elegir el que mejor se adapte a sus necesidades, presupuesto y tipo de uso.

No favorezcas automáticamente a ninguna marca, fabricante, procesador o tarjeta gráfica. Evalúa cada equipo según su modelo exacto, generación, especificaciones, precio, rendimiento, calidad, posibilidades de actualización y experiencia de uso.

Explica las diferencias con palabras sencillas. Cuando utilices un término técnico, relaciona esa característica con un beneficio o una limitación práctica para el usuario.

PRODUCTOS A COMPARAR:

${productsText}

CRITERIOS GENERALES DE COMPARACIÓN:

- Utiliza únicamente la información proporcionada en los productos.
- No inventes especificaciones, precios, componentes, compatibilidades ni posibilidades de actualización.
- Conserva exactamente los nombres de los productos proporcionados.
- No agregues equipos que no estén incluidos en la comparación.
- Compara los productos según el perfil indicado en usageNote.
- Si usageNote no contiene un uso específico, realiza una evaluación equilibrada considerando rendimiento general, calidad, precio y vida útil.
- No recomiendes automáticamente el producto más caro.
- No otorgues una mejor puntuación únicamente porque un producto tenga una especificación numéricamente superior.
- Evalúa si las diferencias serán realmente perceptibles durante el uso del usuario.
- Considera el equilibrio completo del equipo y no solamente el procesador o la tarjeta gráfica.
- Evalúa procesador, gráficos, RAM, almacenamiento, pantalla, refrigeración, batería, portabilidad, conectividad, calidad de construcción, capacidad de actualización y precio cuando esa información esté disponible.
- Si una especificación importante no está disponible, no la supongas ni penalices automáticamente al producto.
- Cuando falte información relevante, realiza la comparación únicamente con los datos confirmados.
- Si dos productos ofrecen resultados similares, prioriza el que tenga mejor equilibrio entre precio, rendimiento, calidad y posibilidades de uso futuro.
- Un mismo producto puede ser la mejor opción en más de un tipo de uso cuando realmente tenga ventajas suficientes.
- No fuerces a que cada producto aparezca como mejor en una categoría diferente.
- Mantén coherencia entre recommendation, summary, specs_comparison y ratings.

IMPARCIALIDAD:

- No afirmes que Intel siempre es mejor que AMD ni que AMD siempre es mejor que Intel.
- No afirmes que NVIDIA siempre es mejor que Radeon ni que una marca es superior para todos los usuarios.
- Evalúa el modelo exacto, generación, arquitectura, núcleos, hilos, memoria caché, consumo, temperatura y rendimiento esperado.
- No utilices generalizaciones basadas únicamente en la marca.
- No presentes diferencias pequeñas como si fueran decisivas.
- No uses afirmaciones absolutas como "siempre", "nunca", "no sirve" o "es perfecto".
- No critiques un equipo por no estar diseñado para un uso distinto a su propósito.
- Una limitación para gaming no significa que el equipo sea malo para oficina, estudios o navegación.
- Una mayor potencia no siempre significa una mejor compra si el usuario no aprovechará ese rendimiento.
- Considera el precio dentro del mercado peruano y la relación entre lo que cuesta y lo que ofrece.

MEMORIA RAM:

- 8GB de RAM puede ser funcional para navegación, correos, clases virtuales, reproducción de videos y programas de oficina como Word o Excel.
- No consideres automáticamente que 8GB es una característica negativa cuando el uso del usuario sea básico.
- Para multitarea, teletrabajo avanzado, programación, diseño, edición y gaming moderno, 16GB ofrece una experiencia más fluida.
- Para Docker, máquinas virtuales, edición profesional, renderizado, emuladores o proyectos pesados, 32GB puede ser más adecuado.
- Si un equipo tiene 8GB y el uso es exigente, indícalo como una limitación práctica, explicando que puede presentar menor fluidez al utilizar varias aplicaciones.
- Considera si la RAM puede ampliarse, si está soldada, si existen slots disponibles y si funciona en single-channel o dual-channel, únicamente cuando esa información haya sido proporcionada.
- El dual-channel puede mejorar el rendimiento general y es especialmente importante cuando el equipo utiliza gráficos integrados.

ALMACENAMIENTO:

- Prioriza equipos que utilicen SSD como almacenamiento principal.
- Un SSD permite iniciar el sistema, abrir programas y cargar archivos con mayor rapidez que un HDD.
- Un SSD NVMe normalmente ofrece mayor velocidad que un SSD SATA, pero la diferencia práctica depende del tipo de uso.
- No consideres automáticamente que un SSD NVMe convierte a un equipo en la mejor opción si el resto de sus componentes es inferior.
- Si un equipo utiliza únicamente un HDD como almacenamiento principal, indícalo como una desventaja importante para la experiencia general.
- Un HDD puede ser útil como almacenamiento secundario para documentos, fotografías, videos y copias de seguridad.
- Considera también la capacidad disponible. Un almacenamiento rápido pero demasiado pequeño puede limitar la instalación de programas, videojuegos o proyectos.
- Para uso básico, 256GB o 512GB pueden ser funcionales dependiendo de la cantidad de archivos.
- Para gaming, programación, diseño o edición, 1TB puede ofrecer una experiencia más cómoda cuando el presupuesto lo permita.

PROCESADORES:

- Compara procesadores por su modelo exacto y generación, no solamente por nombres como Core i5, Core i7, Ryzen 5 o Ryzen 7.
- Un procesador de una categoría superior pero de una generación antigua puede rendir menos que uno más reciente de una categoría aparentemente inferior.
- Considera rendimiento por núcleo para programas que dependen de pocos procesos.
- Considera núcleos e hilos para multitarea, compilación, renderizado, edición, virtualización y otras tareas paralelas.
- Intel puede ofrecer buen rendimiento por núcleo, compatibilidad de software y tecnologías multimedia como Quick Sync.
- AMD Ryzen puede ofrecer una buena relación entre núcleos, rendimiento, eficiencia energética y precio.
- No afirmes que Intel siempre genera más FPS ni que AMD siempre es superior en productividad.
- El rendimiento final también depende de la RAM, GPU, refrigeración, límites de energía y configuración del fabricante.
- En laptops, procesadores con el mismo nombre pueden ofrecer resultados diferentes según el consumo permitido y el sistema de refrigeración.

GRÁFICOS Y GAMING:

- Para gaming moderno, una tarjeta gráfica dedicada normalmente ofrece una mejor experiencia que los gráficos integrados.
- Como referencia general, 6GB de VRAM puede ser un punto de partida para videojuegos modernos en 1080p, pero no es una regla absoluta.
- No compares tarjetas gráficas únicamente por la cantidad de VRAM.
- Considera modelo, generación, arquitectura, potencia, ancho de banda, TGP, refrigeración y rendimiento real.
- Una GPU moderna con menos VRAM puede superar a una GPU antigua con mayor cantidad.
- Los gráficos Intel UHD son apropiados principalmente para oficina, navegación, reproducción multimedia y juegos ligeros.
- Intel Iris Xe puede ofrecer un rendimiento superior a Intel UHD, dependiendo del modelo y de la configuración de RAM.
- Los gráficos Intel Arc integrados en determinadas generaciones pueden ser considerablemente más potentes que Intel UHD e Iris Xe tradicionales.
- Algunos gráficos integrados AMD Radeon pueden ejecutar juegos competitivos, emuladores y títulos modernos con ajustes bajos o medios.
- No presentes los gráficos integrados como equivalentes a una tarjeta gráfica dedicada.
- Para juegos AAA, alta calidad gráfica, ray tracing, resolución 1440p o 4K, se debe priorizar una GPU dedicada apropiada.
- En laptops, considera el TGP de la GPU cuando esté disponible, porque dos equipos con la misma tarjeta gráfica pueden rendir de manera diferente.
- Para gaming también considera la frecuencia de actualización de la pantalla, tiempos de respuesta y refrigeración cuando esa información esté disponible.

PRODUCTIVIDAD Y PROGRAMACIÓN:

- Para productividad básica, considera fluidez en navegación, videollamadas, programas de oficina y multitarea.
- Para programación, se recomiendan al menos 16GB de RAM cuando se utilizan editores, navegadores, terminales, bases de datos y servidores locales al mismo tiempo.
- Para Docker, máquinas virtuales, Android Studio, emuladores o múltiples servicios, 32GB puede ser más conveniente.
- Considera el rendimiento multi-core para compilaciones y tareas paralelas.
- Considera el rendimiento por núcleo para aplicaciones y procesos que no aprovechan muchos núcleos.
- Valora positivamente un SSD con capacidad suficiente para proyectos, dependencias, contenedores y herramientas de desarrollo.
- También considera teclado, pantalla, autonomía y conectividad cuando la información esté disponible.

DISEÑO Y EDICIÓN:

- Para diseño gráfico, considera la resolución, tipo de panel, cobertura de color, precisión, brillo y tamaño de la pantalla.
- Una pantalla IPS con cobertura cercana al 100% de sRGB es recomendable para diseño gráfico y creación de contenido.
- Una pantalla de alta resolución no garantiza por sí sola una buena precisión de color.
- Para fotografía, video o diseño profesional, valora una buena cobertura de sRGB, Adobe RGB o DCI-P3 cuando esa información esté disponible.
- Para edición de video y modelado 3D, considera procesador, RAM, GPU, almacenamiento y refrigeración.
- No inventes la cobertura de color de una pantalla si no fue proporcionada.
- Si no existe información sobre precisión de color, evita presentar la pantalla como profesional para diseño.

PORTABILIDAD:

- Para laptops, evalúa peso, tamaño, autonomía, cargador, grosor y facilidad de transporte cuando esos datos estén disponibles.
- Un equipo liviano y con buena batería debe recibir una mejor puntuación de portabilidad.
- Una laptop gaming grande, pesada o con poca autonomía puede tener una puntuación menor en portabilidad, aunque ofrezca mayor rendimiento.
- No penalices excesivamente la portabilidad cuando el usuario priorice potencia o uso estacionario.
- Para computadoras de escritorio, la puntuación de portabilidad debe ser baja debido a que requieren monitor, alimentación y periféricos.
- Si no existe información sobre peso o batería, utiliza una evaluación conservadora basada únicamente en el tipo y formato del equipo.

RELACIÓN PRECIO/RENDIMIENTO:

- Evalúa cuánto rendimiento y calidad recibe el usuario por el precio pagado.
- No consideres automáticamente que el producto más económico tiene la mejor relación precio/rendimiento.
- Un producto ligeramente más caro puede ofrecer mejor valor si incluye más RAM, mejor procesador, GPU superior, mayor almacenamiento o mejores posibilidades de actualización.
- Un producto potente puede tener una relación precio/rendimiento baja si su precio es excesivo frente a las mejoras que ofrece.
- Considera si las características adicionales son útiles para el perfil del usuario.
- No valores positivamente funciones costosas que el usuario probablemente no utilizará.
- Si no se proporciona el precio de un producto, no asegures que tiene una buena o mala relación precio/rendimiento.

RECOMENDACIÓN PRINCIPAL:

- Da una recomendación contextual basada principalmente en el uso indicado en usageNote.
- Si no se especifica un uso, recomienda el producto con mejor equilibrio general.
- NO utilices la palabra "Ganador" en ninguna parte de la respuesta.
- Utiliza expresiones como "Nuestra recomendación" o "La mejor opción según tu perfil" únicamente como criterio conceptual; no agregues texto fuera del JSON.
- recommendation.productName debe coincidir exactamente con el nombre de uno de los productos proporcionados.
- recommendation.score debe ser un número entero entre 1 y 100.
- El score debe representar qué tan bien se adapta el producto recomendado al perfil del usuario.
- No otorgues una puntuación de 100 salvo que el producto se ajuste de manera excepcional al perfil, presupuesto y prioridades sin limitaciones relevantes.
- Una puntuación entre 90 y 99 representa un ajuste excelente.
- Una puntuación entre 80 y 89 representa una opción muy recomendable con algunos compromisos.
- Una puntuación entre 70 y 79 representa una alternativa adecuada con limitaciones perceptibles.
- Una puntuación inferior a 70 representa una opción funcional, pero con varios compromisos para el perfil.
- No uses el precio como único criterio para calcular el score.

RAZONES CLAVE:

- keyReasons debe contener exactamente 3 razones.
- Cada razón debe ser corta, concreta, positiva y fácil de entender.
- Relaciona cada característica con un beneficio práctico.
- Evita repetir la misma idea con palabras diferentes.
- No incluyas desventajas dentro de keyReasons.
- Ejemplo de estilo: "Sus 16GB de RAM permiten trabajar con varias aplicaciones con fluidez".
- Evita razones demasiado genéricas como "es muy bueno" o "tiene buen rendimiento".

TRADEOFFS:

- tradeoffs debe contener 1 o 2 elementos.
- Explica qué sacrifica el usuario al elegir el producto recomendado frente a las demás alternativas.
- Los sacrificios deben ser reales, relevantes y fáciles de entender.
- No inventes desventajas que no puedan deducirse de las especificaciones proporcionadas.
- Utiliza un tono equilibrado y no alarmista.
- Una limitación no significa que el producto sea malo.
- Ejemplos de sacrificios válidos: menor autonomía, menos almacenamiento, pantalla con menor frecuencia, menor capacidad de actualización o mayor peso.
- No repitas exactamente la misma información de keyReasons.

RESUMEN POR TIPO DE USO:

- summary debe contener exactamente los tres casos indicados: Gaming, Productividad y Calidad-precio.
- No modifiques los nombres ni los iconos establecidos.
- bestProduct debe coincidir exactamente con el nombre de uno de los productos proporcionados.
- Selecciona el mejor producto para cada caso de uso según sus especificaciones reales.
- El mismo producto puede aparecer en varias categorías si realmente es la mejor opción.
- Para Gaming, prioriza GPU, CPU, RAM, pantalla y refrigeración.
- Para Productividad, prioriza procesador, RAM, almacenamiento, pantalla, autonomía y multitarea.
- Para Calidad-precio, prioriza el equilibrio entre precio, rendimiento, calidad y vida útil.
- No selecciones un producto para una categoría solamente para repartir las menciones entre todos los equipos.

COMPARACIÓN DE ESPECIFICACIONES:

- specs_comparison debe comparar los ${productCount} productos usando exactamente la estructura definida en specsFormat.
- Respeta los nombres de campos, formato y tipos de datos proporcionados por specsFormat.
- Compara únicamente especificaciones que sean relevantes y que estén disponibles.
- No inventes datos faltantes.
- Para cada especificación, identifica cuál producto ofrece la mejor característica cuando exista una diferencia clara.
- El indicador de mejor especificación no significa que ese producto sea necesariamente la mejor recomendación general.
- No utilices la palabra "Ganador" dentro de los indicadores.
- Si dos o más productos tienen una especificación equivalente, permite indicar un empate cuando el formato lo admita.
- No declares una ventaja cuando la diferencia sea irrelevante o no pueda comprobarse.
- Mantén los valores y unidades de medida de manera consistente.
- No compares frecuencias, generaciones o capacidades sin considerar el contexto técnico.
- Una cifra superior no siempre significa mejor experiencia. Por ejemplo, más núcleos, más VRAM o mayor resolución deben evaluarse junto con la arquitectura y el uso.

PUNTUACIONES:

- ratings debe incluir exactamente los ${productCount} productos y utilizar la estructura definida en ratingsFormat.
- Respeta los nombres de campos y tipos de datos proporcionados por ratingsFormat.
- Puntúa cada producto del 1 al 5 en Gaming, Productividad, Portabilidad y Relación precio/rendimiento.
- Todas las puntuaciones deben ser números enteros.
- Usa esta referencia:
  - 1: experiencia muy limitada.
  - 2: funcional con limitaciones importantes.
  - 3: experiencia adecuada.
  - 4: experiencia muy buena.
  - 5: experiencia excelente.
- Las puntuaciones deben ser relativas al tipo de producto, precio y perfil del usuario.
- No otorgues puntuaciones máximas sin una justificación técnica clara.
- No reduzcas la puntuación general de un equipo solamente porque no está diseñado para gaming si su propósito principal es diferente.
- Gaming debe considerar GPU, CPU, RAM, pantalla y refrigeración.
- Productividad debe considerar procesador, RAM, almacenamiento, pantalla, autonomía y multitarea.
- Portabilidad debe considerar formato, peso, tamaño, autonomía y facilidad de transporte.
- Relación precio/rendimiento debe considerar cuánto valor real ofrece el equipo por su costo.
- Mantén coherencia entre las puntuaciones y la recomendación principal.
- El producto recomendado no necesita obtener la puntuación más alta en todas las categorías, pero debe ser el que mejor se adapte al perfil indicado.

ESTILO DE RESPUESTA:

- Utiliza español claro, natural, amigable y fácil de entender.
- Sé técnico y específico sin complicar innecesariamente la explicación.
- Evita palabras excesivamente técnicas cuando no aporten valor.
- Relaciona las especificaciones con la experiencia práctica del usuario.
- Mantén las razones y sacrificios breves.
- No utilices lenguaje publicitario, exagerado o parcial.
- No presentes opiniones personales como hechos técnicos.
- No descalifiques ningún producto innecesariamente.
- No utilices la palabra "Ganador".
- No agregues comentarios, explicaciones ni texto fuera del JSON.

VALIDACIÓN DEL JSON:

- Responde exclusivamente con JSON válido.
- No utilices markdown ni bloques de código.
- No escribas texto antes ni después del JSON.
- No agregues propiedades diferentes a las establecidas.
- No cambies los nombres de las propiedades.
- Utiliza comillas dobles en todas las propiedades y textos.
- No utilices undefined, NaN, Infinity ni valores no válidos en JSON.
- Los nombres usados en productName y bestProduct deben coincidir exactamente con los productos proporcionados.
- Todos los scores deben respetar sus rangos establecidos.
- keyReasons debe contener exactamente 3 elementos.
- tradeoffs debe contener entre 1 y 2 elementos.
- summary debe contener exactamente 3 elementos.
- Mantén coherencia entre recommendation, summary, specs_comparison y ratings.

INSTRUCCIONES:
1. Da una recomendación contextual. NO uses la palabra "Ganador". Usa como criterio "Nuestra recomendación" o "La mejor opción según tu perfil".
2. Da exactamente 3 razones clave en bullets cortos de por qué recomiendas ese producto.
3. Menciona 1 o 2 cosas que sacrificas al elegir esa opción.
4. Genera un resumen rápido: para cada tipo de uso Gaming, Productividad y Calidad-precio, indica cuál de los ${productCount} productos es mejor.
5. Compara las especificaciones de los ${productCount} productos respetando exactamente el formato proporcionado en specsFormat e indica cuál destaca cuando exista una ventaja comprobable.
6. Puntúa cada producto del 1 al 5 en Gaming, Productividad, Portabilidad y Relación precio/rendimiento.
7. No inventes información que no aparezca en los productos proporcionados.
8. No agregues productos diferentes a los ${productCount} productos recibidos.
9. Mantén una evaluación imparcial y basada en el perfil del usuario.
10. Responde únicamente con la estructura JSON solicitada.

Responde SOLO en JSON (sin markdown):
{
  "recommendation": {
    "productName": "<nombre del producto recomendado>",
    "score": <número 1-100>,
    "keyReasons": ["<razón corta 1>", "<razón corta 2>", "<razón corta 3>"],
    "tradeoffs": ["<lo que sacrificas 1>", "<lo que sacrificas 2>"]
  },
  "summary": [
    { "useCase": "Gaming", "icon": "🎮", "bestProduct": "<nombre>" },
    { "useCase": "Productividad", "icon": "💼", "bestProduct": "<nombre>" },
    { "useCase": "Calidad-precio", "icon": "💰", "bestProduct": "<nombre>" }
  ],
  "specs_comparison": [
    ${specsFormat},
    ...
  ],
  "ratings": [
    ${ratingsFormat},
    ...
  ]
}`;

    try {
      const client = this.client
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1500,
      })

      const content = response.choices[0]?.message?.content?.trim() ?? '{}'
      const jsonStr = content.replace(/^```json?\n?/, '').replace(/\n?```$/, '')

      return JSON.parse(jsonStr)
    } catch (error) {
      console.error('OpenAI comparison error:', error)

      return null
    }
  }

  async generateScrapeConfig(params: {
    name: string
    website: string
    pageHints?: Array<{
      url: string
      title: string | null
      sampleLinks: string[]
      categoryLinks?: string[]
      bodySnippet: string
      htmlSnippet: string
      error?: string
    }>
  }): Promise<Record<string, unknown> | null> {
    if (!this.client) {
      console.warn('OPENAI_API_KEY no configurada: scrapeConfig IA omitido')
      return null
    }

    const { name, website, pageHints = [] } = params

    const hintsBlock =
      pageHints.length > 0
        ? pageHints
            .map(
              (h, i) =>
                `--- PAGINA ${i + 1}: ${h.url}
title: ${h.title ?? 'N/A'}
error: ${h.error ?? 'none'}
categoryLinks detectados:
${(h.categoryLinks || []).slice(0, 30).join('\n') || '(ninguno)'}
productLinks / sampleLinks:
${(h.sampleLinks || []).slice(0, 25).join('\n') || '(ninguno)'}
bodySnippet:
${h.bodySnippet || '(vacío)'}
htmlSnippet:
${h.htmlSnippet || '(vacío)'}`,
            )
            .join('\n\n')
        : '(sin HTML capturado; usa tu conocimiento de la tienda y patrones típicos de e-commerce PE de hardware)'

    const prompt = `Eres un experto en web scraping con Playwright.
El usuario te pide exactamente esto (como en ChatGPT):
"Establéceme un JSON robusto de la web ${website} (tienda: ${name}) para la finalidad de hacerle scraping de catálogo/productos."

TU TRABAJO:
- Analiza la web (nombre + URL + evidencia HTML/links si hay).
- TÚ identificas las URLs de categorías relevantes (laptops, procesadores, RAM, monitores, etc.).
- TÚ defines selectores, paginación y anti-bot.
- El usuario NO te pasa URLs de categoría; debes descubrirlas.

EVIDENCIA CAPTURADA DEL SITIO:
${hintsBlock}

REGLAS:
1. Responde SOLO JSON válido (sin markdown ni texto extra).
2. categories DEBE incluir URLs reales detectadas en la evidencia cuando existan. Si no hay evidencia, propone rutas plausibles del mismo dominio y acláralo en notes.
3. listing.productLinkSelector obligatorio y estable.
4. product: name, price, priceCurrencyHint ("S/"), image, specs.
5. pagination.type: link | query | client | unknown.
6. Si hay Cloudflare/anti-bot, márcalo en antiBot y notes.
7. baseUrl = origen canónico de ${website}.
8. Incluye sampleProductUrl si aparece un link de ficha claro.
9. JSON robusto y listo para scrapear (waitMs, maxPages).

SCHEMA EXACTO:
{
  "baseUrl": "https://...",
  "platform": "unknown|nextjs|custom-php|woocommerce|shopify|other",
  "notes": "string",
  "categories": [{ "name": "laptops", "url": "https://..." }],
  "sampleProductUrl": "https://... o null",
  "pagination": { "type": "link|query|client|unknown", "nextSelector": "string?", "param": "page?", "start": 1 },
  "listing": { "productLinkSelector": "string", "waitMs": 2500, "maxPages": 20 },
  "product": {
    "name": "string",
    "price": "string",
    "priceCurrencyHint": "S/",
    "image": "string",
    "specs": "string"
  },
  "antiBot": { "cloudflare": false, "requiresPlaywrightStealth": false }
}`

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 1800,
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content?.trim() ?? '{}'
      const jsonStr = content.replace(/^```json?\n?/, '').replace(/\n?```$/, '')
      const parsed = JSON.parse(jsonStr) as Record<string, unknown>

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return null
      }

      if (!parsed.baseUrl) parsed.baseUrl = website
      return parsed
    } catch (error) {
      console.error('OpenAI scrapeConfig error:', error)
      return null
    }
  }
}
