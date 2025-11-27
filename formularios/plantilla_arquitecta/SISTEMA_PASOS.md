# Sistema Multi-Step (Wizard) - Formulario Portafolio

**Fecha de implementación:** 26 de noviembre de 2025  
**Versión:** 2.0

---

## 🎯 Objetivo

Transformar el formulario largo en una experiencia guiada de 3 pasos para reducir la carga cognitiva y mejorar la tasa de completado.

---

## 📊 Estructura de Pasos

### **Paso 1: Identidad & Objetivos** 
*Información básica sobre tu identidad profesional, formación y objetivos*

**Secciones incluidas:**
- 1. Identidad Profesional
- 2. Objetivo del Portafolio
- 3. Formación Académica
- 3.5. Público Objetivo y Metas del Portafolio

**Campos aproximados:** ~15-20 campos  
**Tiempo estimado:** 5-8 minutos

---

### **Paso 2: Proyectos & Evidencias**
*Experiencia laboral, habilidades técnicas y portafolio de proyectos*

**Secciones incluidas:**
- 4. Experiencia Profesional (dinámico)
- 5. Habilidades y Herramientas Técnicas
- 6. Proyectos para el Portafolio (dinámico)

**Campos aproximados:** Variable (proyectos y experiencias)  
**Tiempo estimado:** 10-15 minutos

---

### **Paso 3: Preferencias & Envío**
*Estilo visual, preferencias de comunicación y finalización*

**Secciones incluidas:**
- 7. Estilo Visual Deseado
- 8. Personalidad Profesional
- 9. Referencias o Inspiración
- 10. Elementos Extras
- 11. Preferencias de Comunicación
- 12. Consentimiento y Firma

**Campos aproximados:** ~20-25 campos  
**Tiempo estimado:** 8-10 minutos

---

## 🎨 Componentes Visuales

### 1. Indicador de Progreso (Progress Bar)

```html
<div class="progress-container">
  <div class="progress-bar">
    <div class="progress-step active" data-step="1">
      <div class="step-number">1</div>
      <div class="step-label">Identidad & Objetivos</div>
    </div>
    <div class="progress-line"></div>
    <!-- ... más pasos -->
  </div>
</div>
```

**Estados visuales:**
- **Activo**: Círculo verde con fondo, texto en verde
- **Completado**: Círculo verde con checkmark visual
- **Pendiente**: Círculo gris, texto en gris

**Responsive:**
- Desktop: Labels completos, números grandes
- Mobile: Labels reducidos, números más pequeños

---

### 2. Contenedores de Pasos

```html
<div class="form-step active" data-step="1">
  <h2 class="step-title">Paso 1: Identidad & Objetivos</h2>
  <p class="step-description">Información básica...</p>
  
  <!-- Secciones del formulario -->
  
  <div class="step-navigation">
    <button type="button" class="btn-prev">« Anterior</button>
    <button type="button" class="btn-next">Siguiente »</button>
  </div>
</div>
```

**Características:**
- Solo un paso visible a la vez
- Animación fadeIn al cambiar
- Título y descripción claros
- Botones de navegación consistentes

---

### 3. Navegación Entre Pasos

**Botones:**
- `btn-prev`: Volver al paso anterior
- `btn-next`: Avanzar al siguiente paso
- Primer paso: botón "Anterior" deshabilitado
- Último paso: indicador "Último paso"

**Comportamiento:**
- Click en "Siguiente": valida campos requeridos
- Click en "Anterior": permite retroceder sin validación
- Scroll automático al tope al cambiar paso
- Animación suave de transición

---

## 🔧 Implementación Técnica

### JavaScript - Variables Globales

```javascript
let currentStep = 1;
const totalSteps = 3;
const formSteps = document.querySelectorAll('.form-step');
const progressSteps = document.querySelectorAll('.progress-step');
const prevButtons = document.querySelectorAll('.btn-prev');
const nextButtons = document.querySelectorAll('.btn-next');
```

### Funciones Principales

#### 1. `updateStepDisplay()`
- Actualiza clases de pasos del formulario
- Actualiza indicador de progreso
- Scroll suave al tope
- Guarda progreso en localStorage

#### 2. `validateStep(step)`
- Valida campos requeridos del paso actual
- Resalta campos inválidos en rojo
- Scroll y focus al primer campo inválido
- Muestra mensaje de error
- Retorna `true/false`

#### 3. `goToStep(step)`
- Valida paso actual antes de avanzar
- Cambia al paso solicitado
- Actualiza visualización
- Previene navegación inválida

---

## ✅ Sistema de Validación

### Validación por Paso

**Antes de avanzar:**
1. Busca todos los campos `[required]` en el paso actual
2. Verifica que tengan valor (excepto checkboxes especiales)
3. Añade clase `.invalid` a campos vacíos
4. Muestra mensaje de error
5. Scroll al primer campo inválido

**Tipos de campos validados:**
- `input[type="text"]`: Debe tener valor
- `textarea`: Debe tener contenido
- `select`: Debe tener opción seleccionada
- `checkbox` individual: Debe estar marcado
- `input[type="date"]`: Debe tener fecha
- `input[type="url"]`: Debe tener URL (si es requerido)

**Campos NO validados (opcionales por diseño):**
- Checkboxes de `objetivo_portafolio` (validación especial)
- Campos sin atributo `required`

---

## 💾 Persistencia de Datos

### LocalStorage

**Guardar progreso:**
```javascript
localStorage.setItem('portfolioFormStep', currentStep);
```

**Restaurar progreso:**
```javascript
const savedStep = localStorage.getItem('portfolioFormStep');
if(savedStep){
  currentStep = parseInt(savedStep);
  updateStepDisplay();
}
```

**Limpiar progreso:**
```javascript
form.addEventListener('reset', () => {
  localStorage.removeItem('portfolioFormStep');
  currentStep = 1;
  updateStepDisplay();
});
```

**Beneficios:**
- Usuario puede cerrar navegador y continuar después
- No pierde el paso en que estaba
- Se limpia automáticamente al resetear formulario

---

## 🎨 Estilos CSS

### Variables y Colores

```css
--accent: #0f766e;      /* Verde para activo */
--accent-2: #14532d;    /* Verde oscuro */
--muted: #6b7280;       /* Gris para inactivo */
```

### Clases Principales

**Progress Bar:**
- `.progress-container`: Contenedor principal
- `.progress-bar`: Flexbox para pasos
- `.progress-step`: Cada paso individual
- `.step-number`: Círculo numerado
- `.step-label`: Texto descriptivo
- `.progress-line`: Línea conectora

**Estados:**
- `.active`: Paso actual (verde)
- `.completed`: Paso completado (verde)
- Sin clase: Pendiente (gris)

**Form Steps:**
- `.form-step`: Contenedor de paso (oculto por defecto)
- `.form-step.active`: Paso visible
- `.step-title`: Título del paso
- `.step-description`: Descripción con fondo celeste

**Navegación:**
- `.step-navigation`: Contenedor de botones
- `.btn-prev`, `.btn-next`: Botones de navegación
- `.step-indicator`: Texto informativo

**Validación:**
- `.invalid`: Borde rojo, fondo rosa claro
- `.invalid:focus`: Outline rojo

---

## 📱 Responsive Design

### Breakpoint: 768px

**Desktop (>768px):**
- Círculos de 40px
- Labels completos
- Espaciado amplio

**Mobile (≤768px):**
- Círculos de 35px
- Labels reducidos (11px)
- Max-width de 80px para labels
- Márgenes ajustados

---

## ⚡ Animaciones

### Transición de Pasos

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-step.active {
  animation: fadeIn 0.4s ease-in;
}
```

**Duración:** 0.4 segundos  
**Efecto:** Fade in con desplazamiento vertical  
**Timing:** ease-in

### Hover de Botones

```css
.btn-prev:hover, .btn-next:hover {
  background: #0d5f57;
  transform: translateY(-1px);
}
```

**Efecto:** Oscurecimiento y elevación  
**Transición:** 0.2 segundos

---

## 🔄 Flujo de Usuario

```
[Página carga]
    ↓
[Restaurar paso guardado o Paso 1]
    ↓
[Usuario completa campos]
    ↓
[Click "Siguiente"]
    ↓
[Validar campos requeridos]
    ↓
¿Válido? → No → [Mostrar errores, focus primer campo]
    ↓ Sí
[Guardar paso en localStorage]
    ↓
[Actualizar indicador de progreso]
    ↓
[Mostrar siguiente paso con animación]
    ↓
[Scroll al tope]
    ↓
[Repetir hasta Paso 3]
    ↓
[Botones finales: PDF / ZIP / Reset]
```

---

## 🧪 Testing Checklist

### Funcionalidad Básica
- [ ] Carga inicial muestra Paso 1
- [ ] Botón "Anterior" deshabilitado en Paso 1
- [ ] Botón "Siguiente" avanza al Paso 2
- [ ] Indicador de progreso se actualiza correctamente
- [ ] Animación fadeIn funciona al cambiar pasos

### Validación
- [ ] No permite avanzar con campos requeridos vacíos
- [ ] Campos inválidos se resaltan en rojo
- [ ] Scroll automático al primer campo inválido
- [ ] Mensaje de error aparece y desaparece
- [ ] Permite retroceder sin validación

### Persistencia
- [ ] Progreso se guarda en localStorage
- [ ] Progreso se restaura al recargar página
- [ ] Reset limpia localStorage
- [ ] Funciona después de cerrar/abrir navegador

### Responsive
- [ ] Progress bar se adapta en móvil
- [ ] Labels se reducen correctamente
- [ ] Botones funcionan en touch devices
- [ ] No hay overflow horizontal

### Integración
- [ ] Proyectos dinámicos funcionan en Paso 2
- [ ] Experiencias dinámicas funcionan en Paso 2
- [ ] Referencias dinámicas funcionan en Paso 3
- [ ] PDF y ZIP se generan desde Paso 3
- [ ] Validación de archivos funciona (8 max por proyecto)

---

## 📈 Métricas de Mejora

### Antes (formulario único):
- ❌ Formulario abrumador (~50+ campos visibles)
- ❌ Sin indicación de progreso
- ❌ Alta tasa de abandono probable
- ❌ Scroll excesivo para encontrar campos

### Después (3 pasos):
- ✅ Máximo 20-25 campos por paso
- ✅ Progreso visible en todo momento
- ✅ Sensación de avance constante
- ✅ Navegación clara y estructurada
- ✅ Validación progresiva
- ✅ Menor carga cognitiva

---

## 🎯 Ventajas del Sistema Multi-Step

1. **Mejor UX**: Menos abrumador, más guiado
2. **Mayor completado**: Progreso visible motiva a terminar
3. **Validación incremental**: Errores detectados paso a paso
4. **Organización lógica**: Contenido agrupado por contexto
5. **Persistencia**: No se pierde progreso al cerrar
6. **Feedback visual**: Usuario sabe dónde está siempre
7. **Mobile-friendly**: Menos scroll, más enfocado
8. **Profesional**: Aspecto moderno y cuidado

---

## 🔮 Mejoras Futuras (Opcional)

- [ ] Barra de progreso porcentual adicional
- [ ] Estimación de tiempo restante por paso
- [ ] Guardado automático de datos del formulario
- [ ] Resumen visual al final con todos los datos
- [ ] Opción de saltar pasos (modo experto)
- [ ] Teclado: Enter para siguiente, Esc para anterior
- [ ] Analytics: tiempo por paso, campos problemáticos
- [ ] Tooltips con ayuda contextual por paso

---

## 📚 Documentación de Código

### HTML
- **Archivo:** `index.html`
- **Líneas:** Progress bar en header, form-steps distribuidos
- **Atributos data:** `data-step="1|2|3"`

### CSS
- **Archivo:** `style.css`
- **Sección:** "Progress indicator" y "Form steps"
- **~80 líneas** de CSS nuevo

### JavaScript
- **Archivo:** `app.js`
- **Sección:** Inicio del DOMContentLoaded
- **~100 líneas** de JS nuevo
- **Funciones:** updateStepDisplay, validateStep, goToStep

---

## ✅ Estado del Proyecto

**Implementación:** ✅ COMPLETADA  
**Testing:** ⏳ Pendiente de pruebas exhaustivas  
**Documentación:** ✅ COMPLETA  
**Deploy:** ✅ Pusheado a GitHub

**Commit:** `5169429`  
**Fecha:** 26 de noviembre de 2025

---

## 🎉 Conclusión

El formulario ahora ofrece una experiencia mucho más amigable y profesional. Los usuarios pueden completarlo en partes, tienen feedback visual constante, y el sistema de validación previene errores antes de llegar al final.

**Resultado:** Formulario optimizado, dividido en 3 pasos claros con indicador de progreso, validación por pasos y persistencia de datos. ✨
