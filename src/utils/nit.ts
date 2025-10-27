/**
 * Validador y normalizador de NITs colombianos (DIAN)
 *
 * Implementa el algoritmo oficial DIAN (Orden Administrativa N°4 del 27/10/1989)
 * para calcular y validar dígitos verificadores de NITs.
 *
 * Garantiza que todos los NITs en el sistema se almacenan en formato normalizado:
 *   "XXXXXXXXX-D" donde D es el dígito verificador
 */

/**
 * Multipliers serie oficial DIAN
 */
const NIT_MULTIPLIERS = [41, 37, 29, 23, 19, 17, 13, 7, 3];

/**
 * Calcula el dígito verificador (DV) de un NIT usando el algoritmo DIAN.
 *
 * Algoritmo:
 * 1. Multiplica cada dígito del NIT por la serie: 41, 37, 29, 23, 19, 17, 13, 7, 3
 * 2. Suma todos los productos
 * 3. Aplica módulo 11 al resultado
 * 4. DV = 11 - resultado (con excepciones para 0 y 1)
 *
 * @param nitSinDv - String numérico de máximo 9 dígitos, ej: "800185449"
 * @returns String con el dígito verificador calculado (0-9)
 * @throws Error si el NIT no es válido
 *
 * @example
 * ```
 * calcularDigitoVerificador("800185449") // Returns "9"
 * calcularDigitoVerificador("900399741") // Returns "7"
 * ```
 */
export function calcularDigitoVerificador(nitSinDv: string): string {
  // Limpiar y validar
  const nitClean = nitSinDv.trim().replace(/\./g, '').replace(/-/g, '');

  // Validar que sea numérico
  if (!/^\d+$/.test(nitClean)) {
    throw new Error(`NIT debe contener solo dígitos. Recibido: '${nitSinDv}'`);
  }

  // Validar longitud (máximo 9 dígitos)
  if (nitClean.length > 9) {
    throw new Error(
      `NIT no puede tener más de 9 dígitos. Recibido: '${nitSinDv}' (${nitClean.length} dígitos)`
    );
  }

  if (nitClean.length === 0) {
    throw new Error('NIT no puede estar vacío');
  }

  // Rellenar con ceros a la izquierda hasta 9 dígitos
  const nitPadded = nitClean.padStart(9, '0');

  // Paso 1: Multiplicar cada dígito por la serie DIAN
  let suma = 0;
  for (let i = 0; i < nitPadded.length; i++) {
    const digito = parseInt(nitPadded[i], 10);
    const producto = digito * NIT_MULTIPLIERS[i];
    suma += producto;
  }

  // Paso 2: Aplicar módulo 11
  const residuo = suma % 11;

  // Paso 3: Calcular dígito verificador
  let dv: number;
  if (residuo === 0) {
    dv = 0;
  } else if (residuo === 1) {
    dv = 1;
  } else {
    dv = 11 - residuo;
  }

  return dv.toString();
}

/**
 * Normaliza un NIT a formato estándar: "XXXXXXXXX-D"
 *
 * Acepta NITs en varios formatos:
 * - "800185449" → "800185449-9" (calcula DV)
 * - "800185449-9" → "800185449-9" (ya normalizado)
 * - "800.185.449" → "800185449-9" (limpia formato)
 * - "800.185.449-9" → "800185449-9" (limpia y normaliza)
 *
 * @param nit - String con el NIT en cualquier formato
 * @returns String normalizado formato "XXXXXXXXX-D"
 * @throws Error si el NIT no es válido
 *
 * @example
 * ```
 * normalizarNit("800185449") // Returns "800185449-9"
 * normalizarNit("800.185.449-9") // Returns "800185449-9"
 * ```
 */
export function normalizarNit(nit: string): string {
  // Limpiar espacios y caracteres especiales
  const nitClean = nit.trim().replace(/\./g, '').replace(/ /g, '');

  // Separar NIT y DV si ya existen
  let nitNumero: string;
  let dvProporcionado: string | null = null;

  if (nitClean.includes('-')) {
    const partes = nitClean.split('-');
    if (partes.length !== 2) {
      throw new Error(`Formato inválido de NIT. Recibido: '${nit}'`);
    }
    nitNumero = partes[0];
    dvProporcionado = partes[1];
  } else {
    nitNumero = nitClean;
  }

  // Validar que la parte numérica sea válida
  if (!/^\d+$/.test(nitNumero)) {
    throw new Error(`Parte numérica del NIT debe ser dígitos. Recibido: '${nit}'`);
  }

  if (nitNumero.length > 9) {
    throw new Error(`NIT no puede tener más de 9 dígitos. Recibido: '${nit}'`);
  }

  if (nitNumero.length === 0) {
    throw new Error('NIT no puede estar vacío');
  }

  // Calcular DV correcto
  const dvCalculado = calcularDigitoVerificador(nitNumero);

  // Si se proporcionó DV, validar que sea correcto
  if (dvProporcionado !== null) {
    if (dvProporcionado !== dvCalculado) {
      throw new Error(
        `Dígito verificador incorrecto para NIT ${nitNumero}. ` +
        `Proporcionado: ${dvProporcionado}, ` +
        `Correcto: ${dvCalculado}`
      );
    }
  }

  // Rellenar con ceros a la izquierda (máximo 9 dígitos)
  const nitNormalizado = nitNumero.padStart(9, '0');

  return `${nitNormalizado}-${dvCalculado}`;
}

/**
 * Valida un NIT y retorna un objeto indicando si es válido
 *
 * @param nit - String con el NIT a validar
 * @returns Objeto con {isValid: boolean, nit: string, error?: string}
 *
 * @example
 * ```
 * const result = validarNit("800185449");
 * if (result.isValid) {
 *   console.log(`NIT válido: ${result.nit}`); // NIT válido: 800185449-9
 * }
 * ```
 */
export function validarNit(nit: string): { isValid: boolean; nit?: string; error?: string } {
  try {
    const nitNormalizado = normalizarNit(nit);
    return { isValid: true, nit: nitNormalizado };
  } catch (error: any) {
    return { isValid: false, error: error.message };
  }
}

/**
 * Verifica si un NIT está en formato normalizado: "XXXXXXXXX-D"
 *
 * @param nit - String con el NIT a verificar
 * @returns True si está en formato "XXXXXXXXX-D", False en otro caso
 *
 * @example
 * ```
 * esNitNormalizado("800185449-9") // Returns true
 * esNitNormalizado("800185449") // Returns false
 * ```
 */
export function esNitNormalizado(nit: string): boolean {
  // Patrón: exactamente 9 dígitos, guión, 1 dígito
  const patron = /^\d{9}-\d$/;
  if (!patron.test(nit.trim())) {
    return false;
  }

  // Validar que el DV sea correcto
  const partes = nit.trim().split('-');
  const nitNumero = partes[0];
  const dvProporcionado = partes[1];

  try {
    const dvCalculado = calcularDigitoVerificador(nitNumero);
    return dvProporcionado === dvCalculado;
  } catch {
    return false;
  }
}
